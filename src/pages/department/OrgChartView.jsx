import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ChevronDown, ChevronUp, User, Building2, Crown } from 'lucide-react';

const OrgChartView = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDepts, setExpandedDepts] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, empRes] = await Promise.all([
        api.get('/api/hr/departments/tree'),
        api.get('/api/hr/employees')
      ]);
      setDepartments(deptRes.data);
      setEmployees(empRes.data);
      
      // 초기에는 모든 부서를 펼쳐둠
      const initialExpanded = {};
      deptRes.data.forEach(dept => {
        initialExpanded[dept.deptNo] = true;
      });
      setExpandedDepts(initialExpanded);
    } catch (error) {
      console.error("조직도 데이터 조회 실패", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDept = (deptNo) => {
    setExpandedDepts(prev => ({
      ...prev,
      [deptNo]: !prev[deptNo]
    }));
  };

  // 부서별 사원 그룹화
  const groupedEmployees = employees.reduce((acc, emp) => {
    const dept = emp.deptName || '소속 없음';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(emp);
    return acc;
  }, {});

  // 이름에서 첫 글자(성씨) 추출하여 원형 아이콘 색상 할당
  const getInitial = (name) => name ? name.charAt(0) : '?';
  
  const getInitialColor = (name) => {
    const colors = [
      '#FF6B6B', '#4DABF7', '#51CF66', '#FCC419', '#FF922B', 
      '#845EF7', '#F06595', '#339AF0', '#20C997', '#94D82D'
    ];
    if (!name) return colors[0];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  if (loading) return <div className="p-10 text-center text-gray-400">조직도 구성 중...</div>;

  return (
    <div className="org-chart-view">
      <div className="org-chart-list">
        {departments.map((dept) => {
          const isExpanded = expandedDepts[dept.deptNo];
          const deptMembers = groupedEmployees[dept.deptName] || [];
          
          // 부서장 찾기 (position이 팀장이거나 leaderName과 일치하는 경우)
          const leader = deptMembers.find(m => m.position === '팀장' || m.empName === dept.leaderName);
          // 부서원들 (부서장 제외)
          const members = deptMembers.filter(m => m.empNo !== (leader ? leader.empNo : null));

          return (
            <div key={dept.deptNo} className={`org-dept-card ${isExpanded ? 'expanded' : ''}`}>
              <div className="dept-card-header" onClick={() => toggleDept(dept.deptNo)}>
                <div className="dept-title-area">
                  <div className="dept-icon-box">
                    <Building2 size={18} />
                  </div>
                  <span className="dept-name">{dept.deptName}</span>
                </div>
                <div className="dept-toggle-icon">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {isExpanded && (
                <div className="dept-card-body">
                  {/* 부서장 영역 */}
                  {leader ? (
                    <div className="member-item leader">
                      <div className="member-info-main">
                        <span className="role-label leader-label">
                          <Crown size={12} className="inline-icon" /> 부서장
                        </span>
                        <div className="member-profile">
                          <div 
                            className="member-avatar" 
                            style={{ backgroundColor: getInitialColor(leader.empName) + '20', color: getInitialColor(leader.empName) }}
                          >
                            {getInitial(leader.empName)}
                          </div>
                          <span className="member-name">{leader.empName}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="member-item leader empty">
                      <span className="text-gray-400 text-xs">등록된 부서장이 없습니다.</span>
                    </div>
                  )}

                  {/* 부서원 리스트 */}
                  <div className="member-list">
                    {members.map((member) => (
                      <div key={member.empNo} className="member-item">
                        <div className="member-info-main">
                          <div className="member-profile">
                            <div 
                              className="member-avatar" 
                              style={{ backgroundColor: getInitialColor(member.empName) + '15', color: getInitialColor(member.empName) }}
                            >
                              {getInitial(member.empName)}
                            </div>
                            <span className="member-name">{member.empName}</span>
                          </div>
                        </div>
                        <div className="member-info-sub">
                          <span className="member-job">{member.jobTitle || '담당'}</span>
                        </div>
                      </div>
                    ))}
                    {members.length === 0 && !leader && (
                      <p className="empty-msg">부서에 소속된 인원이 없습니다.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrgChartView;
