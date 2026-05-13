import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Plane,
  Users,
} from "lucide-react";

import useAuthStore from "../../stores/authStore";
import { getUserDashboardApi } from "../../api/dashboardApi";

import "./dashboard.css";

const STATUS_LABEL = {
  PENDING: "승인 대기",
  APPROVED: "승인 완료",
  REJECTED: "반려",
  CANCELED: "취소",
};

const STATUS_TONE = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELED: "rejected",
};

const LEAVE_TYPE_LABEL = {
  ANNUAL: "연차",
  HALF: "반차",
  SICK: "병가",
};

// 부서 팀원: 백엔드 API 추가 후 연동 예정 (현재 더미)
const teamInfo = {
  deptName: "백엔드 개발팀",
  manager: "김팀장",
  totalCount: 6,
};

const teamMembers = [
  { name: "김민수", role: "Backend Developer", status: "재직", tone: "green" },
  { name: "이서연", role: "DevOps Engineer", status: "휴가 중", tone: "orange" },
  { name: "박서연", role: "Security Engineer", status: "재직", tone: "green" },
  { name: "정다은", role: "UI/UX Designer", status: "재직", tone: "green" },
  { name: "최지훈", role: "Backend Developer", status: "출장", tone: "blue" },
];

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function startOfMonth(year, month) {
  return new Date(year, month, 1);
}

function buildCalendarWeeks(year, month) {
  const first = startOfMonth(year, month);
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

function formatDisplayDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dayName = WEEKDAYS[date.getDay()];
  return `${y}.${m}.${d} (${dayName})`;
}

