import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/DepartmentPage.css';

function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDept, setNewDept] = useState({ deptName: '', deptDesc: '' });

  // 부서 목록 불러오기
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      // 백엔드 API 연결 (트리 구조 데이터를 리스트용으로 사용하거나 별도 API 호출)
      const response = await axios.get('/api/hr/departments/tree');
      setDepartments(response.data);
    } catch (error) {
      console.error("데이터 로딩 실패", error);
    }
  };

  const handleSave = async () => {
    if (!newDept.deptName) return alert("부서명을 입력해주세요.");
    try {
      await axios.post('/api/hr/departments', newDept);
      setIsModalOpen(false);
      setNewDept({ deptName: '', deptDesc: '' });
      fetchDepartments();
    } catch (error) {
      alert("부서 등록 실패");
    }
  };

  return (
    <div className="department-container">
      {/* 1. 기존 위치 유지: 페이지 제목/인디케이터 */}
      <h1 className="page-indicator">부서관리 페이지</h1>

      {/* 2. 관리 기능 영역 */}
      <div className="management-header">
        <div className="text-group">
          <h2>부서 목록</h2>
          <p>조직의 부서 체계를 확인하고 신규 부서를 추가할 수 있습니다.</p>
        </div>
        <button className="btn-create" onClick={() => setIsModalOpen(true)}>
          + 신규 부서 생성
        </button>
      </div>

      <div className="table-wrapper">
        <table className="dept-table">
          <thead>
            <tr>
              <th>부서명</th>
              <th>설명</th>
              <th className="text-center">인원 수</th>
              <th className="text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.deptNo}>
                <td className="font-bold">{dept.deptName}</td>
                <td>{dept.deptDesc || '-'}</td>
                <td className="text-center">{dept.employeeCount || 0}명</td>
                <td className="text-center">
                  <button className="btn-more">•••</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. 신규 부서 생성 모달 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>신규 부서 등록</h3>
            <div className="form-group">
              <label>부서명</label>
              <input 
                type="text" 
                value={newDept.deptName}
                onChange={(e) => setNewDept({...newDept, deptName: e.target.value})}
                placeholder="예: 개발팀, 인사팀" 
              />
            </div>
            <div className="form-group">
              <label>부서 설명</label>
              <textarea 
                value={newDept.deptDesc}
                onChange={(e) => setNewDept({...newDept, deptDesc: e.target.value})}
                placeholder="부서 역할에 대해 설명해주세요"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>취소</button>
              <button className="btn-save" onClick={handleSave}>저장하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentPage;