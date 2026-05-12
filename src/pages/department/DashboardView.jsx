import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Building2 } from "lucide-react";

const DashboardView = () => {
  const [counts, setCounts] = useState({ employees: 0, departments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 방법 2: 기존 API 두 개를 동시에 호출해서 길이를 측정
        const [empRes, deptRes] = await Promise.all([
          axios.get('/api/hr/employees'),           // 전체 사원 목록
          axios.get('/api/hr/departments/tree')     // 전체 부서 목록 (트리 혹은 리스트)
        ]);

        setCounts({
          employees: empRes.data.length,
          departments: deptRes.data.length
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
              <span className="stat-num">{counts.employees}</span>
              <span className="stat-unit">명</span>
            </div>
          </div>
          <div className="stat-icon-box">
            <Users size={24} />
          </div>
        </div>

        {/* 총 부서 카드 */}
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">총 부서</span>
            <div className="stat-value-group">
              <span className="stat-num">{counts.departments}</span>
              <span className="stat-unit">개</span>
            </div>
          </div>
          <div className="stat-icon-box">
            <Building2 size={24} />
          </div>
        </div>

        {/* 예시 이미지의 4개 칸을 맞추기 위해 비워두거나 다른 정보 활용 가능 */}
        <div className="stat-card placeholder-card">
          <div className="stat-info">
            <span className="stat-label">진행 중인 프로젝트</span>
            <div className="stat-value-group">
              <span className="stat-num">-</span>
            </div>
          </div>
        </div>

        <div className="stat-card placeholder-card">
          <div className="stat-info">
            <span className="stat-label">오늘의 근태 현황</span>
            <div className="stat-value-group">
              <span className="stat-num">-</span>
            </div>
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