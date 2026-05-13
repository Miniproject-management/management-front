import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Plane,
  Umbrella,
  Users,
} from "lucide-react";

import useAuthStore from "../../stores/authStore";
import { getLeaderDashboardApi } from "../../api/dashboardApi";

import "./dashboard.css";

const STATUS_LABEL = {
  PENDING: "승인 대기",
  APPROVED: "승인 완료",
  REJECTED: "반려",
  CANCELED: "취소",
};

const LEAVE_TYPE_LABEL = {
  ANNUAL: "연차",
  HALF: "반차",
  SICK: "병가",
};

const LEAVE_ICON = {
  ANNUAL: CalendarPlus,
  HALF: Plane,
  SICK: ClipboardCheck,
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function buildCalendarWeeks(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const lastDay = new Date(year, month + 1, 0);
  const weeks = [];
  const cursor = new Date(start);
  while (weeks.length < 6) {
    const week = [];
    for (let d = 0; d < 7; d += 1) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    if (week[6] >= lastDay) break;
  }
  return weeks;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildTeamCalendarMap(teamCalendar) {
  const map = {};
  teamCalendar.forEach((item) => {
    const start = new Date(item.startDate);
    const end = new Date(item.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
    const tone = item.leaveType === "HALF" ? "orange" : item.leaveType === "ANNUAL" ? "blue" : "purple";
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = formatDate(cursor);
      if (!map[key]) map[key] = [];
      map[key].push({ tone, empName: item.empName, leaveType: item.leaveType });
      cursor.setDate(cursor.getDate() + 1);
    }
  });
  return map;
}

function formatShortDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${m}.${d}`;
}

function MiniDot({ tone }) {
  return <span className={`manager-dot manager-dot--${tone}`} />;
}

function ManagerDashboard() {
  const { empNo } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!empNo) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getLeaderDashboardApi(empNo)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("팀장 대시보드 조회 실패", err);
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [empNo]);

  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const goPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const myBalance = data?.myLeaveBalance;
  const myRequests = data?.myRequests || [];
  const teamOnLeaveToday = data?.teamOnLeaveToday || [];
  const teamLeaveUsage = data?.teamLeaveUsage || [];
  const teamCalendar = data?.teamCalendar || [];

  const calendarWeeks = useMemo(() => buildCalendarWeeks(year, month), [year, month]);
  const teamCalendarMap = useMemo(() => buildTeamCalendarMap(teamCalendar), [teamCalendar]);

  const avgRemaining = useMemo(() => {
    if (teamLeaveUsage.length === 0) return null;
    const sum = teamLeaveUsage.reduce((acc, m) => acc + Number(m.remainingLeave || 0), 0);
    return (sum / teamLeaveUsage.length).toFixed(1);
  }, [teamLeaveUsage]);

  const pendingCount = useMemo(
    () => myRequests.filter((r) => r.status === "PENDING").length,
    [myRequests],
  );

  const kpis = [
    {
      label: "우리 팀 인원",
      value: `${teamLeaveUsage.length}명`,
      note: "현재 등록 인원",
      icon: Users,
      tone: "blue",
    },
    {
      label: "오늘 휴가",
      value: `${teamOnLeaveToday.length}명`,
      note: teamOnLeaveToday.length > 0
        ? teamOnLeaveToday.map((m) => m.empName).slice(0, 3).join(", ")
        : "휴가 인원 없음",
      icon: Umbrella,
      tone: "green",
    },
    {
      label: "내 승인 대기",
      value: `${pendingCount}건`,
      note: pendingCount > 0 ? "처리 필요" : "없음",
      icon: ClipboardCheck,
      tone: "purple",
    },
    {
      label: "팀 평균 잔여 연차",
      value: avgRemaining ? `${avgRemaining}일` : "-",
      note: "부서 내 기준",
      icon: CalendarCheck,
      tone: "orange",
    },
  ];

  return (
    <section className="manager-dashboard">
      <header className="manager-dashboard__header">
        <div>
          <h1>대시보드 개요</h1>
          <p>우리 팀과 나의 현황을 한눈에 확인하세요.</p>
        </div>

        <div className="manager-dashboard__actions">
          <button className="manager-date-button" type="button">
            <CalendarDays size={18} />
            {`${year}.${String(month + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`}
            <ChevronDown size={17} />
          </button>
        </div>
      </header>

      {error ? <p className="manager-dashboard__error">데이터를 불러오지 못했습니다.</p> : null}

      <div className="manager-dashboard__grid">
        {kpis.map(({ label, value, note, icon: Icon, tone }) => (
          <article className="manager-card manager-kpi" key={label}>
            <div className={`manager-kpi__icon manager-tone-${tone}`}>
              <Icon size={32} strokeWidth={2.1} />
            </div>
            <div>
              <p>{label}</p>
              <strong>{loading ? "..." : value}</strong>
              <span>{note}</span>
            </div>
          </article>
        ))}

        <article className="manager-card manager-card--leave">
          <div className="manager-card__head">
            <h2>내 연차 현황</h2>
            <button type="button">{year}년 <ChevronDown size={14} /></button>
          </div>

          <div className="manager-leave-layout">
            <div className="manager-leave-donut">
              <div className="manager-ring">
                <strong>{myBalance ? `${myBalance.remainingLeave}일` : "-"}</strong>
                <span>남은 연차</span>
              </div>
              <ul>
                <li><CalendarDays size={16} /> <span>총 연차 일수</span> <b>{myBalance ? `${myBalance.totalLeave}일` : "-"}</b></li>
                <li><CalendarCheck size={16} /> <span>사용 연차</span> <b>{myBalance ? `${myBalance.usedLeave}일` : "-"}</b></li>
                <li><CalendarPlus size={16} /> <span>잔여 연차</span> <b className="is-orange">{myBalance ? `${myBalance.remainingLeave}일` : "-"}</b></li>
              </ul>
            </div>
          </div>
        </article>

        <article className="manager-card manager-card--team">
          <div className="manager-calendar-head">
            <h3>팀 휴가 일정</h3>
            <div>
              <button type="button" className="manager-calendar-nav" onClick={goPrevMonth} aria-label="이전 달">
                <ChevronLeft size={16} />
              </button>
              <b>{year}년 {month + 1}월</b>
              <button type="button" className="manager-calendar-nav" onClick={goNextMonth} aria-label="다음 달">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="manager-calendar">
            {WEEKDAYS.map((day) => (
              <span className="manager-calendar__weekday" key={day}>{day}</span>
            ))}
            {calendarWeeks.flat().map((date, index) => {
              const key = formatDate(date);
              const events = teamCalendarMap[key];
              const isToday = date.toDateString() === today.toDateString();
              const inMonth = date.getMonth() === month;
              return (
                <span
                  className={`${isToday ? "is-today" : ""} ${inMonth ? "" : "is-other-month"}`}
                  key={`${key}-${index}`}
                >
                  {date.getDate()}
                  {events ? <MiniDot tone={events[0].tone} /> : null}
                </span>
              );
            })}
          </div>
          <div className="manager-legend">
            <span><MiniDot tone="blue" /> 연차</span>
            <span><MiniDot tone="orange" /> 반차</span>
            <span><MiniDot tone="purple" /> 기타</span>
          </div>
        </article>

        <article className="manager-card manager-card--table manager-card--members">
          <div className="manager-card__head">
            <h2>팀원 연차 현황</h2>
            <Link to="/approval">전체 보기 <ChevronRight size={14} /></Link>
          </div>
          <table className="manager-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>총 연차</th>
                <th>사용 연차</th>
                <th>잔여 연차</th>
                <th>사용률</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="manager-table__empty">불러오는 중...</td></tr>
              ) : teamLeaveUsage.length === 0 ? (
                <tr><td colSpan="5" className="manager-table__empty">팀원 정보가 없습니다.</td></tr>
              ) : (
                teamLeaveUsage.map((m) => (
                  <tr key={m.empNo}>
                    <td>{m.empName}</td>
                    <td>{m.totalLeave}일</td>
                    <td>{m.usedLeave}일</td>
                    <td>{m.remainingLeave}일</td>
                    <td className={Number(m.usageRate) >= 70 ? "is-warn" : ""}>{m.usageRate}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </article>

        <article className="manager-card manager-card--table manager-card--approval">
          <div className="manager-card__head">
            <h2>오늘 휴가 중인 팀원</h2>
          </div>
          <table className="manager-table">
            <thead>
              <tr>
                <th>휴가 유형</th>
                <th>팀원</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="manager-table__empty">불러오는 중...</td></tr>
              ) : teamOnLeaveToday.length === 0 ? (
                <tr><td colSpan="3" className="manager-table__empty">오늘 휴가 인원이 없습니다.</td></tr>
              ) : (
                teamOnLeaveToday.map((m) => {
                  const Icon = LEAVE_ICON[m.leaveType] || CalendarPlus;
                  return (
                    <tr key={`${m.empNo}-${m.leaveType}`}>
                      <td><span className="manager-doc"><Icon size={16} /> {LEAVE_TYPE_LABEL[m.leaveType] || m.leaveType}</span></td>
                      <td>{m.empName}</td>
                      <td><span className="manager-status">휴가 중</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </article>
      </div>
    </section>
  );
}

export default ManagerDashboard;
