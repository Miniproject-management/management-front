import useAuthStore from "../../stores/authStore";

import AdminDashboard from "./AdminDashboard";
import ManagerDashboard from "./ManagerDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

function DashboardPage() {
  const { role } = useAuthStore();

  if (role === "ROLE_ADMIN") return <AdminDashboard />;
  if (role === "ROLE_MANAGER") return <ManagerDashboard />;
  return <EmployeeDashboard />;
}

export default DashboardPage;
