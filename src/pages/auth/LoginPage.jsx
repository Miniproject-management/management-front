import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/login.css";

import { loginApi } from "../../api/authApi";
import useAuthStore from "../../stores/authStore";

function LoginPage() {

  const navigate = useNavigate();

  const [empNo, setEmpNo] = useState("");
  const [password, setPassword] = useState("");

  const login =
    useAuthStore((state) => state.login);

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

      // 백엔드 에러 메시지 출력
      alert(
        error.response?.data?.message
        || "로그인 실패"
      );
    }
  };

  return (
    <div className="login-page">

      {/* 브랜드 영역 */}
      <div className="login-brand">

        <img
          src="/hellohr-logo.png"
          alt="HELLO HR"
          className="login-brand__logo"
        />

        <span className="login-brand__name">
          HELLO HR
        </span>

        <p className="login-brand__slogan">
          당신의 안전한 안녕이 시작됩니다.
        </p>

      </div>

      {/* 로그인 카드 */}
      <div className="login-container">

        {/* 제목 */}
        <h1 className="login-title">
          로그인
        </h1>

        {/* 설명 */}
        <p className="login-description">
          사번과 비밀번호를 입력해주세요.
        </p>

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          {/* 사번 */}
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

          {/* 비밀번호 */}
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

          {/* 로그인 버튼 */}
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