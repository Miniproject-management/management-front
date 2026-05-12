import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMyLeaveApi,
  getPendingLeaveApi,
  approveLeaveApi,
  rejectLeaveApi,
} from "../../api/leaveApi";

import "../../styles/approval.css";
import useAuthStore from "../../stores/authStore";

function ApprovalPage() {
  const { role } = useAuthStore();

  const [myLeaves, setMyLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] =
    useState([]);

  // 상태 한글 변환
  const statusMap = {
    PENDING_MANAGER: "팀장 승인 대기",
    PENDING_HR: "인사팀 승인 대기",
    APPROVED: "승인 완료",
    REJECTED: "반려",
    CANCELED: "취소",
  };

  // 내 신청 내역 조회
  const fetchMyLeaves = async () => {
    try {
      const data = await getMyLeaveApi();

      console.log(data);

      setMyLeaves(data);
    } catch (error) {
      console.error(error);
    }
  };

  // 승인 대기 목록 조회
  const fetchPendingLeaves = async () => {
    try {
      const data = await getPendingLeaveApi();

      console.log(data);

      setPendingLeaves(data);
    } catch (error) {
      console.error(error);
    }
  };

  // 승인
  const handleApprove = async (leaveId) => {
    try {
      await approveLeaveApi(leaveId);

      await fetchPendingLeaves();
      await fetchMyLeaves();
    } catch (error) {
      console.error(error);
    }
  };

  // 반려
  const handleReject = async (leaveId) => {
    try {
      await rejectLeaveApi(leaveId);

      await fetchPendingLeaves();
      await fetchMyLeaves();
    } catch (error) {
      console.error(error);
    }
  };

  // 초기 조회
  useEffect(() => {
    const fetchData = async () => {
      await fetchMyLeaves();

      // 사원 아닐 때만 승인 목록 조회
      if (role !== "ROLE_EMPLOYEE") {
        await fetchPendingLeaves();
      }
    };

    fetchData();
  }, [role]);

  return (
    <div className="approval-page">
      {/* 상단 */}
      <div className="approval-header">
        <h1>전자결재</h1>

        <button className="apply-btn">
          + 연차 신청
        </button>
      </div>

      {/* 내 신청 내역 */}
      <section className="approval-section">
        <h2>나의 신청 내역</h2>

        <table className="approval-table">
          <thead>
            <tr>
              <th>기간</th>
              <th>연차 종류</th>
              <th>일수</th>
              <th>상태</th>
              <th>상세</th>
            </tr>
          </thead>

          <tbody>
            {myLeaves.map((leave) => (
              <tr key={leave.leaveId}>
                <td>
                  {leave.startDate} ~{" "}
                  {leave.endDate}
                </td>

                <td>{leave.leaveType}</td>

                <td>{leave.leaveDays}일</td>

                <td>
                  {
                    statusMap[
                      leave.leaveStatus
                    ]
                  }
                </td>

                <td>
                  <Link
                    to={`/approval/${leave.leaveId}`}
                    className="detail-btn"
                  >
                    상세보기
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 승인 요청 목록 */}
      {role !== "ROLE_EMPLOYEE" && (
        <section className="approval-section">
          <h2>승인 요청 목록</h2>

          <table className="approval-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>부서</th>
                <th>연차 종류</th>
                <th>기간</th>
                <th>상태</th>
                <th>상세</th>
                <th>관리</th>
              </tr>
            </thead>

            <tbody>
              {pendingLeaves.map((leave) => (
                <tr key={leave.leaveId}>
                  <td>{leave.empName}</td>

                  <td>{leave.deptName}</td>

                  <td>{leave.leaveType}</td>

                  <td>
                    {leave.startDate} ~{" "}
                    {leave.endDate}
                  </td>

                  <td>
                    {
                      statusMap[
                        leave.leaveStatus
                      ]
                    }
                  </td>

                  <td>
                    <Link
                      to={`/approval/${leave.leaveId}`}
                      className="detail-btn"
                    >
                      상세보기
                    </Link>
                  </td>

                  <td className="action-buttons">
                    <button
                      className="approve-btn"
                      onClick={() =>
                        handleApprove(
                          leave.leaveId
                        )
                      }
                    >
                      승인
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() =>
                        handleReject(
                          leave.leaveId
                        )
                      }
                    >
                      반려
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

export default ApprovalPage;