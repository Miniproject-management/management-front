import { Link, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

import useAuthStore from "../stores/authStore";

function Sidebar() {
  const { accessToken, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div>
        <h2 className="logo">SECURE HR</h2>

        <nav className="nav-menu">
          <Link className="menu-item" to="/">
            대시보드
          </Link>

          <Link className="menu-item" to="/department">
            조직관리
          </Link>

          <Link className="menu-item" to="/resume">
            AI 채용
          </Link>

          <Link className="menu-item" to="/approval">
            전자결재
          </Link>
        </nav>

        <div className="preview-section">
          <p className="preview-title">디자인 미리보기</p>
          <Link className="preview-link" to="/dashboard/admin">
            인사팀 화면
          </Link>
          <Link className="preview-link" to="/dashboard/manager">
            팀장 화면
          </Link>
          <Link className="preview-link" to="/dashboard/employee">
            사원 화면
          </Link>
        </div>
      </div>

      {accessToken ? (
        <button className="login-btn" 
         onClick={() => {
          logout();
          alert("로그아웃되었습니다.");
          navigate("/login");
        }}
        >
          로그아웃
        </button>
      ) : (
        <Link className="login-btn" to="/login">
          로그인
        </Link>
      )}
    </aside>
  );
}

export default Sidebar;
