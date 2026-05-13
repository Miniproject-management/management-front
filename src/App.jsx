import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import RequireRole from "./components/RequireRole";

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

function AppShell() {
  const { pathname } = useLocation();
  const hideChrome = pathname === "/login";

  return (
    <div className="layout">
      {!hideChrome && <Sidebar />}

      <div className="content-wrapper">
        <main className="main-content">
            <Routes>
              <Route path="/" element={<RequireRole><DashboardPage /></RequireRole>} />
              <Route
                path="/dashboard/admin"
                element={
                  <RequireRole allowed={["ROLE_ADMIN"]}>
                    <AdminDashboard />
                  </RequireRole>
                }
              />
              <Route
                path="/dashboard/manager"
                element={
                  <RequireRole allowed={["ROLE_MANAGER"]}>
                    <ManagerDashboard />
                  </RequireRole>
                }
              />
              <Route
                path="/dashboard/employee"
                element={
                  <RequireRole allowed={["ROLE_EMPLOYEE"]}>
                    <EmployeeDashboard />
                  </RequireRole>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              {/* 디자인 미리보기 (완성 후 제거) */}
              <Route path="/preview/admin" element={<AdminDashboard />} />
              <Route path="/preview/manager" element={<ManagerDashboard />} />
              <Route path="/preview/employee" element={<EmployeeDashboard />} />
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
          </main>

          {!hideChrome && <Footer />}
        </div>
      </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
