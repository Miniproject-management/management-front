import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const DeptListView = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/api/hr/departments/tree');
      setDepartments(response.data);
    } catch (error) {
      console.error("부서 목록 조회 실패", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dept-view">
      <div className="tab-header">
        <div>
          <h2>부서 목록</h2>
          <p>회사 내 등록된 모든 부서 정보를 관리합니다.</p>
        </div>
        <button className="btn-primary" onClick={() => {/* 모달 오픈 로직 */}}>
          + 신규 부서 생성
        </button>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>부서명</th>
              <th>설명</th>
              <th className="text-center">인원 수</th>
              <th className="text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center py-8 text-gray-400">데이터 로딩 중...</td></tr>
            ) : departments.length > 0 ? (
              departments.map((dept) => (
                <tr key={dept.deptNo}>
                  <td className="font-bold">{dept.deptName}</td>
                  <td className="text-gray-500">{dept.deptDesc || '-'}</td>
                  <td className="text-center font-bold">{dept.employeeCount || 0}명</td>
                  <td className="text-center">
                    <button className="btn-icon">•••</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center py-8 text-gray-400">등록된 부서가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeptListView;