import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import AttendancePage from "./pages/attendance/AttendancePage";
import ApprovalPage from "./pages/approval/ApprovalPage";
import ResumePage from "./pages/resume/ResumePage";
import DepartmentPage from "./pages/department/DepartmentPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import JobApplicationPage from "./pages/apply/JobApplicationPage";

function App() {
  return (
    <BrowserRouter>
      <div>
        <h1>관리 시스템</h1>

        {/* 테스트용 메뉴 */}
        <nav style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <Link to="/">대시보드</Link>
          <Link to="/login">로그인</Link>
          <Link to="/attendance">근태관리</Link>
          <Link to="/approval">전자결재</Link>
          <Link to="/resume">이력서관리</Link>
          <Link to="/department">부서관리</Link>
        </nav>

        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/approval" element={<ApprovalPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/department" element={<DepartmentPage />} />
          <Route path="/apply" element={<JobApplicationPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
