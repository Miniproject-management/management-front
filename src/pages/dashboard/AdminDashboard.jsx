import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

import { getAdminDashboardApi } from "../../api/dashboardApi";
import { fetchHrApplicantDashboard } from "../../api/api.jsx";

import "./dashboard.css";

const LEAVE_TYPE_LABEL = {
  ANNUAL: "연차",
  HALF: "반차",
  SICK: "병가",
};

const LEAVE_TYPE_META = {
  ANNUAL: { icon: CalendarPlus, tone: "orange" },
  HALF: { icon: Plane, tone: "green" },
  SICK: { icon: ClipboardCheck, tone: "purple" },
};

const STATUS_LABEL = {
  PENDING: "승인 대기",
  APPROVED: "승인 완료",
  REJECTED: "반려",
  CANCELED: "취소",
};

const DEPT_ICON = {
  개발팀: Users,
  보안팀: ShieldCheck,
  인사팀: ClipboardCheck,
  기획팀: BriefcaseBusiness,
};

const ANALYSIS_STATUS_LABEL = {
  PENDING: "분석 대기",
  COMPLETED: "분석 완료",
  FAILED: "분석 실패",
};

function formatAnalysisStatus(status) {
  if (!status) return "미분석";
  return ANALYSIS_STATUS_LABEL[status] || status;
}

