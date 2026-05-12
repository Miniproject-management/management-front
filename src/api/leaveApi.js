import api from "./axios";

// 연차 신청
export const applyLeaveApi = async (data) => {
  const response = await api.post(
    "/api/leaves",
    data
  );

  return response.data;
};

// 내 신청 내역
export const getMyLeaveApi = async () => {
  const response = await api.get(
    "/api/leaves/my"
  );

  return response.data;
};

// 승인 대기 목록
export const getPendingLeaveApi = async () => {
  const response = await api.get(
    "/api/leaves/pending"
  );

  return response.data;
};

// 상세 조회
export const getLeaveDetailApi = async (
  leaveId
) => {
  const response = await api.get(
    `/api/leaves/${leaveId}`
  );

  return response.data;
};

// 승인
export const approveLeaveApi = async (
  leaveId
) => {
  const response = await api.patch(
    `/api/leaves/${leaveId}/approve`
  );

  return response.data;
};

// 반려
export const rejectLeaveApi = async (
  leaveId
) => {
  const response = await api.patch(
    `/api/leaves/${leaveId}/reject`
  );

  return response.data;
};

// 취소
export const cancelLeaveApi = async (
  leaveId
) => {
  const response = await api.patch(
    `/api/leaves/${leaveId}/cancel`
  );

  return response.data;
};