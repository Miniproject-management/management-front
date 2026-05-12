import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeView = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('/api/hr/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error("임직원 목록 조회 실패", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <div className="employee-view">
      <div className="tab-header">
        <h2>임직원 관리</h2>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>부서</th>
              <th>직급</th>
              <th>입사일</th>
              <th className="text-center">상태</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8">로딩 중...</td></tr>
            ) : employees.length > 0 ? (
              employees.map(emp => (
                <tr key={emp.id}>
                  <td className="font-bold">{emp.name}</td>
                  <td>{emp.deptName || '-'}</td>
                  <td>{emp.position}</td>
                  <td>{emp.joinedAt}</td>
                  <td className="text-center">
                    <span className={`status-badge ${emp.status}`}>재직</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="text-center py-8">조회된 임직원이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeView;