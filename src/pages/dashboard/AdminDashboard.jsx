import {
  Users,
  UserPlus,
  Star,
  Calendar,
  CalendarDays,
  Plane,
  Shield,
  ChevronDown,
  ChevronRight,
  BarChart3,
} from "lucide-react";

import "./dashboard.css";

const summaryCards = [
  {
    label: "전체 임직원",
    value: "124명",
    note: "전월 대비 +3명",
    noteTone: "up",
    tone: "blue",
    Icon: Users,
  },
  {
    label: "신규 지원자",
    value: "12명",
    note: "이번 주 기준",
    tone: "green",
    Icon: UserPlus,
  },
  {
    label: "평균 스크리닝 점수",
    value: "84점",
    note: "고득점 후보 3명",
    tone: "purple",
    Icon: Star,
  },
  {
    label: "평균 잔여 연차",
    value: "9.8일",
    note: "전체 직원 기준",
    tone: "orange",
    Icon: Calendar,
  },
];

const topApplicants = [
  { rank: 1, name: "김예진", role: "백엔드 개발자", score: 92, summary: "Java · Spring 역량 우수" },
  { rank: 2, name: "이준호", role: "보안 담당자", score: 88, summary: "보안 프로젝트 경험 보유" },
  { rank: 3, name: "박서연", role: "데이터 분석가", score: 85, summary: "SQL · Python 역량 확인" },
  { rank: 4, name: "최민우", role: "프론트엔드", score: 78, summary: "React 경험 보유" },
  { rank: 5, name: "정다은", role: "HR Assistant", score: 74, summary: "문서화 경험 우수" },
];

const leaveOverview = [
  { label: "이번 달 사용 연차", value: "24.5일", current: 24.5, target: 30, tone: "blue" },
  { label: "승인 대기 연차", value: "6.0일", current: 6, target: 10, tone: "orange" },
  { label: "평균 잔여 연차", value: "9.8일", current: 9.8, target: 15, tone: "green" },
];

const departmentLeave = [
  { name: "개발팀", remain: 8.5, used: "12.5일", Icon: Users },
  { name: "보안팀", remain: 10.2, used: "4.0일", Icon: Shield },
  { name: "인사팀", remain: 9.0, used: "3.5일", Icon: BarChart3 },
  { name: "기획팀", remain: 11.1, used: "4.5일", Icon: Users },
];

const pendingDocs = [
  { type: "연차 신청", Icon: CalendarDays, tone: "orange", applicant: "김민수", date: "05.19" },
  { type: "반차 신청", Icon: Plane, tone: "green", applicant: "이서연", date: "05.19" },
];

const headcount = [
  { name: "개발팀", count: 46, lead: "김팀장", delta: "+2", Icon: Users, color: "#3b82f6" },
  { name: "보안팀", count: 18, lead: "이팀장", delta: "0", Icon: Shield, color: "#a855f7" },
  { name: "인사팀", count: 12, lead: "박팀장", delta: "+1", Icon: BarChart3, color: "#f59e0b" },
  { name: "기획팀", count: 15, lead: "최팀장", delta: "-1", Icon: Users, color: "#22c55e" },
];

function ProgressBar({ value, max = 100, tone = "blue" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <span className={`progress-bar tone-${tone}`}>
      <span className="progress-bar__fill" style={{ width: `${pct}%` }} />
    </span>
  );
}

function DonutChart({ data, total }) {
  const size = 130;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map((seg) => {
    const dash = (seg.count / total) * circumference;
    const node = (
      <circle
        key={seg.name}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={seg.color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    );
    offset += dash;
    return node;
  });

  return (
    <svg className="donut-chart" viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      {segments}
      <text x="50%" y="46%" textAnchor="middle" className="donut-chart__label">
        전체
      </text>
      <text x="50%" y="62%" textAnchor="middle" className="donut-chart__total">
        {total}명
      </text>
    </svg>
  );
}

function AdminDashboard() {
  const headcountTotal = headcount.reduce((sum, d) => sum + d.count, 0);

  return (
    <section className="dashboard-page">
      <header className="dashboard-page__header">
        <div className="dashboard-page__hero">
          <h1>대시보드 개요</h1>
          <p>조직 현황과 채용, 연차, 결재 상태를 한눈에 확인하세요</p>
        </div>

        <button className="dashboard-page__date-picker" type="button">
          <Calendar size={16} strokeWidth={1.8} />
          <span>2024.05.19 (일)</span>
          <ChevronDown size={16} strokeWidth={1.8} />
        </button>
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
                {noteTone === "up" && <span className="summary-card__arrow">↗</span>}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-page__content-grid">
        <article className="panel">
          <div className="panel__head">
            <h2>지원자 스크리닝 점수 TOP 5</h2>
            <a className="panel__link" href="#">
              전체 보기 <ChevronRight size={14} strokeWidth={2} />
            </a>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>지원자</th>
                <th>지원 직무</th>
                <th>점수</th>
                <th>평가 요약</th>
              </tr>
            </thead>
            <tbody>
              {topApplicants.map((a) => (
                <tr key={a.rank}>
                  <td className="rank-cell">{a.rank}</td>
                  <td>{a.name}</td>
                  <td>{a.role}</td>
                  <td>
                    <div className="score-cell">
                      <span className="score-badge">{a.score}점</span>
                      <ProgressBar value={a.score} tone="blue" />
                    </div>
                  </td>
                  <td className="muted-cell">{a.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="panel">
          <div className="panel__head">
            <h2>전체 연차 현황</h2>
          </div>

          <div className="leave-grid">
            {leaveOverview.map((item) => (
              <div key={item.label} className={`leave-card tone-${item.tone}`}>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                <div className="leave-card__progress">
                  <ProgressBar value={item.current} max={item.target} tone={item.tone} />
                  <span className="leave-card__target">목표 {item.target}일</span>
                </div>
              </div>
            ))}
          </div>

          <div className="panel__subhead">부서별 연차 요약</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>부서</th>
                <th>평균 잔여 연차</th>
                <th>사용 연차</th>
              </tr>
            </thead>
            <tbody>
              {departmentLeave.map(({ name, remain, used, Icon }) => (
                <tr key={name}>
                  <td>
                    <div className="dept-cell">
                      <Icon size={16} strokeWidth={1.8} />
                      <span>{name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="score-cell">
                      <span>{remain}일</span>
                      <ProgressBar value={remain} max={15} tone="blue" />
                    </div>
                  </td>
                  <td>{used}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="panel">
          <div className="panel__head">
            <h2>결재 대기 문서</h2>
            <a className="panel__link" href="#">
              전체 보기 <ChevronRight size={14} strokeWidth={2} />
            </a>
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
              {pendingDocs.map(({ type, Icon, tone, applicant, date }) => (
                <tr key={type}>
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
                  <td>
                    <span className="status-badge">승인 대기</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="panel">
          <div className="panel__head">
            <h2>부서별 인원 현황</h2>
            <a className="panel__link" href="#">
              전체 보기 <ChevronRight size={14} strokeWidth={2} />
            </a>
          </div>

          <div className="headcount-grid">
            <table className="data-table">
              <thead>
                <tr>
                  <th>부서</th>
                  <th>인원</th>
                  <th>팀장</th>
                  <th>최근 변동</th>
                </tr>
              </thead>
              <tbody>
                {headcount.map(({ name, count, lead, delta, Icon }) => {
                  const deltaClass = delta.startsWith("+")
                    ? "is-positive"
                    : delta.startsWith("-")
                      ? "is-negative"
                      : "is-neutral";
                  return (
                    <tr key={name}>
                      <td>
                        <div className="dept-cell">
                          <Icon size={16} strokeWidth={1.8} />
                          <span>{name}</span>
                        </div>
                      </td>
                      <td>{count}명</td>
                      <td>{lead}</td>
                      <td>
                        <span className={`delta-pill ${deltaClass}`}>{delta}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="headcount-chart">
              <DonutChart data={headcount} total={headcountTotal} />
              <ul className="headcount-legend">
                {headcount.map(({ name, count, color }) => {
                  const pct = ((count / headcountTotal) * 100).toFixed(1);
                  return (
                    <li key={name}>
                      <span className="legend-dot" style={{ background: color }} />
                      <span className="legend-name">{name}</span>
                      <span className="legend-value">
                        {count}명 ({pct}%)
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </article>
      </section>
    </section>
  );
}

export default AdminDashboard;
