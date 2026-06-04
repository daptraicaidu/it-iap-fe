import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

/**
 * Route guard for authenticated pages.
 * Redirects to login if not authenticated.
 * Redirects to generic dashboard if authenticated but lacks required role.
 */
const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, roles } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check if user has at least one
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.some((role) => roles.includes(role));
    if (!hasRole) {
      // Redirect to correct dashboard based on actual roles
      const target = roles.includes("ADMIN") ? "/admin/dashboard" : "/dashboard";
      return <Navigate to={target} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;