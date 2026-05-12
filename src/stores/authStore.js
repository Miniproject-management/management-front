import { create } from "zustand";

const useAuthStore = create((set) => ({

  accessToken:
    localStorage.getItem("accessToken") || null,
  empNo:
    localStorage.getItem("empNo") || null,
  empName:
    localStorage.getItem("empName") || null,
  deptName:
    localStorage.getItem("deptName") || null,
  role:
    localStorage.getItem("role") || null,

  login: (data) => {

    localStorage.setItem(
      "accessToken",
      data.accessToken
    );

    localStorage.setItem(
      "empNo",
      data.empNo
    );

    localStorage.setItem(
      "empName",
      data.empName
    );

    localStorage.setItem(
      "deptName",
      data.deptName
    );

    localStorage.setItem(
      "role",
      data.role
    );

    set({
      accessToken: data.accessToken,
      empNo: data.empNo,
      empName: data.empName,
      deptName: data.deptName,
      role: data.role,
    });
  },

  logout: () => {

    localStorage.clear();

    set({
      accessToken: null,
      empNo: null,
      empName: null,
      deptName: null,
      role: null,
    });
  },

}));

export default useAuthStore;