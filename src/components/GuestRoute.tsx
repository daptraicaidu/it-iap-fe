import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

/**
 * Route guard for guest-only pages (login, register).
 * Redirects authenticated users to /dashboard or /admin/dashboard based on role.
 */
const GuestRoute = () => {
  const { isAuthenticated, roles } = useAuthStore();

  if (isAuthenticated) {
    const target = roles.includes("ADMIN") ? "/admin/dashboard" : "/dashboard";
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
