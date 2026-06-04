import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

/**
 * Route guard for authenticated pages.
 * Redirects to login if not authenticated.
 * Redirects to the appropriate dashboard if authenticated but lacks required role.
 */
const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, roles } = useAuthStore();

  // Chưa đăng nhập -> về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu route yêu cầu role cụ thể
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.some((role) => roles.includes(role));

    if (!hasRole) {
      // Điều hướng theo role thực tế của user
      const target = roles.includes("ADMIN")
        ? "/admin/dashboard"
        : "/dashboard";

      return <Navigate to={target} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;