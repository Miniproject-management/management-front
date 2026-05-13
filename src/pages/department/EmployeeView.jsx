import React, { useState, useEffect } from 'react';
import api from '../../api/axios'; // 인증된 axios 인스턴스
import useAuthStore from '../../stores/authStore';

const EmployeeView = () => {
    const { role } = useAuthStore();
    console.log('Current user role:', role);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    // 모달 관련 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        empName: '',
        password: '',
        deptNo: '',
        jobTitle: '',
        position: '사원',
        hireDate: ''
    });

    // 임직원 목록 조회 함수 (초기 로딩 및 등록 후 재호출용)
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/hr/employees');
            setEmployees(response.data);
        } catch (error) {
            console.error("임직원 목록 조회 실패", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // 신규 등록 모달 열기 (+ 부서 목록 조회)
    const handleOpenModal = async () => {
        setIsModalOpen(true);
        try {
            const res = await api.get('/api/hr/departments/tree');
            // 부서 목록이 배열로 온다고 가정
            setDepartments(res.data);
            
            // 폼 데이터 초기화
            setFormData({
                empName: '',
                password: '',
                deptNo: '',
                jobTitle: '',
                position: '사원',
                hireDate: ''
            });
        } catch (error) {
            console.error("부서 목록 조회 실패", error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // 폼 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 신규 임직원 등록 (POST)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 빈 값이 있는지 간단한 유효성 검사 (옵션)
            if (!formData.empName || !formData.password || !formData.deptNo || !formData.jobTitle || !formData.hireDate) {
                alert("모든 필수 항목을 입력해주세요.");
                return;
            }

            await api.post('/api/hr/employees', formData);
            alert("신규 임직원이 성공적으로 등록되었습니다.");
            handleCloseModal();
            fetchEmployees(); // 목록 새로고침
        } catch (error) {
            console.error("신규 임직원 등록 실패", error);
            alert("등록에 실패했습니다. 입력값을 확인해주세요.");
        }
    };

    return (
        <div className="employee-view">
            <div className="tab-header">
                <div>
                    <h2>임직원 관리</h2>
                    <p>전체 임직원의 명단과 상세 정보를 확인합니다.</p>
                </div>
                {/* 관리자 권한이 있을 때만 버튼 표시 */}
                {role === 'ROLE_ADMIN' && (
                    <button className="btn-primary" onClick={handleOpenModal}>
                        + 신규 임직원 등록
                    </button>
                )}
            </div>

            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>이름</th>
                            <th>부서</th>
                            <th>직무</th>
                            <th>직급</th>
                            <th>입사일</th>
                            <th className="text-center">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-10 text-gray-400">데이터를 불러오는 중입니다...</td></tr>
                        ) : employees.length > 0 ? (
                            employees.map((emp) => (
                                <tr key={emp.empNo || emp.id}>
                                    <td className="font-bold">{emp.empName}</td>
                                    <td>{emp.deptName || '소속 없음'}</td>
                                    <td>{emp.jobTitle || '-'}</td>
                                    <td>{emp.position}</td>
                                    <td>{emp.hireDate}</td>
                                    <td className="text-center">
                                        <span className="status-badge active">재직</span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="text-center py-10 text-gray-400">조회된 임직원이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 신규 임직원 등록 모달 */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    {/* 모달 내부 클릭 시 닫히지 않도록 e.stopPropagation() */}
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>신규 임직원 등록</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>이름</label>
                                    <input type="text" name="empName" value={formData.empName} onChange={handleChange} placeholder="홍길동" required />
                                </div>
                                <div className="form-group">
                                    <label>초기 비밀번호</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="임시 비밀번호 입력" required />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>부서</label>
                                    <select name="deptNo" value={formData.deptNo} onChange={handleChange} required>
                                        <option value="">부서 선택</option>
                                        {departments.map((dept) => (
                                            <option key={dept.deptNo} value={dept.deptNo}>
                                                {dept.deptName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>직무 (Job Title)</label>
                                    <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="예: Java Developer" required />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>직급</label>
                                    <select name="position" value={formData.position} onChange={handleChange} required>
                                        <option value="사원">사원</option>
                                        <option value="팀장">팀장</option>
                                        <option value="관리자">관리자</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>입사일</label>
                                    <input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    취소
                                </button>
                                <button type="submit" className="btn-primary">
                                    등록하기
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeView;