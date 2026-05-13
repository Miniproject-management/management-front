import api from "./axios";

// 사원 대시보드
export const getUserDashboardApi = async (empNo) => {
  const response = await api.get("/api/dashboard/user", {
    params: { empNo },
  });

  return response.data;
};

// 팀장 대시보드
export const getLeaderDashboardApi = async (empNo) => {
  const response = await api.get("/api/dashboard/leader", {
    params: { empNo },
  });

  return response.data;
};

// 인사팀 대시보드
export const getAdminDashboardApi = async () => {
  const response = await api.get("/api/dashboard/admin");

  return response.data;
};
