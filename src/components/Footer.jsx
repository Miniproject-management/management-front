function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <img
          src="/logo.png"
          alt="회사로고"
          className="footer-logo"
        />

        <span className="footer-company-name">
          SK루키즈 컴퍼니
        </span>
      </div>

      <div className="footer-info">
        <p>TEL : 02-1234-5678 | FAX : 02-9876-5432</p>

        <p>Email : admin@miniproject.com</p>

        <p>
          주소 : 서울특별시 중구 필동로1길 30 (장충동2가)
        </p>
      </div>

      <hr className="footer-line" />

      <p className="footer-copy">
        Copyright ⓒ 개발연구소
      </p>
    </footer>
  );
}

export default Footer;