import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const DeptListView = () => {
  const { role } = useAuthStore();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    deptName: '',
    deptDesc: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/hr/departments/tree');
      setDepartments(response.data);
    } catch (error) {
      console.error("부서 목록 조회 실패", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({ deptName: '', deptDesc: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.deptName) {
        alert("부서명을 입력해주세요.");
        return;
      }
      await api.post('/api/hr/departments', formData);
      alert("신규 부서가 성공적으로 생성되었습니다.");
      handleCloseModal();
      fetchDepartments(); // 목록 새로고침
    } catch (error) {
      console.error("부서 생성 실패", error);
      alert("부서 생성에 실패했습니다.");
    }
  };

  return (
    <div className="dept-view">
      <div className="tab-header">
        <div>
          <h2>부서 목록</h2>
          <p>회사 내 등록된 모든 부서 정보를 관리합니다.</p>
        </div>
        {role === 'ROLE_ADMIN' && (
          <button className="btn-primary" onClick={handleOpenModal}>
            + 신규 부서 생성
          </button>
        )}
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

      {/* 신규 부서 생성 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>신규 부서 생성</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>부서명</label>
                <input 
                  type="text" 
                  name="deptName" 
                  value={formData.deptName} 
                  onChange={handleChange} 
                  placeholder="예: 마케팅팀" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>부서 설명</label>
                <textarea 
                  name="deptDesc" 
                  value={formData.deptDesc} 
                  onChange={handleChange} 
                  placeholder="부서에 대한 설명을 입력하세요"
                  rows="3"
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  취소
                </button>
                <button type="submit" className="btn-primary">
                  생성하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptListView;