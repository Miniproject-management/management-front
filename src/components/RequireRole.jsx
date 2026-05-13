import { Navigate } from "react-router-dom";

import useAuthStore from "../stores/authStore";

function RequireRole({ allowed, children }) {
  const { accessToken, role } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (allowed && !allowed.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RequireRole;
