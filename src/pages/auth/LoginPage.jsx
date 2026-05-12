import "../../styles/login.css";

function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">로그인</h1>

        <form className="login-form">
          <div className="input-group">
            <label>사번</label>

            <input
              type="text"
              placeholder="사번을 입력해주세요."
            />
          </div>

          <div className="input-group">
            <label>비밀번호</label>

            <input
              type="password"
              placeholder="비밀번호를 입력해주세요."
            />
          </div>

          <button type="submit" className="login-button">
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;