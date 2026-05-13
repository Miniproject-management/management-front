import api from "./axios";

export const getEmployeesApi = async () => {
  const response = await api.get("/api/hr/employees");
  return response.data;
};
