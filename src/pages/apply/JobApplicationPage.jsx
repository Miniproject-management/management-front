import { useState } from "react";

export default function JobApplicationPage() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (!fd.get("name")?.toString().trim()) {
      setMsg("이름을 입력하세요.");
      return;
    }
    const f = fd.get("file");
    if (!f || typeof f === "string" || f.size === 0) {
      setMsg("파일을 선택하세요.");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/public/applications", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      setMsg(res.ok ? (data.message || "제출 완료") : (data.error || `오류 ${res.status}`));
      if (res.ok) form.reset();
    } catch {
      setMsg("연결 실패");
    }
    setLoading(false);
  }

  return (
    <div>
      <h2>채용 지원</h2>
      <form onSubmit={onSubmit}>
        <p>
          <label>
            이름 * <input name="name" disabled={loading} />
          </label>
        </p>
        <p>
          <label>
            이메일 <input name="email" type="email" disabled={loading} />
          </label>
        </p>
        <p>
          <label>
            연락처 <input name="phone" disabled={loading} />
          </label>
        </p>
        <p>
          <label>
            지원서류(첨부) *{" "}
            <input name="file" type="file" disabled={loading} />
          </label>
        </p>
        <p>
          <button type="submit" disabled={loading}>
            {loading ? "제출중" : "제출"}
          </button>
        </p>
        {msg ? <p>{msg}</p> : null}
      </form>
    </div>
  );
}
