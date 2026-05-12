import { Calendar, FileText, Clock, Plane } from "lucide-react";

import "./dashboard.css";

const summaryCards = [
  {
    label: "내 잔여 연차",
    value: "9.5일",
    note: "올해 부여 15일",
    tone: "blue",
    Icon: Calendar,
  },
  {
    label: "이번 달 사용",
    value: "1.5일",
    note: "연차 1일 · 반차 1회",
    tone: "orange",
    Icon: Plane,
  },
  {
    label: "내 신청 (대기)",
    value: "2건",
    note: "팀장 승인 대기",
    tone: "purple",
    Icon: FileText,
  },
  {
    label: "이번 주 근무",
    value: "32시간",
    note: "정상 출근 중",
    tone: "green",
    Icon: Clock,
  },
];

function EmployeeDashboard() {
  return (
    <section className="dashboard-page">
      <header className="dashboard-page__header">
        <div className="dashboard-page__hero">
          <h1>내 대시보드</h1>
          <p>나의 연차/근태/결재 현황을 한눈에 확인하세요</p>
        </div>
      </header>

      <section className="dashboard-page__summary-grid">
        {summaryCards.map(({ label, value, note, tone, Icon }) => (
          <article key={label} className="summary-card">
            <div className={`summary-card__icon tone-${tone}`}>
              <Icon size={22} strokeWidth={2} />
            </div>
            <div className="summary-card__body">
              <p className="summary-card__label">{label}</p>
              <strong className="summary-card__value">{value}</strong>
              <span className="summary-card__note">{note}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-page__content-grid">
        <article className="panel">
          <div className="panel__head">
            <h2>내 신청 목록</h2>
          </div>
          <div className="placeholder-block">
            🚧 사원 본인 신청 내역이 표시될 영역입니다.
            <br />
            <small>(연차/반차 담당자가 채울 자리)</small>
          </div>
        </article>

        <article className="panel">
          <div className="panel__head">
            <h2>이번 주 근태</h2>
          </div>
          <div className="placeholder-block">
            🚧 출퇴근 기록이 표시될 영역입니다.
            <br />
            <small>(근태 담당자가 채울 자리)</small>
          </div>
        </article>
      </section>
    </section>
  );
}

export default EmployeeDashboard;
