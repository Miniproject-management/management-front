import { create } from "zustand";

const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem("accessToken") || null,
  empNo: localStorage.getItem("empNo") || null,
  empName: localStorage.getItem("empName") || null,
  role: localStorage.getItem("role") || null,

  login: (data) => {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("empNo", data.empNo);
    localStorage.setItem("empName", data.empName);
    localStorage.setItem("role", data.role);

    set({
      accessToken: data.accessToken,
      empNo: data.empNo,
      empName: data.empName,
      role: data.role,
    });
  },

  logout: () => {
    localStorage.clear();

    set({
      accessToken: null,
      empNo: null,
      empName: null,
      role: null,
    });
  },
}));

export default useAuthStore;