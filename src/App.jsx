import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

import LoginPage from "./pages/auth/LoginPage";
import ApprovalPage from "./pages/approval/ApprovalPage";
import ResumePage from "./pages/resume/ResumePage";
import DepartmentPage from "./pages/department/DepartmentPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ManagerDashboard from "./pages/dashboard/ManagerDashboard";
import EmployeeDashboard from "./pages/dashboard/EmployeeDashboard";
import JobApplicationPage from "./pages/apply/JobApplicationPage";
import ApprovalDetailPage from "./pages/approval/ApprovalDetailPage";
import LeaveApplyPage from "./pages/approval/LeaveApplyPage";
import LeaveBalancePage from "./pages/approval/LeaveBalancePage";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/manager" element={<ManagerDashboard />} />
            <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/approval" element={<ApprovalPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/department" element={<DepartmentPage />} />
            <Route path="/apply" element={<JobApplicationPage />} />
            <Route path="/approval/:leaveId" element={<ApprovalDetailPage />} />
            <Route path="/approval/apply" element={<LeaveApplyPage />} />
            <Route
              path="/approval/leave-balance"
              element={<LeaveBalancePage />}
            />
          </Routes>

          {/* 공통 Footer */}
          <Footer />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;