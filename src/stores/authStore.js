import { create } from "zustand";

const normalizeRole = (role, deptName) => {
  if (deptName === "인사팀") {
    return "ROLE_ADMIN";
  }

  return role;
};

const initialDeptName = localStorage.getItem("deptName") || null;

const useAuthStore = create((set) => ({

  accessToken:
    localStorage.getItem("accessToken") || null,
  empNo:
    localStorage.getItem("empNo") || null,
  empName:
    localStorage.getItem("empName") || null,
  deptName: initialDeptName,
  role: normalizeRole(localStorage.getItem("role") || null, initialDeptName),

  login: (data) => {
    const role = normalizeRole(data.role, data.deptName);

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
      role
    );

    set({
      accessToken: data.accessToken,
      empNo: data.empNo,
      empName: data.empName,
      deptName: data.deptName,
      role,
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
