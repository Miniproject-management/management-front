import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getLeaveDetailApi } from "../../api/leaveApi";

import "../../styles/approvalDetail.css";

function ApprovalDetailPage() {
  const { leaveId } = useParams();

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

  if (!leave) {
    return <div>로딩중...</div>;
  }

  return (
    <div className="detail-page">
      <div className="detail-card">
        <h1>전자결재 상세</h1>

        <div className="detail-item">
          <span>사번</span>
          <p>{leave.empNo}</p>
        </div>

        <div className="detail-item">
          <span>이름</span>
          <p>{leave.empName}</p>
        </div>

        <div className="detail-item">
          <span>부서</span>
          <p>{leave.deptName}</p>
        </div>

        <div className="detail-item">
          <span>연차 종류</span>
          <p>{leave.leaveType}</p>
        </div>

        <div className="detail-item">
          <span>기간</span>
          <p>
            {leave.startDate} ~{" "}
            {leave.endDate}
          </p>
        </div>

        <div className="detail-item">
          <span>일수</span>
          <p>{leave.leaveDays}일</p>
        </div>

        <div className="detail-item">
          <span>상태</span>
          <p>
            {
              statusMap[
                leave.leaveStatus
              ]
            }
          </p>
        </div>

        <div className="detail-item">
          <span>사유</span>
          <p>{leave.reason}</p>
        </div>
      </div>
    </div>
  );
}

export default ApprovalDetailPage;