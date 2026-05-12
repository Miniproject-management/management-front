import {
  BriefcaseBusiness,
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Plane,
  ShieldCheck,
  Star,
  UserPlus,
  Users,
} from "lucide-react";

import "./dashboard.css";

const kpis = [
  {
    label: "전체 임직원",
    value: "124명",
    description: "전월 대비 +3명",
    icon: Users,
    tone: "orange",
  },
  {
    label: "신규 지원자",
    value: "12명",
    description: "이번 주 기준",
    icon: UserPlus,
    tone: "green",
  },
  {
    label: "평균 스크리닝 점수",
    value: "84점",
    description: "고득점 후보 3명",
    icon: Star,
    tone: "purple",
  },
  {
    label: "평균 잔여 연차",
    value: "9.8일",
    description: "전체 직원 기준",
    icon: CalendarDays,
    tone: "orange",
  },
];

const screeningRows = [
  ["1", "김예진", "백엔드 개발자", 92, "Java · Spring 역량 우수"],
  ["2", "이준호", "보안 담당자", 88, "보안 프로젝트 경험 보유"],
  ["3", "박서연", "데이터 분석가", 85, "SQL · Python 역량 확인"],
  ["4", "최민우", "프론트엔드", 78, "React 경험 보유"],
  ["5", "정다은", "HR Assistant", 74, "문서화 경험 우수"],
];

const leaveSummary = [
  { label: "이번 달 사용 연차", value: "24.5일", goal: "목표 30일", percent: 82, tone: "orange" },
  { label: "승인 대기 연차", value: "6.0일", goal: "목표 10일", percent: 60, tone: "orange" },
  { label: "평균 잔여 연차", value: "9.8일", goal: "목표 15일", percent: 65, tone: "green" },
];

const departmentLeaveRows = [
  ["개발팀", "8.5일", "12.5일", 62, Users],
  ["보안팀", "10.2일", "4.0일", 84, ShieldCheck],
  ["인사팀", "9.0일", "3.5일", 70, ClipboardCheck],
  ["기획팀", "11.1일", "4.5일", 88, BriefcaseBusiness],
];

const approvalRows = [
  { type: "연차 신청", person: "김민수", date: "05.19", icon: CalendarPlus, tone: "orange" },
  { type: "반차 신청", person: "이서연", date: "05.19", icon: Plane, tone: "green" },
];

const headcountRows = [
  ["개발팀", "46명", "김팀장", "+2", Users],
  ["보안팀", "18명", "이팀장", "0", ShieldCheck],
  ["인사팀", "12명", "박팀장", "+1", Users],
  ["기획팀", "15명", "최팀장", "-1", ClipboardCheck],
];

const donutSegments = [
  { label: "개발팀", value: "46명 (50.5%)", color: "#F97316" },
  { label: "보안팀", value: "18명 (19.8%)", color: "#FDBA74" },
  { label: "인사팀", value: "12명 (13.2%)", color: "#FDE68A" },
  { label: "기획팀", value: "15명 (16.5%)", color: "#FACC15" },
];

function CardHeader({ title, hasLink = false }) {
  return (
    <div className="dashboard-card__header">
      <h2>{title}</h2>
      {hasLink ? (
        <button className="dashboard-card__link" type="button">
          전체 보기 <ChevronRight size={15} strokeWidth={2.4} />
        </button>
      ) : null}
    </div>
  );
}

function ProgressBar({ value, tone = "orange", compact = false }) {
  return (
    <span className={`progress-bar progress-bar--${tone} ${compact ? "progress-bar--compact" : ""}`}>
      <span style={{ width: `${value}%` }} />
    </span>
  );
}

