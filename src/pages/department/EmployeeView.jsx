import React, { useState, useEffect } from 'react';
import api from '../../api/axios'; // 팀장님이 수정하신 인증된 axios 인스턴스

const EmployeeView = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await api.get('/api/hr/employees');
                // 데이터가 왔을 때 콘솔에서 정확한 필드명을 한 번 더 확인해보세요.
                console.log("임직원 데이터 로드 성공:", response.data);
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
                <div>
                    <h2>임직원 관리</h2>
                    <p>전체 임직원의 명단과 상세 정보를 확인합니다.</p>
                </div>
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
                            <tr><td colSpan="5" className="text-center py-10 text-gray-400">데이터를 불러오는 중입니다...</td></tr>
                        ) : employees.length > 0 ? (
                            employees.map((emp) => (
                                <tr key={emp.empNo || emp.id}> {/* DB의 emp_no 혹은 id 사용 */}
                                    <td className="font-bold">{emp.empName}</td> {/* hire_name -> empName */}
                                    <td>{emp.deptName || '소속 없음'}</td>
                                    <td>{emp.position}</td> {/* DB의 position 컬럼 */}
                                    <td>{emp.hireDate}</td> {/* hire_date -> hireDate */}
                                    <td className="text-center">
                                        <span className="status-badge active">재직</span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="text-center py-10 text-gray-400">조회된 임직원이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeView;