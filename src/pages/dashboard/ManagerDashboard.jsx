import {
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Filter,
  Plane,
  Umbrella,
  Users,
} from "lucide-react";

import "./dashboard.css";

const managerKpis = [
  {
    label: "우리 팀 인원",
    value: "12명",
    note: "전월 대비 + 1명",
    icon: Users,
    tone: "blue",
  },
  {
    label: "오늘 휴가",
    value: "2명",
    note: "연차 1명 / 반차 1명",
    icon: Umbrella,
    tone: "green",
  },
  {
    label: "승인 대기",
    value: "4건",
    note: "처리 필요",
    icon: ClipboardCheck,
    tone: "purple",
  },
  {
    label: "팀 평균 잔여 연차",
    value: "8.7일",
    note: "부서 내 기준",
    icon: CalendarCheck,
    tone: "orange",
  },
];

const teamMembers = [
  ["김민수", "Backend", "6.5일", "8.5일", "1일"],
  ["이서연", "DevOps", "4일", "11일", "0일"],
  ["박서연", "Security", "7일", "8일", "0.5일"],
  ["정다은", "UI/UX", "5일", "10일", "0일"],
  ["최지훈", "Backend", "3일", "7일", "0일"],
];

const teamRoles = [
  ["Backend", "4명", "9.0일"],
  ["DevOps", "2명", "7.5일"],
  ["Security", "2명", "8.8일"],
  ["UI/UX", "2명", "9.2일"],
  ["기획", "2명", "8.1일"],
];

const approvalRows = [
  ["연차 신청", "김민수", "05.19", CalendarPlus],
  ["반차 신청", "이서연", "05.19", Plane],
  ["연차 신청", "박서연", "05.18", CalendarPlus],
];

const activities = [
  [CalendarDays, "김민수님이 연차를 신청했습니다.", "05.19 10:21", "blue"],
  [Umbrella, "박서연님이 반차 승인이 등록되었습니다.", "05.18 09:45", "green"],
  [FileText, "정다은님이 연차 신청이 승인 대기 중입니다.", "05.18 12:21", "purple"],
  [CalendarCheck, "최지훈님이 반차 신청이 등록되었습니다.", "05.18 11:06", "orange"],
];

const upcomingLeaves = [
  ["김민수", "05.21 (수) ~ 05.22 (목)", "연차 (2일)", "blue"],
  ["정다은", "05.30 (금)", "연차 (1일)", "purple"],
  ["이서연", "05.26 (월)", "반차 (오후)", "orange"],
  ["박서연", "06.02 (월) ~ 06.03 (화)", "연차 (2일)", "blue"],
];

const calendarWeeks = [
  ["27", "28", "29", "30", "1", "2", "3"],
  ["4", "5", "6", "7", "8", "9", "10"],
  ["11", "12", "13", "14", "15", "16", "17"],
  ["18", "19", "20", "21", "22", "23", "24"],
  ["25", "26", "27", "28", "29", "30", "31"],
];

function ManagerProgress({ value, total = 15, label }) {
  const percent = Math.min(100, Math.round((value / total) * 100));

  return (
    <div className="manager-progress" aria-label={label}>
      <span style={{ height: `${percent}%` }} />
      <b>{value}</b>
    </div>
  );
}

function MiniDot({ tone }) {
  return <span className={`manager-dot manager-dot--${tone}`} />;
}