function clampScore0to100(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

const headcountRows = [
  ["개발팀", "46명", "김팀장", "+2"],
  ["보안팀", "18명", "이팀장", "0"],
  ["인사팀", "12명", "박팀장", "+1"],
  ["기획팀", "15명", "최팀장", "-1"],
];

const donutSegments = [
  { label: "개발팀", value: "46명 (50.5%)", color: "#F97316" },
  { label: "보안팀", value: "18명 (19.8%)", color: "#FDBA74" },
  { label: "인사팀", value: "12명 (13.2%)", color: "#FDE68A" },
  { label: "기획팀", value: "15명 (16.5%)", color: "#FACC15" },
];

function formatShortDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function CardHeader({ title, hasLink = false, hint = null, linkTo = null }) {
  const linkContent = (
    <>
      전체 보기 <ChevronRight size={15} strokeWidth={2.4} />
    </>
  );
  return (
    <div className="dashboard-card__header">
      <h2>
        {title}
        {hint ? <span className="dashboard-card__hint">{hint}</span> : null}
      </h2>
      {hasLink ? (
        linkTo ? (
          <Link className="dashboard-card__link" to={linkTo}>
            {linkContent}
          </Link>
        ) : (
          <button className="dashboard-card__link" type="button">
            {linkContent}
          </button>
        )
      ) : null}
    </div>
  );
}

function ProgressBar({ value, tone = "orange", compact = false }) {
  return (
    <span className={`progress-bar progress-bar--${tone} ${compact ? "progress-bar--compact" : ""}`}>
      <span style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </span>
  );
}

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicantRows, setApplicantRows] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(true);
  const [applicantsError, setApplicantsError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAdminDashboardApi()
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("인사팀 대시보드 조회 실패", err);
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setApplicantsLoading(true);
    fetchHrApplicantDashboard()
      .then((rows) => {
        if (!cancelled) {
          setApplicantRows(Array.isArray(rows) ? rows : []);
          setApplicantsError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("지원자 대시보드(ATS) 조회 실패", err);
          setApplicantRows([]);
          setApplicantsError(err);
        }
      })
      .finally(() => {
        if (!cancelled) setApplicantsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const today = useMemo(() => new Date(), []);
  const companyAvgUsage = data?.companyAverageUsage;
  const deptSummaries = data?.deptSummaries || [];
  const allRequests = data?.allRequests || [];

  const avgRemaining = useMemo(() => {
    if (deptSummaries.length === 0) return null;
    const sum = deptSummaries.reduce((acc, d) => acc + Number(d.avgRemainingLeave || 0), 0);
    return (sum / deptSummaries.length).toFixed(1);
  }, [deptSummaries]);

  const pendingRequests = useMemo(
    () => allRequests.filter((r) => r.status === "PENDING"),
    [allRequests],
  );

  const monthUsedDays = useMemo(() => {
    return allRequests.reduce((acc, r) => {
      if (r.status !== "APPROVED") return acc;
      const start = new Date(r.startDate);
      if (Number.isNaN(start.getTime())) return acc;
      if (start.getFullYear() !== today.getFullYear() || start.getMonth() !== today.getMonth()) return acc;
      return acc + Number(r.leaveDays || 0);
    }, 0);
  }, [allRequests, today]);

  const pendingDays = useMemo(
    () => pendingRequests.reduce((acc, r) => acc + Number(r.leaveDays || 0), 0),
    [pendingRequests],
  );

  const kpis = [
    {
      label: "전체 임직원",
      value: "91명",
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
      value: avgRemaining ? `${avgRemaining}일` : "-",
      description: "전체 직원 기준",
      icon: CalendarDays,
      tone: "orange",
    },
  ];

  const leaveSummary = [
    {
      label: "이번 달 사용 연차",
      value: `${monthUsedDays.toFixed(1)}일`,
      goal: "회사 전체",
      percent: companyAvgUsage != null ? Number(companyAvgUsage) : 0,
      tone: "orange",
    },
    {
      label: "승인 대기 연차",
      value: `${pendingDays.toFixed(1)}일`,
      goal: `${pendingRequests.length}건 대기`,
      percent: Math.min(pendingDays * 5, 100),
      tone: "orange",
    },
    {
      label: "평균 잔여 연차",
      value: avgRemaining ? `${avgRemaining}일` : "-",
      goal: "전체 부서 평균",
      percent: avgRemaining ? Math.min(Number(avgRemaining) * 6, 100) : 0,
      tone: "green",
    },
  ];

  return (
    <section className="dashboard-page admin-dashboard">
      <header className="dashboard-page__header">
        <div className="dashboard-page__hero">
          <h1>대시보드 개요</h1>
          <p>조직 현황과 채용, 연차, 결재 상태를 한눈에 확인하세요</p>
        </div>

        <button className="dashboard-date-button" type="button">
          <CalendarDays size={20} />
          <span>{`${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`}</span>
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
                <strong>{loading ? "..." : item.value}</strong>
                <p className="kpi-card__description">{item.description}</p>
              </div>
            </article>
          );
        })}

        <article className="dashboard-card dashboard-card--large">
          <CardHeader
            title="지원자 스크리닝 (최신순)"
            hasLink
            linkTo="/resume"
            hint={applicantsError ? "목록을 불러오지 못했습니다" : null}
          />

          <div className="screening-table-scroll">
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
                  <th>상태</th>
                  <th>점수</th>
                  <th>평가 요약</th>
                </tr>
              </thead>
              <tbody>
                {applicantsLoading ? (
                  <tr>
                    <td colSpan="5" className="dashboard-table__empty">
                      불러오는 중...
                    </td>
                  </tr>
                ) : applicantsError ? (
                  <tr>
                    <td colSpan="5" className="dashboard-table__empty">
                      {applicantsError.message || "지원자 목록을 불러오지 못했습니다."}
                    </td>
                  </tr>
                ) : applicantRows.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="dashboard-table__empty">
                      등록된 지원자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  applicantRows.map((row, index) => {
                    const rank = index + 1;
                    const score = clampScore0to100(row.overallScore);
                    const summary = row.summaryPreview?.trim() || "—";
                    return (
                      <tr key={row.applicantId ?? `${row.name}-${index}`}>
                        <td>
                          <span className="rank-badge">{rank}</span>
                        </td>
                        <td>{row.name || "—"}</td>
                        <td>{formatAnalysisStatus(row.analysisStatus)}</td>
                        <td>
                          <div className="score-cell">
                            <span className="score-badge">
                              {score != null ? `${score}점` : "점수 없음"}
                            </span>
                            <ProgressBar value={score ?? 0} compact />
                          </div>
                        </td>
                        <td title={summary !== "—" ? summary : undefined}>{summary}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="dashboard-card dashboard-card--large">
          <CardHeader title="전체 연차 현황" />

          <div className="leave-summary-grid">
            {leaveSummary.map((item) => (
              <div className={`leave-summary leave-summary--${item.tone}`} key={item.label}>
                <p>{item.label}</p>
                <strong>{loading ? "..." : item.value}</strong>
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
                <th>평균 사용 연차</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="dashboard-table__empty">불러오는 중...</td></tr>
              ) : deptSummaries.length === 0 ? (
                <tr><td colSpan="3" className="dashboard-table__empty">부서 데이터가 없습니다.</td></tr>
              ) : (
                deptSummaries.map((dept) => {
                  const Icon = DEPT_ICON[dept.deptName] || Users;
                  const total = Number(dept.avgTotalLeave) || 1;
                  const percent = (Number(dept.avgUsedLeave) / total) * 100;
                  return (
                    <tr key={dept.deptName}>
                      <td>
                        <span className="department-name">
                          <Icon size={18} />
                          {dept.deptName}
                        </span>
                      </td>
                      <td>
                        <span className="leave-remaining">
                          {Number(dept.avgRemainingLeave).toFixed(1)}일
                          <ProgressBar value={percent} compact />
                        </span>
                      </td>
                      <td>{Number(dept.avgUsedLeave).toFixed(1)}일</td>
                    </tr>
                  );
                })
              )}
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
              {loading ? (
                <tr><td colSpan="4" className="dashboard-table__empty">불러오는 중...</td></tr>
              ) : pendingRequests.length === 0 ? (
                <tr><td colSpan="4" className="dashboard-table__empty">결재 대기 문서가 없습니다.</td></tr>
              ) : (
                pendingRequests.slice(0, 6).map((req) => {
                  const meta = LEAVE_TYPE_META[req.leaveType] || LEAVE_TYPE_META.ANNUAL;
                  const Icon = meta.icon;
                  return (
                    <tr key={req.leaveId}>
                      <td>
                        <span className="document-type">
                          <span className={`document-type__icon document-type__icon--${meta.tone}`}>
                            <Icon size={19} />
                          </span>
                          {LEAVE_TYPE_LABEL[req.leaveType] || req.leaveType} 신청
                        </span>
                      </td>
                      <td>{req.empName}<span className="document-type__sub"> · {req.deptName}</span></td>
                      <td>{formatShortDate(req.startDate)}</td>
                      <td>
                        <span className="status-badge">{STATUS_LABEL[req.status] || req.status}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </article>

        <article className="dashboard-card dashboard-card--medium">
          <CardHeader title="부서별 인원 현황" hasLink hint="백엔드 API 연결 예정" />

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
                {headcountRows.map(([department, count, leader, change]) => {
                  const Icon = DEPT_ICON[department] || Users;
                  return (
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
                  );
                })}
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