function AdminDashboard() {
  return (
    <section className="dashboard-page admin-dashboard">
      <header className="dashboard-page__header">
        <div className="dashboard-page__hero">
          <h1>대시보드 개요</h1>
          <p>조직 현황과 채용, 연차, 결재 상태를 한눈에 확인하세요</p>
        </div>

        <button className="dashboard-date-button" type="button">
          <CalendarDays size={20} />
          <span>2024.05.19 (일)</span>
          <ChevronDown size={18} />
        </button>
      </header>

      <div className="dashboard-grid">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <article className="dashboard-card kpi-card" key={item.label}>
              <div className={`kpi-card__icon kpi-card__icon--${item.tone}`}>
                <Icon size={34} fill="currentColor" strokeWidth={1.8} />
              </div>
              <div>
                <p className="kpi-card__label">{item.label}</p>
                <strong>{item.value}</strong>
                <p className="kpi-card__description">{item.description}</p>
              </div>
            </article>
          );
        })}

        <article className="dashboard-card dashboard-card--large">
          <CardHeader title="지원자 스크리닝 점수 TOP 5" hasLink />

          <table className="dashboard-table screening-table">
            <colgroup>
              <col className="screening-table__rank" />
              <col className="screening-table__name" />
              <col className="screening-table__role" />
              <col className="screening-table__score" />
              <col className="screening-table__summary" />
            </colgroup>
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
              {screeningRows.map(([rank, name, role, score, summary]) => (
                <tr key={rank}>
                  <td>
                    <span className="rank-badge">{rank}</span>
                  </td>
                  <td>{name}</td>
                  <td>{role}</td>
                  <td>
                    <div className="score-cell">
                      <span className="score-badge">{score}점</span>
                      <ProgressBar value={score} compact />
                    </div>
                  </td>
                  <td>{summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="dashboard-card dashboard-card--large">
          <CardHeader title="전체 연차 현황" />

          <div className="leave-summary-grid">
            {leaveSummary.map((item) => (
              <div className={`leave-summary leave-summary--${item.tone}`} key={item.label}>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                <div className="leave-summary__progress">
                  <ProgressBar value={item.percent} tone={item.tone} />
                  <span>{item.goal}</span>
                </div>
              </div>
            ))}
          </div>

          <h3 className="dashboard-subtitle">부서별 연차 요약</h3>
          <table className="dashboard-table leave-table">
            <thead>
              <tr>
                <th>부서</th>
                <th>평균 잔여 연차</th>
                <th>사용 연차</th>
              </tr>
            </thead>
            <tbody>
              {departmentLeaveRows.map(([department, remaining, used, percent, Icon]) => (
                <tr key={department}>
                  <td>
                    <span className="department-name">
                      <Icon size={18} />
                      {department}
                    </span>
                  </td>
                  <td>
                    <span className="leave-remaining">
                      {remaining}
                      <ProgressBar value={percent} compact />
                    </span>
                  </td>
                  <td>{used}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="dashboard-card dashboard-card--medium">
          <CardHeader title="결재 대기 문서" hasLink />

          <table className="dashboard-table approval-table">
            <thead>
              <tr>
                <th>문서 유형</th>
                <th>신청자</th>
                <th>신청일</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {approvalRows.map((row) => {
                const Icon = row.icon;
                return (
                  <tr key={row.type}>
                    <td>
                      <span className="document-type">
                        <span className={`document-type__icon document-type__icon--${row.tone}`}>
                          <Icon size={19} />
                        </span>
                        {row.type}
                      </span>
                    </td>
                    <td>{row.person}</td>
                    <td>{row.date}</td>
                    <td>
                      <span className="status-badge">승인 대기</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </article>

        <article className="dashboard-card dashboard-card--medium">
          <CardHeader title="부서별 인원 현황" hasLink />

          <div className="headcount-layout">
            <table className="dashboard-table headcount-table">
              <thead>
                <tr>
                  <th>부서</th>
                  <th>인원</th>
                  <th>팀장</th>
                  <th>최근 변동</th>
                </tr>
              </thead>
              <tbody>
                {headcountRows.map(([department, count, leader, change, Icon]) => (
                  <tr key={department}>
                    <td>
                      <span className="department-name">
                        <Icon size={18} />
                        {department}
                      </span>
                    </td>
                    <td>{count}</td>
                    <td>{leader}</td>
                    <td>
                      <span className={`change-badge ${change === "0" ? "change-badge--neutral" : ""}`}>
                        {change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="donut-panel">
              <div className="donut-chart" aria-label="부서별 인원 도넛 차트">
                <div>
                  <span>전체</span>
                  <strong>91명</strong>
                </div>
              </div>
              <ul className="donut-legend">
                {donutSegments.map((segment) => (
                  <li key={segment.label}>
                    <span style={{ backgroundColor: segment.color }} />
                    <b>{segment.label}</b>
                    <em>{segment.value}</em>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default AdminDashboard;