function ManagerDashboard() {
  return (
    <section className="manager-dashboard">
      <header className="manager-dashboard__header">
        <div>
          <h1>대시보드 개요 <span aria-hidden="true">👋</span></h1>
          <p>우리 팀과 나의 현황을 한눈에 확인하세요.</p>
        </div>

        <div className="manager-dashboard__actions">
          <button className="manager-date-button" type="button">
            <CalendarDays size={18} />
            2025.05.19 (월)
            <ChevronDown size={17} />
          </button>
          <button className="manager-icon-button" type="button" aria-label="필터">
            <Filter size={19} />
          </button>
        </div>
      </header>

      <div className="manager-dashboard__grid">
        {managerKpis.map(({ label, value, note, icon: Icon, tone }) => (
          <article className="manager-card manager-kpi" key={label}>
            <div className={`manager-kpi__icon manager-tone-${tone}`}>
              <Icon size={32} strokeWidth={2.1} />
            </div>
            <div>
              <p>{label}</p>
              <strong>{value}</strong>
              <span>{note}</span>
            </div>
          </article>
        ))}

        <article className="manager-card manager-card--leave">
          <div className="manager-card__head">
            <h2>내 연차 현황</h2>
            <button type="button">2025년 <ChevronDown size={14} /></button>
          </div>

          <div className="manager-leave-layout">
            <div className="manager-leave-donut">
              <div className="manager-ring">
                <strong>12.5일</strong>
                <span>남은 연차</span>
              </div>
              <ul>
                <li><CalendarDays size={16} /> <span>총 연차 일수</span> <b>15일</b></li>
                <li><CalendarCheck size={16} /> <span>사용 연차</span> <b>2.5일</b></li>
                <li><CalendarPlus size={16} /> <span>잔여 연차</span> <b className="is-orange">12.5일</b></li>
              </ul>
            </div>

            <div className="manager-month-chart">
              <div className="manager-month-chart__head">
                <h3>연차 사용 현황</h3>
                <span><i /> 사용 연차 <i className="is-light" /> 잔여 연차</span>
              </div>
              <div className="manager-bars">
                {[13, 12, 11, 12, 12.5].map((remain, index) => (
                  <div className="manager-bar-item" key={remain + index}>
                    <ManagerProgress value={remain} label={`${index + 1}월 잔여 연차`} />
                    <em>{index + 1}월</em>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="manager-card manager-card--team">
          <h2>우리 팀 연차 요약</h2>
          <div className="manager-team-summary">
            <div className="is-blue"><span>이번 달 사용 연차</span><b>8.5일</b></div>
            <div className="is-orange"><span>승인 대기 연차</span><b>1.5일</b></div>
            <div className="is-green"><span>평균 잔여 연차</span><b>8.7일</b></div>
          </div>

          <div className="manager-calendar-head">
            <h3>팀 휴가 일정</h3>
            <div><ChevronLeft size={16} /> <b>2025년 5월</b> <ChevronRight size={16} /></div>
          </div>

          <div className="manager-calendar">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <span className="manager-calendar__weekday" key={day}>{day}</span>
            ))}
            {calendarWeeks.flat().map((day, index) => (
              <span className={day === "19" ? "is-today" : ""} key={`${day}-${index}`}>
                {day}
                {["2", "7", "13", "23"].includes(day) ? <MiniDot tone={day === "13" ? "purple" : day === "23" ? "orange" : "blue"} /> : null}
              </span>
            ))}
          </div>

          <h3 className="manager-section-title">다가오는 휴가</h3>
          <div className="manager-upcoming">
            {upcomingLeaves.map(([name, date, type, tone]) => (
              <div key={`${name}-${date}`}>
                <MiniDot tone={tone} />
                <b>{name}</b>
                <span>{date}</span>
                <em>{type}</em>
              </div>
            ))}
          </div>
          <div className="manager-legend">
            <span><MiniDot tone="blue" /> 연차</span>
            <span><MiniDot tone="orange" /> 반차</span>
            <span><MiniDot tone="purple" /> 승인 대기</span>
          </div>
        </article>

        <article className="manager-card manager-card--table manager-card--members">
          <div className="manager-card__head">
            <h2>팀원 연차 현황</h2>
            <button type="button">전체 보기 <ChevronRight size={14} /></button>
          </div>
          <table className="manager-table">
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
              {teamMembers.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td className={index === 4 && cell !== "0일" ? "is-warn" : ""} key={cell}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="manager-card manager-card--table manager-card--roles">
          <h2>우리 팀 구성</h2>
          <table className="manager-table">
            <thead>
              <tr>
                <th>직무</th>
                <th>인원</th>
                <th>평균 잔여 연차</th>
              </tr>
            </thead>
            <tbody>
              {teamRoles.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell) => <td key={cell}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="manager-card manager-card--table manager-card--approval">
          <h2>결재 대기 문서</h2>
          <table className="manager-table">
            <thead>
              <tr>
                <th>문서 유형</th>
                <th>신청자</th>
                <th>신청일</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {approvalRows.map(([type, name, date, Icon]) => (
                <tr key={`${type}-${name}`}>
                  <td><span className="manager-doc"><Icon size={16} /> {type}</span></td>
                  <td>{name}</td>
                  <td>{date}</td>
                  <td><span className="manager-status">승인 대기</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="manager-card manager-card--activity">
          <h2>최근 팀 활동</h2>
          <ul>
            {activities.map(([Icon, text, time, tone]) => (
              <li key={text}>
                <span className={`manager-activity-icon manager-tone-${tone}`}><Icon size={15} /></span>
                <p>{text}</p>
                <time>{time}</time>
              </li>
            ))}
          </ul>
          <button type="button">더 보기 <ChevronRight size={14} /></button>
        </article>

        <article className="manager-card manager-card--quick">
          <h2>빠른 메뉴</h2>
          <div>
            <button type="button" className="manager-tone-blue"><CalendarPlus size={24} />연차 신청</button>
            <button type="button" className="manager-tone-green"><Umbrella size={24} />반차 신청</button>
            <button type="button" className="manager-tone-purple"><FileText size={24} />내 신청 내역</button>
            <button type="button" className="manager-tone-orange"><CalendarCheck size={24} />팀 휴가 관리</button>
          </div>
        </article>
      </div>
    </section>
  );
}

export default ManagerDashboard;
