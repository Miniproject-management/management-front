import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, Building2, UserCheck, UserPlus } from "lucide-react";

const DashboardView = () => {
  const [stats, setStats] = useState({ 
    employees: 0, 
    departments: 0,
    managers: 0,
    newHires: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([
          api.get('/api/hr/employees'),
          api.get('/api/hr/departments/tree')
        ]);

        const empData = empRes.data;
        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

        // 통계 계산
        const managersCount = empData.filter(emp => 
          emp.position === '팀장' || emp.position === '관리자'
        ).length;

        const newHiresCount = empData.filter(emp => 
          emp.hireDate && emp.hireDate.startsWith(currentMonth)
        ).length;

        setStats({
          employees: empData.length,
          departments: deptRes.data.length,
          managers: managersCount,
          newHires: newHiresCount
        });
      } catch (error) {
        console.error("대시보드 요약 데이터를 가져오는 데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-400">데이터 집계 중...</div>;

  return (
    <div className="dashboard-content">
      <div className="tab-header">
        <h2>조직 요약</h2>
        <p>현재 등록된 전체 인원과 부서 현황입니다.</p>
      </div>

      <div className="stats-grid">
        {/* 총 임직원 카드 */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">총 임직원</span>
            <div className="stat-value-group">
              <span className="stat-num">{stats.employees}</span>
              <span className="stat-unit">명</span>
            </div>
          </div>
          <div className="stat-icon-box blue">
            <Users size={24} />
          </div>
        </div>

        {/* 총 부서 카드 */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">총 부서</span>
            <div className="stat-value-group">
              <span className="stat-num">{stats.departments}</span>
              <span className="stat-unit">개</span>
            </div>
          </div>
          <div className="stat-icon-box orange">
            <Building2 size={24} />
          </div>
        </div>

        {/* 관리직 인원 */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">관리자/팀장</span>
            <div className="stat-value-group">
              <span className="stat-num">{stats.managers}</span>
              <span className="stat-unit">명</span>
            </div>
          </div>
          <div className="stat-icon-box green">
            <UserCheck size={24} />
          </div>
        </div>

        {/* 이번 달 신규 입사자 */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">이달의 신규 입사</span>
            <div className="stat-value-group">
              <span className="stat-num">{stats.newHires}</span>
              <span className="stat-unit">명</span>
            </div>
          </div>
          <div className="stat-icon-box purple">
            <UserPlus size={24} />
          </div>
        </div>
      </div>

      <div className="recent-section">
        <div className="section-card">
          <h3>알림</h3>
          <p className="text-sm text-gray-500">상세 통계 및 최근 현황 기능은 업데이트 예정입니다.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;