import { useState } from 'react';
import './applyPage.css';

export default function JobApplicationPage() {
  const [msg, setMsg] = useState('');
  const [msgTone, setMsgTone] = useState('neutral');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (!fd.get('name')?.toString().trim()) {
      setMsgTone('error');
      setMsg('이름을 입력하세요.');
      return;
    }
    const f = fd.get('file');
    if (!f || typeof f === 'string' || f.size === 0) {
      setMsgTone('error');
      setMsg('파일을 선택하세요.');
      return;
    }
    setLoading(true);
    setMsg('');
    setMsgTone('neutral');
    try {
      const res = await fetch('/api/public/applications', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      const text = res.ok
        ? data.message || '제출이 완료되었습니다.'
        : data.error || `오류 ${res.status}`;
      setMsg(text);
      setMsgTone(res.ok ? 'success' : 'error');
      if (res.ok) form.reset();
    } catch {
      setMsgTone('error');
      setMsg('연결에 실패했습니다. 네트워크를 확인해 주세요.');
    }
    setLoading(false);
  }

  return (
    <section className="apply-page" aria-labelledby="apply-page-title">
      <header className="apply-page__header">
        <h1 id="apply-page-title">채용 지원</h1>
        <p className="apply-page__lead">
          지원 정보와 이력서 파일을 제출해 주세요. 표시된 항목은 필수입니다.
        </p>
      </header>

      <form className="apply-page__form apply-page__card" onSubmit={onSubmit}>
        <div className="apply-page__field">
          <label className="apply-page__label" htmlFor="apply-name">
            이름 <span className="apply-page__req" aria-hidden="true">*</span>
          </label>
          <input
            id="apply-name"
            className="apply-page__input"
            name="name"
            autoComplete="name"
            placeholder="홍길동"
            disabled={loading}
          />
        </div>

        <div className="apply-page__field">
          <label className="apply-page__label" htmlFor="apply-email">
            이메일
          </label>
          <input
            id="apply-email"
            className="apply-page__input"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            disabled={loading}
          />
        </div>

        <div className="apply-page__field">
          <label className="apply-page__label" htmlFor="apply-phone">
            연락처
          </label>
          <input
            id="apply-phone"
            className="apply-page__input"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="010-0000-0000"
            disabled={loading}
          />
        </div>

        <div className="apply-page__field">
          <label className="apply-page__label" htmlFor="apply-file">
            지원서류(첨부){' '}
            <span className="apply-page__req" aria-hidden="true">
              *
            </span>
          </label>
          <div className="apply-page__file-wrap">
            <input
              id="apply-file"
              name="file"
              type="file"
              accept=".pdf,application/pdf"
              disabled={loading}
            />
          </div>
          <p className="apply-page__file-hint">PDF 형식을 권장합니다.</p>
        </div>

        <div className="apply-page__actions">
          <button className="apply-page__submit" type="submit" disabled={loading}>
            {loading ? '제출 중…' : '지원서 제출'}
          </button>
        </div>

        {msg ? (
          <p
            className={`apply-page__msg is-${msgTone}`}
            role="status"
            aria-live="polite"
          >
            {msg}
          </p>
        ) : null}
      </form>
    </section>
  );
}
