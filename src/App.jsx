import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import LoginPage from "./pages/auth/LoginPage";
import ApprovalPage from "./pages/approval/ApprovalPage";
import ResumePage from "./pages/resume/ResumePage";
import DepartmentPage from "./pages/department/DepartmentPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import JobApplicationPage from "./pages/apply/JobApplicationPage";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/approval" element={<ApprovalPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/department" element={<DepartmentPage />} />
            <Route path="/apply" element={<JobApplicationPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;