function buildCalendarEvents(schedule) {
  const events = {};
  schedule.forEach((item) => {
    const start = new Date(item.startDate);
    const end = new Date(item.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;

    const tone = item.leaveType === "HALF" ? "orange" : "green";
    const label = LEAVE_TYPE_LABEL[item.leaveType] || "연차";

    const cursor = new Date(start);
    while (cursor <= end) {
      const key = formatDate(cursor);
      events[key] = { label, tone };
      cursor.setDate(cursor.getDate() + 1);
    }
  });
  return events;
}

function findNextLeave(schedule, today) {
  const upcoming = schedule
    .map((item) => ({ ...item, start: new Date(item.startDate) }))
    .filter((item) => !Number.isNaN(item.start.getTime()) && item.start >= today)
    .sort((a, b) => a.start - b.start);
  return upcoming[0] || null;
}

function sumMonthUsage(schedule, year, month) {
  return schedule.reduce((acc, item) => {
    const start = new Date(item.startDate);
    if (Number.isNaN(start.getTime())) return acc;
    if (start.getFullYear() !== year || start.getMonth() !== month) return acc;
    const days = Number(item.leaveDays) || 0;
    return acc + days;
  }, 0);
}

function EmployeeStatus({ status, tone }) {
  return <span className={`employee-status employee-status--${tone}`}>{status}</span>;
}

function EmployeeDashboard() {
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
    getUserDashboardApi(empNo)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("사원 대시보드 조회 실패", err);
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
  const goToday = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const balance = data?.leaveBalance;
  const myRequests = data?.myRequests || [];
  const mySchedule = data?.mySchedule || [];

  const calendarWeeks = useMemo(() => buildCalendarWeeks(year, month), [year, month]);
  const calendarEvents = useMemo(() => buildCalendarEvents(mySchedule), [mySchedule]);

  const monthUsage = useMemo(() => sumMonthUsage(mySchedule, year, month), [mySchedule, year, month]);
  const pendingCount = useMemo(
    () => myRequests.filter((r) => r.status === "PENDING").length,
    [myRequests],
  );
  const nextLeave = useMemo(() => findNextLeave(mySchedule, today), [mySchedule, today]);

  const kpis = [
    {
      label: "남은 연차",
      value: balance ? `${balance.remainingLeave}일` : "-",
      note: balance ? `총 ${balance.totalLeave}일 / 사용 ${balance.usedLeave}일` : "",
      icon: CalendarCheck,
      tone: "green",
    },
    {
      label: "이번 달 사용 연차",
      value: `${monthUsage}일`,
      note: `${today.getMonth() + 1}월 기준`,
      icon: Clock3,
      tone: "orange",
    },
    {
      label: "승인 대기",
      value: `${pendingCount}건`,
      note: pendingCount > 0 ? "결재 대기 중" : "없음",
      icon: ClipboardList,
      tone: "purple",
    },
    {
      label: "다음 휴가",
      value: nextLeave
        ? `${String(new Date(nextLeave.startDate).getMonth() + 1).padStart(2, "0")}.${String(new Date(nextLeave.startDate).getDate()).padStart(2, "0")}`
        : "-",
      note: nextLeave ? LEAVE_TYPE_LABEL[nextLeave.leaveType] || "연차" : "예정 휴가 없음",
      icon: Plane,
      tone: "blue",
    },
  ];

  const todayDisplay = formatDisplayDate(today.toISOString());

  return (
    <section className="employee-dashboard">
      <header className="employee-dashboard__header">
        <div>
          <h1>대시보드 개요</h1>
          <p>내 연차, 휴가, 신청 현황을 한눈에 확인하세요</p>
        </div>

        <button className="employee-date-button" type="button">
          <CalendarDays size={18} />
          {todayDisplay}
          <ChevronDown size={17} />
        </button>
      </header>

      {error ? (
        <p className="employee-dashboard__error">데이터를 불러오지 못했습니다.</p>
      ) : null}

      <div className="employee-dashboard__grid">
        {kpis.map(({ label, value, note, icon: Icon, tone }) => (
          <article className={`employee-card employee-kpi employee-tone-${tone}`} key={label}>
            <div className="employee-kpi__icon">
              <Icon size={29} strokeWidth={2.1} />
            </div>
            <div>
              <p>{label}</p>
              <strong>{loading ? "..." : value}</strong>
              <span>{note}</span>
            </div>
          </article>
        ))}

        <article className="employee-card employee-card--team">
          <div className="employee-card__head">
            <div className="employee-team-title">
              <h2>우리 부서 팀원</h2>
              <p>{teamInfo.deptName} · 팀장 {teamInfo.manager} · 총 {teamInfo.totalCount}명</p>
            </div>
            <button type="button">전체 보기 <ChevronRight size={14} /></button>
          </div>

          <ul className="employee-team-list">
            {teamMembers.map(({ name, role, status, tone }) => (
              <li className="employee-team-item" key={name}>
                <div className="employee-team-item__avatar">
                  <Users size={16} />
                </div>
                <div className="employee-team-item__info">
                  <span className="employee-team-item__name">{name}</span>
                  <span className="employee-team-item__role">{role}</span>
                </div>
                <span className={`employee-status employee-status--${tone === "green" ? "approved" : tone === "orange" ? "rejected" : "pending"}`}>
                  {status}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="employee-card employee-card--history">
          <div className="employee-card__head">
            <h2>최근 신청 내역</h2>
            <button type="button">전체 내역 보기 <ChevronRight size={14} /></button>
          </div>
          <table className="employee-table">
            <thead>
              <tr>
                <th>신청 유형</th>
                <th>대상일</th>
                <th>상태</th>
                <th>일수</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="employee-table__empty">불러오는 중...</td></tr>
              ) : myRequests.length === 0 ? (
                <tr><td colSpan="4" className="employee-table__empty">신청 내역이 없습니다.</td></tr>
              ) : (
                myRequests.slice(0, 5).map((req) => (
                  <tr key={req.leaveId}>
                    <td>{LEAVE_TYPE_LABEL[req.leaveType] || req.leaveType} 신청</td>
                    <td>{formatDisplayDate(req.startDate)}</td>
                    <td>
                      <EmployeeStatus
                        status={STATUS_LABEL[req.status] || req.status}
                        tone={STATUS_TONE[req.status] || "pending"}
                      />
                    </td>
                    <td>{req.leaveDays}일</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </article>

        <article className="employee-card employee-card--calendar">
          <div className="employee-calendar-head">
            <h2>내 휴가 캘린더</h2>
            <div>
              <button type="button" className="employee-calendar-nav" onClick={goPrevMonth} aria-label="이전 달">
                <ChevronLeft size={16} />
              </button>
              <b>{year}년 {month + 1}월</b>
              <button type="button" className="employee-calendar-nav" onClick={goNextMonth} aria-label="다음 달">
                <ChevronRight size={16} />
              </button>
            </div>
            <button type="button" onClick={goToday}>오늘</button>
          </div>

          <div className="employee-calendar">
            {WEEKDAYS.map((day) => (
              <span className="employee-calendar__weekday" key={day}>{day}</span>
            ))}
            {calendarWeeks.flat().map((date, index) => {
              const key = formatDate(date);
              const event = calendarEvents[key];
              const inMonth = date.getMonth() === month;
              const isToday = date.toDateString() === today.toDateString();
              return (
                <span
                  className={`${isToday ? "is-today" : ""} ${inMonth ? "" : "is-other-month"}`}
                  key={`${key}-${index}`}
                >
                  <b>{date.getDate()}</b>
                  {event ? <em className={`employee-event employee-event--${event.tone}`}>{event.label}</em> : null}
                </span>
              );
            })}
          </div>

          <div className="employee-legend">
            <span><i className="is-green" /> 연차</span>
            <span><i className="is-orange" /> 반차</span>
            <span><i className="is-purple" /> 승인 대기</span>
          </div>

          <p className="employee-calendar-summary">
            <span><CalendarCheck size={13} /> 총 {balance ? `${balance.totalLeave}일` : "-"}</span>
            <em>·</em>
            <span><CalendarClock size={13} /> 사용 {balance ? `${balance.usedLeave}일` : "-"}</span>
            <em>·</em>
            <span><CalendarCheck size={13} /> 잔여 {balance ? `${balance.remainingLeave}일` : "-"}</span>
            <em>·</em>
            <span><ClipboardList size={13} /> 승인 대기 {pendingCount}건</span>
          </p>
        </article>
      </div>
    </section>
  );
}

export default EmployeeDashboard;
