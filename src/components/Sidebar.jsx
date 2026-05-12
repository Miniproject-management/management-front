import { Link } from "react-router-dom";
import "../styles/sidebar.css";

import useAuthStore from "../store/useAuthStore";

function Sidebar() {
  const { accessToken, logout } = useAuthStore();

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
      </div>

      {accessToken ? (
        <button className="login-btn" onClick={logout}>
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