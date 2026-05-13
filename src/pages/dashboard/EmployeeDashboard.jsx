import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Plane,
} from "lucide-react";

import "./dashboard.css";

const employeeKpis = [
  {
    label: "남은 연차",
    value: "8.5일",
    note: "총 15일 / 사용 6.5일",
    icon: CalendarCheck,
    tone: "green",
  },
  {
    label: "이번 달 사용 연차",
    value: "1.5일",
    note: "연차 1일 / 반차 0.5일",
    icon: Clock3,
    tone: "orange",
  },
  {
    label: "승인 대기",
    value: "1건",
    note: "연차 신청 1건",
    icon: ClipboardList,
    tone: "purple",
  },
  {
    label: "다음 휴가",
    value: "05.22",
    note: "연차 승인 완료",
    icon: Plane,
    tone: "blue",
  },
];

const requestRows = [
  ["연차 신청", "2025.05.24 (토)", "승인 대기", "김팀장", "pending"],
  ["반차 신청", "2025.05.15 (목) 오후", "승인 완료", "김팀장", "approved"],
  ["연차 신청", "2025.05.22 (목)", "승인 완료", "김팀장", "approved"],
  ["연차 신청", "2025.05.18 (일)", "반려", "김팀장", "rejected"],
];

const calendarWeeks = [
  ["27", "28", "29", "30", "1", "2", "3"],
  ["4", "5", "6", "7", "8", "9", "10"],
  ["11", "12", "13", "14", "15", "16", "17"],
  ["18", "19", "20", "21", "22", "23", "24"],
  ["25", "26", "27", "28", "29", "30", "31"],
];

const calendarEvents = {
  15: { label: "반차", tone: "orange" },
  19: { label: "연차", tone: "green" },
  22: { label: "연차", tone: "green" },
  24: { label: "대기", tone: "purple" },
};

function EmployeeStatus({ status, tone }) {
  return <span className={`employee-status employee-status--${tone}`}>{status}</span>;
}

function EmployeeDashboard() {
  return (
    <section className="employee-dashboard">
      <header className="employee-dashboard__header">
        <div>
          <h1>대시보드 개요</h1>
          <p>내 연차, 휴가, 신청 현황을 한눈에 확인하세요</p>
        </div>

        <button className="employee-date-button" type="button">
          <CalendarDays size={18} />
          2025.05.19 (월)
          <ChevronDown size={17} />
        </button>
      </header>

      <div className="employee-dashboard__grid">
        {employeeKpis.map(({ label, value, note, icon: Icon, tone }) => (
          <article className={`employee-card employee-kpi employee-tone-${tone}`} key={label}>
            <div className="employee-kpi__icon">
              <Icon size={29} strokeWidth={2.1} />
            </div>
            <div>
              <p>{label}</p>
              <strong>{value}</strong>
              <span>{note}</span>
            </div>
          </article>
        ))}

        <article className="employee-card employee-card--quick">
          <h2>빠른 메뉴</h2>
          <div className="employee-quick-grid">
            <button type="button" className="employee-tone-green">
              <CalendarPlus size={26} />
              연차 신청
            </button>
            <button type="button" className="employee-tone-orange">
              <Clock3 size={26} />
              반차 신청
            </button>
            <button type="button" className="employee-tone-blue">
              <CalendarDays size={26} />
              휴가 일정 보기
            </button>
            <button type="button" className="employee-tone-purple">
              <ClipboardList size={26} />
              신청 내역 보기
            </button>
          </div>
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
                <th>결재자</th>
              </tr>
            </thead>
            <tbody>
              {requestRows.map(([type, date, status, approver, tone]) => (
                <tr key={`${type}-${date}`}>
                  <td>{type}</td>
                  <td>{date}</td>
                  <td><EmployeeStatus status={status} tone={tone} /></td>
                  <td>{approver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="employee-card employee-card--calendar">
          <div className="employee-calendar-head">
            <h2>내 휴가 캘린더</h2>
            <div>
              <ChevronLeft size={16} />
              <b>2025년 5월</b>
              <ChevronRight size={16} />
            </div>
            <button type="button">오늘</button>
          </div>

          <div className="employee-calendar">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <span className="employee-calendar__weekday" key={day}>{day}</span>
            ))}
            {calendarWeeks.flat().map((day, index) => {
              const event = calendarEvents[day];
              return (
                <span className={day === "19" ? "is-today" : ""} key={`${day}-${index}`}>
                  <b>{day}</b>
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
        </article>

        <article className="employee-card employee-card--summary">
          <h2>연차 요약</h2>
          <div className="employee-summary-grid">
            <div><CalendarCheck size={24} /><span>총 연차</span><strong>15일</strong></div>
            <div><CalendarClock size={24} /><span>사용</span><strong>6.5일</strong></div>
            <div><CalendarCheck size={24} /><span>잔여</span><strong>8.5일</strong></div>
            <div><ClipboardList size={24} /><span>승인 대기</span><strong>1건</strong></div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default EmployeeDashboard;
