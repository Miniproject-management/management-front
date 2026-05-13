import { Link, NavLink, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

import useAuthStore from "../stores/authStore";

function Sidebar() {

  const {
    accessToken,
    logout,
    empName,
    deptName
  } = useAuthStore();

  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div>
        <div className="brand-section">
          <div className="brand-top">
            <img
              src="/hellohr-logo.png"
              alt="HELLO HR"
              className="brand-logo"
            />

            <h2 className="logo">
              HELLO HR
            </h2>

          </div>

          <p className="logo-title">
            당신의 안전한 안녕이 시작됩니다.
          </p>

        </div>

        <nav className="nav-menu">
          <NavLink className="menu-item" to="/" end>
            대시보드
          </NavLink>

          <NavLink className="menu-item" to="/department">
            조직관리
          </NavLink>

          <NavLink className="menu-item" to="/resume">
            AI 채용
          </NavLink>

          <NavLink className="menu-item" to="/approval">
            전자결재
          </NavLink>
        </nav>

        <div className="preview-section">
          <p className="preview-title">디자인 미리보기</p>

          <NavLink className="preview-link" to="/dashboard/admin">
            인사팀 화면
          </NavLink>

          <NavLink className="preview-link" to="/dashboard/manager">
            팀장 화면
          </NavLink>

          <NavLink className="preview-link" to="/dashboard/employee">
            사원 화면
          </NavLink>
        </div>
      </div>

      {accessToken ? (
        <div className="sidebar-bottom">

          <div className="user-card">

            <div className="user-avatar">
              👤
            </div>

            <div className="user-info">
              <p className="user-name">
                {empName}
              </p>

              <p className="user-dept">
                {deptName}
              </p>
            </div>

          </div>

          <button
            className="login-btn"
            onClick={() => {
              logout();
              alert("로그아웃되었습니다.");
              navigate("/login");
            }}
          >
            로그아웃
          </button>

        </div>
      ) : (
        <Link className="login-btn" to="/login">
          로그인
        </Link>
      )}
    </aside>
  );
}

export default Sidebar;
