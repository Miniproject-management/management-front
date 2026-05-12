import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getLeaveDetailApi,
  approveLeaveApi,
  rejectLeaveApi,
} from "../../api/leaveApi";

import useAuthStore from "../../stores/authStore";

import "../../styles/approvalDetail.css";

function ApprovalDetailPage() {
  const { leaveId } = useParams();
  const navigate = useNavigate();

  const { role } = useAuthStore();

  const [leave, setLeave] = useState(null);

  const statusMap = {
    PENDING_MANAGER: "팀장 승인 대기",
    PENDING_HR: "인사팀 승인 대기",
    APPROVED: "승인 완료",
    REJECTED: "반려",
    CANCELED: "취소",
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data =
          await getLeaveDetailApi(leaveId);

        setLeave(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDetail();
  }, [leaveId]);

  // 승인
  const handleApprove = async () => {
    try {
      await approveLeaveApi(leaveId);

      alert("승인 완료");

      navigate("/approval");
    } catch (error) {
      console.error(error);
    }
  };

  // 반려
  const handleReject = async () => {
    try {
      await rejectLeaveApi(leaveId);

      alert("반려 완료");

      navigate("/approval");
    } catch (error) {
      console.error(error);
    }
  };

  if (!leave) {
    return <div>로딩중...</div>;
  }

  return (
    <div className="detail-page">
      <div className="detail-card">
        {/* 상단 */}
        <div className="detail-header">
          <div>
            <h1>전자결재 상세</h1>

            <p>
              연차 신청 상세 정보입니다.
            </p>
          </div>

          <div className="status-badge">
            {
              statusMap[
                leave.leaveStatus
              ]
            }
          </div>
        </div>

        {/* 정보 영역 */}
        <div className="detail-grid">
          <div className="detail-box">
            <span>사번</span>
            <p>{leave.empNo}</p>
          </div>

          <div className="detail-box">
            <span>이름</span>
            <p>{leave.empName}</p>
          </div>

          <div className="detail-box">
            <span>부서</span>
            <p>{leave.deptName}</p>
          </div>

          <div className="detail-box">
            <span>연차 종류</span>
            <p>{leave.leaveType}</p>
          </div>

          <div className="detail-box">
            <span>기간</span>

            <p>
              {leave.startDate} ~{" "}
              {leave.endDate}
            </p>
          </div>

          <div className="detail-box">
            <span>일수</span>
            <p>{leave.leaveDays}일</p>
          </div>
        </div>

        {/* 사유 */}
        <div className="reason-box">
          <span>사유</span>

          <p>{leave.reason}</p>
        </div>

        {/* 승인/반려 버튼 */}
        {role !== "ROLE_EMPLOYEE" && (
          <div className="detail-actions">
            <button
              className="approve-btn"
              onClick={handleApprove}
            >
              승인
            </button>

            <button
              className="reject-btn"
              onClick={handleReject}
            >
              반려
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApprovalDetailPage;