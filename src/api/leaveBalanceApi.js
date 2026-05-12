import api from "./axios";

// 연차 생성/수정
export const createLeaveBalanceApi = async (data) => {
  const response = await api.post("/api/leave-balances", data);
  return response.data;
};

// 연차 조회
export const getLeaveBalanceApi = async (empNo, year) => {
  const response = await api.get("/api/leave-balances", {
    params: {
      empNo,
      year,
    },
  });

  return response.data;
};