import { useEffect, useState } from "react";

import {
  getMyLeaveApi,
  getPendingLeaveApi,
  approveLeaveApi,
  rejectLeaveApi,
} from "../../apis/leaveApi";

import "../../styles/approval.css";

function ApprovalPage() {
  const [myLeaves, setMyLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] =
    useState([]);

  // 내 신청 내역 조회
  const fetchMyLeaves = async () => {
    try {
      const data = await getMyLeaveApi();
      setMyLeaves(data);
    } catch (error) {
      console.error(error);
    }
  };

  // 승인 대기 목록 조회
  const fetchPendingLeaves = async () => {
    try {
      const data = await getPendingLeaveApi();
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
    } catch (error) {
      console.error(error);
    }
  };

  // 반려
  const handleReject = async (leaveId) => {
    try {
      await rejectLeaveApi(leaveId);

      await fetchPendingLeaves();
    } catch (error) {
      console.error(error);
    }
  };

useEffect(() => {
    const fetchData = async () => {
      await fetchMyLeaves();
      await fetchPendingLeaves();
    };

    fetchData();
  }, []);

  return (
    <div className="approval-page">
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
              <th>신청일</th>
              <th>종류</th>
              <th>기간</th>
              <th>상태</th>
            </tr>
          </thead>

          <tbody>
            {myLeaves.map((leave) => (
              <tr key={leave.leaveId}>
                <td>{leave.createdAt}</td>
                <td>{leave.leaveType}</td>
                <td>{leave.days}일</td>
                <td>{leave.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 승인 요청 목록 */}
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
              <th>관리</th>
            </tr>
          </thead>

          <tbody>
            {pendingLeaves.map((leave) => (
              <tr key={leave.leaveId}>
                <td>{leave.empName}</td>
                <td>{leave.department}</td>
                <td>{leave.leaveType}</td>
                <td>{leave.days}일</td>
                <td>{leave.status}</td>

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
    </div>
  );
}

export default ApprovalPage;