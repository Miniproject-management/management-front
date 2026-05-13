import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/login.css";

import { loginApi } from "../../api/authApi";
import useAuthStore from "../../stores/authStore";

function LoginPage() {
  const navigate = useNavigate();

  const [empNo, setEmpNo] = useState("");
  const [password, setPassword] = useState("");

  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await loginApi({
        empNo,
        password,
      });

      login(data);

      alert("로그인 성공");

      navigate("/");
    } catch (error) {
      console.error(error);

      alert("로그인 실패");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* 제목 */}
        <h1 className="login-title">
          로그인
        </h1>

        {/* 설명 문구 추가 */}
        <p className="login-description">
          사번과 비밀번호를 입력해주세요.
        </p>

        <form
          className="login-form"
          onSubmit={handleLogin}
        >
          <div className="input-group">
            <label>사번</label>

            <input
              type="text"
              placeholder="사번을 입력해주세요."
              value={empNo}
              onChange={(e) =>
                setEmpNo(e.target.value)
              }
            />
          </div>

          <div className="input-group">
            <label>비밀번호</label>

            <input
              type="password"
              placeholder="비밀번호를 입력해주세요."
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </div>

          <button
            type="submit"
            className="login-button"
          >
            로그인
          </button>
        </form>

      </div>
    </div>
  );
}

export default LoginPage;