import {
  Users,
  Umbrella,
  FileCheck2,
  Calendar,
  CalendarDays,
  Plane,
  FileText,
  ClipboardList,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Briefcase,
  Package,
  Wallet,
} from "lucide-react";

import "./dashboard.css";

const summaryCards = [
  { label: "우리 팀 인원", value: "12명", note: "전월 대비 +1명", noteTone: "up", tone: "blue", Icon: Users },
  { label: "오늘 휴가", value: "2명", note: "연차 1명 / 반차 1명", tone: "green", Icon: Umbrella },
  { label: "승인 대기", value: "4건", note: "처리 필요", tone: "purple", Icon: FileCheck2 },
  { label: "팀 평균 잔여 연차", value: "8.7일", note: "부서 내 기준", tone: "orange", Icon: Calendar },
];

const myLeave = { remain: 12.5, total: 15, used: 2.5 };

const monthlyLeave = [
  { month: "1월", used: 2, remain: 13 },
  { month: "2월", used: 3, remain: 12 },
  { month: "3월", used: 4, remain: 11 },
  { month: "4월", used: 3, remain: 12 },
  { month: "5월", used: 2.5, remain: 12.5 },
];

const teamLeaveOverview = [
  { label: "이번 달 사용 연차", value: "8.5일", tone: "blue" },
  { label: "승인 대기 연차", value: "1.5일", tone: "orange" },
  { label: "평균 잔여 연차", value: "8.7일", tone: "green" },
];

const calendarEvents = {
  2: "annual",
  13: "halfday",
  19: "selected",
  22: "pending",
};

const teamMembers = [
  { name: "김민수", role: "Backend", used: "6.5일", remain: "8.5일", pending: "1일", pendingTone: "warn" },
  { name: "이서연", role: "DevOps", used: "4일", remain: "11일", pending: "0일" },
  { name: "박서연", role: "Security", used: "7일", remain: "8일", pending: "0.5일", pendingTone: "warn" },
  { name: "정다운", role: "UI/UX", used: "5일", remain: "10일", pending: "0일" },
  { name: "최지훈", role: "Backend", used: "3일", remain: "7일", pending: "0일" },
];

const teamComposition = [
  { role: "Backend", count: "4명", avg: "9.0일" },
  { role: "DevOps", count: "2명", avg: "7.5일" },
  { role: "Security", count: "2명", avg: "8.8일" },
  { role: "UI/UX", count: "2명", avg: "9.2일" },
  { role: "기획", count: "2명", avg: "8.1일" },
];

const pendingDocs = [
  { type: "연차 신청", Icon: CalendarDays, tone: "orange", applicant: "김민수", date: "05.19" },
  { type: "반차 신청", Icon: Plane, tone: "green", applicant: "이서연", date: "05.19" },
  { type: "연차 신청", Icon: CalendarDays, tone: "orange", applicant: "박서연", date: "05.18" },
];

const recentActivities = [
  { Icon: CalendarDays, tone: "blue", text: "김민수님이 연차를 신청했습니다.", time: "05.19 10:21" },
  { Icon: Umbrella, tone: "green", text: "박서연님이 반차 승인이 등록되었습니다.", time: "05.18 09:45" },
  { Icon: FileText, tone: "purple", text: "정다운님이 연차 신청이 승인 대기 중입니다.", time: "05.18 12:21" },
  { Icon: ClipboardList, tone: "orange", text: "최지훈님이 반차 신청이 등록되었습니다.", time: "05.18 11:06" },
];

const quickMenus = [
  { label: "연차 신청", Icon: CalendarDays, tone: "orange" },
  { label: "반차 신청", Icon: Umbrella, tone: "green" },
  { label: "내 신청 내역", Icon: FileText, tone: "purple" },
  { label: "팀 휴가 관리", Icon: ClipboardList, tone: "orange" },
];

function MyLeaveDonut({ remain, total }) {
  const size = 150;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (remain / total) * circumference;

  return (
    <svg className="my-leave-donut" viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#fff1e0" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="48%" textAnchor="middle" className="my-leave-donut__value">
        {remain}일
      </text>
      <text x="50%" y="64%" textAnchor="middle" className="my-leave-donut__label">
        남은 연차
      </text>
    </svg>
  );
}

function MonthlyBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.used + d.remain));
  const barWidth = 26;
  const gap = 36;
  const chartHeight = 140;
  const chartWidth = data.length * (barWidth + gap);

  return (
    <svg className="bar-chart" viewBox={`0 0 ${chartWidth} ${chartHeight + 28}`} width="100%" height={chartHeight + 28}>
      {data.map((d, i) => {
        const x = i * (barWidth + gap) + gap / 2;
        const totalH = ((d.used + d.remain) / max) * chartHeight;
        const usedH = (d.used / max) * chartHeight;
        const remainH = totalH - usedH;
        const yTop = chartHeight - totalH;
        return (
          <g key={d.month}>
            <rect
              x={x}
              y={yTop}
              width={barWidth}
              height={remainH}
              fill="#fde7c8"
              rx="4"
            />
            <text
              x={x + barWidth / 2}
              y={yTop + 14}
              textAnchor="middle"
              className="bar-chart__top"
            >
              {d.remain}
            </text>
            <rect
              x={x}
              y={chartHeight - usedH}
              width={barWidth}
              height={usedH}
              fill="#f59e0b"
              rx="4"
            />
            <text
              x={x + barWidth / 2}
              y={chartHeight - 6}
              textAnchor="middle"
              className="bar-chart__bottom"
            >
              {d.used}
            </text>
            <text
              x={x + barWidth / 2}
              y={chartHeight + 22}
              textAnchor="middle"
              className="bar-chart__month"
            >
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function MiniCalendar() {
  const weeks = [
    [27, 28, 29, 30, 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 31],
  ];
  const inMonth = (d, weekIdx) => {
    if (weekIdx === 0 && d > 20) return false;
    if (weekIdx === 4 && d < 20) return false;
    return true;
  };

  const dotColor = {
    annual: "#3b82f6",
    halfday: "#f97316",
    pending: "#a855f7",
  };

  return (
    <div className="mini-calendar">
      <div className="mini-calendar__head">
        <button type="button" className="mini-calendar__nav">
          <ChevronLeft size={14} />
        </button>
        <span>2025년 5월</span>
        <button type="button" className="mini-calendar__nav">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="mini-calendar__grid">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div key={d} className="mini-calendar__weekday">
            {d}
          </div>
        ))}
        {weeks.flatMap((week, wi) =>
          week.map((day, di) => {
            const isInMonth = inMonth(day, wi);
            const event = isInMonth ? calendarEvents[day] : null;
            const isSelected = event === "selected";
            return (
              <div
                key={`${wi}-${di}`}
                className={`mini-calendar__day ${isInMonth ? "" : "is-muted"} ${
                  isSelected ? "is-selected" : ""
                }`}
              >
                <span>{day}</span>
                {event && event !== "selected" && (
                  <span
                    className="mini-calendar__dot"
                    style={{ background: dotColor[event] }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
      <ul className="mini-calendar__legend">
        <li><span className="legend-dot" style={{ background: "#3b82f6" }} /> 연차</li>
        <li><span className="legend-dot" style={{ background: "#f97316" }} /> 반차</li>
        <li><span className="legend-dot" style={{ background: "#a855f7" }} /> 승인 대기</li>
      </ul>
    </div>
  );
}

function ManagerDashboard() {
  return (
    <section className="dashboard-page">
      <header className="dashboard-page__header">
        <div className="dashboard-page__hero">
          <h1>대시보드 <span className="dashboard-page__wave">👋</span></h1>
          <p>우리 팀과 나의 현황을 한눈에 확인하세요.</p>
        </div>

        <div className="dashboard-page__header-actions">
          <button className="dashboard-page__date-picker" type="button">
            <Calendar size={16} strokeWidth={1.8} />
            <span>2025.05.19 (월)</span>
            <ChevronDown size={16} strokeWidth={1.8} />
          </button>
          <button className="icon-button" type="button" aria-label="filter">
            <Filter size={16} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <section className="dashboard-page__summary-grid">
        {summaryCards.map(({ label, value, note, noteTone, tone, Icon }) => (
          <article key={label} className="summary-card">
            <div className={`summary-card__icon tone-${tone}`}>
              <Icon size={22} strokeWidth={2} />
            </div>
            <div className="summary-card__body">
              <p className="summary-card__label">{label}</p>
              <strong className="summary-card__value">{value}</strong>
              <span className={`summary-card__note ${noteTone === "up" ? "is-up" : ""}`}>
                {note}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="manager-grid manager-grid--top">
        <article className="panel panel--span-2">
          <div className="panel__head">
            <h2>내 연차 현황</h2>
            <button type="button" className="year-select">
              2025년 <ChevronDown size={14} />
            </button>
          </div>

          <div className="my-leave-grid">
            <div className="my-leave-summary">
              <MyLeaveDonut remain={myLeave.remain} total={myLeave.total} />
              <ul className="my-leave-stats">
                <li>
                  <span className="my-leave-stats__icon tone-blue"><Calendar size={16} /></span>
                  <div>
                    <p>총 연차 일수</p>
                    <strong>{myLeave.total}일</strong>
                  </div>
                </li>
                <li>
                  <span className="my-leave-stats__icon tone-purple"><Briefcase size={16} /></span>
                  <div>
                    <p>사용 연차</p>
                    <strong>{myLeave.used}일</strong>
                  </div>
                </li>
                <li>
                  <span className="my-leave-stats__icon tone-orange"><Wallet size={16} /></span>
                  <div>
                    <p>잔여 연차</p>
                    <strong className="orange">{myLeave.remain}일</strong>
                  </div>
                </li>
              </ul>
            </div>

            <div className="monthly-leave">
              <div className="monthly-leave__head">
                <h3>연차 사용 현황</h3>
                <ul className="monthly-leave__legend">
                  <li><span className="legend-dot" style={{ background: "#f59e0b" }} /> 사용 연차</li>
                  <li><span className="legend-dot" style={{ background: "#fde7c8" }} /> 잔여 연차</li>
                </ul>
              </div>
              <MonthlyBarChart data={monthlyLeave} />
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel__head">
            <h2>우리 팀 연차 요약</h2>
          </div>
          <div className="team-leave-summary">
            {teamLeaveOverview.map((item) => (
              <div key={item.label} className={`leave-card tone-${item.tone}`}>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
          <div className="panel__subhead panel__subhead--row">
            <span>팀 휴가 일정</span>
          </div>
          <MiniCalendar />
        </article>
      </section>

      <section className="dashboard-page__content-grid">
        <article className="panel">
          <div className="panel__head">
            <h2>팀원 연차 현황</h2>
            <a className="panel__link" href="#">전체 보기 <ChevronRight size={14} /></a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>직무</th>
                <th>사용 연차</th>
                <th>잔여 연차</th>
                <th>승인 대기</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((m) => (
                <tr key={m.name}>
                  <td>{m.name}</td>
                  <td className="muted-cell">{m.role}</td>
                  <td>{m.used}</td>
                  <td>{m.remain}</td>
                  <td className={m.pendingTone === "warn" ? "warn-cell" : "muted-cell"}>
                    {m.pending}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="panel">
          <div className="panel__head">
            <h2>우리 팀 구성</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>직무</th>
                <th>인원</th>
                <th>평균 잔여 연차</th>
              </tr>
            </thead>
            <tbody>
              {teamComposition.map((c) => (
                <tr key={c.role}>
                  <td>{c.role}</td>
                  <td>{c.count}</td>
                  <td>{c.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>

      <section className="manager-grid manager-grid--bottom">
        <article className="panel">
          <div className="panel__head">
            <h2>결재 대기 문서</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>문서 유형</th>
                <th>신청자</th>
                <th>신청일</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {pendingDocs.map(({ type, Icon, tone, applicant, date }, i) => (
                <tr key={`${type}-${applicant}-${i}`}>
                  <td>
                    <div className="doc-cell">
                      <span className={`doc-icon tone-${tone}`}>
                        <Icon size={16} strokeWidth={1.8} />
                      </span>
                      <span>{type}</span>
                    </div>
                  </td>
                  <td>{applicant}</td>
                  <td>{date}</td>
                  <td><span className="status-badge">승인 대기</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <a className="panel__footer-link" href="#">전체 보기 <ChevronRight size={14} /></a>
        </article>

        <article className="panel">
          <div className="panel__head">
            <h2>최근 팀 활동</h2>
          </div>
          <ul className="activity-list">
            {recentActivities.map(({ Icon, tone, text, time }, i) => (
              <li key={i}>
                <span className={`doc-icon tone-${tone}`}>
                  <Icon size={16} strokeWidth={1.8} />
                </span>
                <span className="activity-text">{text}</span>
                <span className="activity-time">{time}</span>
              </li>
            ))}
          </ul>
          <a className="panel__footer-link" href="#">더 보기 <ChevronRight size={14} /></a>
        </article>

        <article className="panel">
          <div className="panel__head">
            <h2>빠른 메뉴</h2>
          </div>
          <div className="quick-menu-grid">
            {quickMenus.map(({ label, Icon, tone }) => (
              <button key={label} type="button" className={`quick-menu-item tone-${tone}`}>
                <Icon size={20} strokeWidth={1.8} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}

export default ManagerDashboard;
