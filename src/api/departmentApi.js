import api from "./axios";

// 부서 트리 조회 (deptNo, deptName, deptDesc, employeeCount)
export const getDepartmentTreeApi = async () => {
  const response = await api.get("/api/hr/departments/tree");

  return response.data;
};
