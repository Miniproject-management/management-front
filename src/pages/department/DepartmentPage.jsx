import React, { useState } from 'react';
import { LayoutDashboard, Users, Building2, Network } from "lucide-react";
import DashboardView from './DashboardView';
import EmployeeView from './EmployeeView';
import DeptListView from './DeptListView';
import '../../styles/DepartmentPage.css';

function DepartmentPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', name: '대시보드', icon: LayoutDashboard },
    { id: 'employees', name: '임직원 관리', icon: Users },
    { id: 'departments', name: '부서 관리', icon: Building2 },
    { id: 'orgchart', name: '조직도', icon: Network },
  ];

  return (
    <div className="dept-page-container">
      <h1 className="page-indicator">조직관리 &gt; {menuItems.find(m => m.id === activeTab)?.name}</h1>

      <div className="tab-navigation">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`tab-btn ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon size={18} />
            {item.name}
          </button>
        ))}
      </div>

      <div className="view-content">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'employees' && <EmployeeView />}
        {activeTab === 'departments' && <DeptListView />}
        {activeTab === 'orgchart' && <div className="empty-state">준비 중인 기능입니다.</div>}
      </div>
    </div>
  );
}

export default DepartmentPage;