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
import { getDepartmentTreeApi } from "../../api/departmentApi";
import { getEmployeesApi } from "../../api/employeeApi";
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

const DEPT_COLORS = ["#64748B", "#94A3B8", "#CBD5E1", "#86A789", "#A7C7A1", "#D8E2DC", "#E5E7EB"];

function formatShortDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function dateTimeValue(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function isTeamLeader(emp) {
  const position = String(emp?.position || "").toLowerCase();
  const title = String(emp?.jobTitle || "").toLowerCase();
  return position.includes("팀장") || position.includes("leader") || title.includes("팀장") || title.includes("leader");
}

function buildDonutGradient(segments) {
  if (!segments.length) return "conic-gradient(#E5E7EB 0deg 360deg)";
  let cursor = 0;
  const stops = segments.map((segment) => {
    const start = cursor;
    const end = cursor + segment.degrees;
    cursor = end;
    return `${segment.color} ${start}deg ${end}deg`;
  });
  return `conic-gradient(${stops.join(", ")})`;
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
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [applicantRows, setApplicantRows] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(true);
  const [applicantsError, setApplicantsError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([getAdminDashboardApi(), getDepartmentTreeApi(), getEmployeesApi()])
      .then(([dashboardRes, deptRes, employeeRes]) => {
        if (cancelled) return;
        if (dashboardRes.status === "fulfilled") {
          setData(dashboardRes.value);
        } else {
          console.error("인사팀 대시보드 조회 실패", dashboardRes.reason);
          setError(dashboardRes.reason);
        }
        if (deptRes.status === "fulfilled") {
          setDepartments(deptRes.value || []);
        } else {
          console.error("부서 트리 조회 실패", deptRes.reason);
        }
        if (employeeRes.status === "fulfilled") {
          setEmployees(Array.isArray(employeeRes.value) ? employeeRes.value : []);
        } else {
          console.error("사원 목록 조회 실패", employeeRes.reason);
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

  const applicantRowsSorted = useMemo(
    () =>
      [...applicantRows].sort((a, b) => {
        const bTime = dateTimeValue(b.submittedAt) || dateTimeValue(b.analyzedAt) || Number(b.applicantId || 0);
        const aTime = dateTimeValue(a.submittedAt) || dateTimeValue(a.analyzedAt) || Number(a.applicantId || 0);
        return bTime - aTime;
      }),
    [applicantRows],
  );

  const applicantStats = useMemo(() => {
    const scores = applicantRows
      .map((row) => clampScore0to100(row.overallScore))
      .filter((score) => score != null);
    const avgScore =
      scores.length === 0
        ? null
        : Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length);
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay() || 7;
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - day + 1);
    const datedRows = applicantRows.filter((row) => dateTimeValue(row.submittedAt) > 0);
    const newThisWeek = datedRows.length
      ? datedRows.filter((row) => new Date(row.submittedAt) >= startOfWeek).length
      : applicantRows.length;
    return {
      newThisWeek,
      avgScore,
      highScoreCount: scores.filter((score) => score >= 85).length,
    };
  }, [applicantRows, today]);

  const departmentRows = useMemo(() => {
    const byDept = employees.reduce((acc, emp) => {
      const key = emp.deptName || "미지정";
      if (!acc.has(key)) acc.set(key, []);
      acc.get(key).push(emp);
      return acc;
    }, new Map());
    const names = departments.length
      ? departments.map((dept) => dept.deptName)
      : Array.from(byDept.keys());

    return names.map((deptName) => {
      const dept = departments.find((item) => item.deptName === deptName);
      const members = byDept.get(deptName) || [];
      const currentMonthHires = members.filter((emp) => {
        const hireDate = new Date(emp.hireDate);
        return (
          !Number.isNaN(hireDate.getTime()) &&
          hireDate.getFullYear() === today.getFullYear() &&
          hireDate.getMonth() === today.getMonth()
        );
      }).length;
      const leader = members.find(isTeamLeader);
      return {
        deptNo: dept?.deptNo ?? deptName,
        deptName,
        employeeCount: members.length || Number(dept?.employeeCount || 0),
        leaderName: leader?.empName || "-",
        recentChange: currentMonthHires,
      };
    });
  }, [departments, employees, today]);

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

  const totalHeadcount = useMemo(
    () => departmentRows.reduce((acc, d) => acc + Number(d.employeeCount || 0), 0),
    [departmentRows],
  );

  const donutSegments = useMemo(() => {
    if (departmentRows.length === 0 || totalHeadcount === 0) return [];
    return departmentRows.map((dept, index) => {
      const count = Number(dept.employeeCount || 0);
      const rawPercent = (count / totalHeadcount) * 100;
      return {
        label: dept.deptName,
        value: `${count}명 (${rawPercent.toFixed(1)}%)`,
        degrees: (count / totalHeadcount) * 360,
        color: DEPT_COLORS[index % DEPT_COLORS.length],
      };
    });
  }, [departmentRows, totalHeadcount]);

  const donutGradient = useMemo(() => buildDonutGradient(donutSegments), [donutSegments]);

  const kpis = [
    {
      label: "전체 임직원",
      value: totalHeadcount > 0 ? `${totalHeadcount}명` : "-",
      description: `${departmentRows.length}개 부서 합계`,
      icon: Users,
      tone: "orange",
    },
    {
      label: "신규 지원자",
      value: `${applicantStats.newThisWeek}명`,
      description: "이번 주 기준",
      icon: UserPlus,
      tone: "green",
    },
    {
      label: "평균 스크리닝 점수",
      value: applicantStats.avgScore == null ? "-" : `${applicantStats.avgScore}점`,
      description: `고득점 후보 ${applicantStats.highScoreCount}명`,
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
                  applicantRowsSorted.slice(0, 5).map((row, index) => {
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
          <CardHeader title="결재 대기 문서" hasLink linkTo="/approval" />

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
          <CardHeader title="부서별 인원 현황" hasLink linkTo="/department" />

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
                {loading ? (
                  <tr><td colSpan="4" className="dashboard-table__empty">불러오는 중...</td></tr>
                ) : departmentRows.length === 0 ? (
                  <tr><td colSpan="4" className="dashboard-table__empty">부서 정보를 불러올 수 없습니다.</td></tr>
                ) : (
                  departmentRows.map((dept) => {
                    const Icon = DEPT_ICON[dept.deptName] || Users;
                    const changeClass =
                      dept.recentChange > 0
                        ? "change-badge--positive"
                        : dept.recentChange < 0
                          ? "change-badge--negative"
                          : "change-badge--neutral";
                    const changeLabel =
                      dept.recentChange > 0
                        ? `+${dept.recentChange}`
                        : String(dept.recentChange);
                    return (
                      <tr key={dept.deptNo}>
                        <td>
                          <span className="department-name">
                            <Icon size={18} />
                            {dept.deptName}
                          </span>
                        </td>
                        <td>{dept.employeeCount}명</td>
                        <td>{dept.leaderName}</td>
                        <td>
                          <span className={`change-badge ${changeClass}`}>{changeLabel}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="donut-panel">
              <div
                className="donut-chart"
                style={{ "--donut-gradient": donutGradient }}
                aria-label="부서별 인원 도넛 차트"
              >
                <div>
                  <span>전체</span>
                  <strong>{loading ? "..." : `${totalHeadcount}명`}</strong>
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
