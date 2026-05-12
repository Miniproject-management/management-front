import "./dashboard.css";

const summaryCards = [
  {
    label: "전체 임직원",
    value: "124명",
    note: "전월 대비 +3명",
    tone: "blue",
    icon: "인원",
  },
  {
    label: "신규 지원자",
    value: "12명",
    note: "이번 주 기준",
    tone: "green",
    icon: "채용",
  },
  {
    label: "평균 스크리닝 점수",
    value: "84점",
    note: "고득점 후보 3명",
    tone: "purple",
    icon: "점수",
  },
  {
    label: "평균 잔여 연차",
    value: "9.8일",
    note: "전체 직원 기준",
    tone: "orange",
    icon: "연차",
  },
];

const topApplicants = [
  ["1", "김예진", "백엔드 개발자", "92점", "Java · Spring 역량 우수"],
  ["2", "이준호", "보안 담당자", "88점", "보안 프로젝트 경험 보유"],
  ["3", "박서연", "데이터 분석가", "85점", "SQL · Python 역량 확인"],
  ["4", "최민우", "프론트엔드", "78점", "React 경험 보유"],
  ["5", "정다은", "HR Assistant", "74점", "문서화 경험 우수"],
];

const leaveOverview = [
  { label: "이번 달 사용 연차", value: "24.5일", tone: "blue" },
  { label: "승인 대기 연차", value: "6.0일", tone: "orange" },
  { label: "평균 잔여 연차", value: "9.8일", tone: "green" },
];

const departmentLeaveRows = [
  ["개발팀", "8.5일", "12.5일"],
  ["보안팀", "10.2일", "4.0일"],
  ["인사팀", "9.0일", "3.5일"],
  ["기획팀", "11.1일", "4.5일"],
];

const pendingDocs = [
  ["연차 신청", "김민수", "05.19", "승인 대기"],
  ["반차 신청", "이서연", "05.19", "승인 대기"],
  ["부서 이동 요청", "박팀장", "05.18", "승인 대기"],
  ["계정 권한 변경", "최수빈", "05.18", "승인 대기"],
];

const headcountRows = [
  ["개발팀", "46명", "김팀장", "+2"],
  ["보안팀", "18명", "이팀장", "0"],
  ["인사팀", "12명", "박팀장", "+1"],
  ["기획팀", "20명", "최팀장", "-1"],
];

function SectionTable({ columns, rows, type }) {
  return (
    <div className="dashboard-page__table-wrap">
      <table className="dashboard-page__table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell, index) => {
                if (type === "score" && index === 3) {
                  return (
                    <td key={`${cell}-${index}`}>
                      <span className="dashboard-page__score-badge">{cell}</span>
                    </td>
                  );
                }

                if (type === "status" && index === 3) {
                  return (
                    <td key={`${cell}-${index}`}>
                      <span className="dashboard-page__status-badge">{cell}</span>
                    </td>
                  );
                }

                if (type === "delta" && index === 3) {
                  const toneClass =
                    cell.startsWith("+")
                      ? "is-positive"
                      : cell.startsWith("-")
                        ? "is-negative"
                        : "is-neutral";

                  return (
                    <td
                      key={`${cell}-${index}`}
                      className={`dashboard-page__delta ${toneClass}`}
                    >
                      {cell}
                    </td>
                  );
                }

                return <td key={`${cell}-${index}`}>{cell}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DashboardPage() {
  return (
    <section className="dashboard-page">
      <div className="dashboard-page__hero">
        <h1>대시보드 개요</h1>
        <p>조직 현황과 채용, 연차, 결재 상태를 한눈에 확인하세요</p>
      </div>

      <section className="dashboard-page__summary-grid">
        {summaryCards.map((card) => (
          <article
            key={card.label}
            className={`dashboard-page__summary-card tone-${card.tone}`}
          >
            <div className={`dashboard-page__summary-icon tone-${card.tone}`}>
              {card.icon}
            </div>
            <div>
              <p>{card.label}</p>
              <strong>{card.value}</strong>
              <span>{card.note}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-page__content-grid">
        <article className="dashboard-page__panel">
          <div className="dashboard-page__panel-head">
            <h2>지원자 스크리닝 점수 TOP 5</h2>
          </div>
          <SectionTable
            columns={["", "지원자", "지원 직무", "점수", "평가 요약"]}
            rows={topApplicants}
            type="score"
          />
        </article>

        <article className="dashboard-page__panel">
          <div className="dashboard-page__panel-head">
            <h2>전체 연차 현황</h2>
          </div>

          <div className="dashboard-page__mini-grid">
            {leaveOverview.map((item) => (
              <div
                key={item.label}
                className={`dashboard-page__mini-card tone-${item.tone}`}
              >
                <p>{item.label}</p>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="dashboard-page__subhead">부서별 연차 요약</div>
          <SectionTable
            columns={["부서", "평균 잔여 연차", "사용 연차"]}
            rows={departmentLeaveRows}
          />
        </article>

        <article className="dashboard-page__panel">
          <div className="dashboard-page__panel-head">
            <h2>결재 대기 문서</h2>
          </div>
          <SectionTable
            columns={["문서 유형", "신청자", "신청일", "상태"]}
            rows={pendingDocs}
            type="status"
          />
        </article>

        <article className="dashboard-page__panel">
          <div className="dashboard-page__panel-head">
            <h2>부서별 인원 현황</h2>
          </div>
          <SectionTable
            columns={["부서", "인원", "팀장", "최근 변동"]}
            rows={headcountRows}
            type="delta"
          />
        </article>
      </section>
    </section>
  );
}

export default DashboardPage;
