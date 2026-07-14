import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/authStore";

/**
 * Route guard for guest-only pages (login, register).
 * Redirects authenticated users to /dashboard or /admin/dashboard based on role.
 * If the user was redirected here due to session expiry, returns them to their
 * original page (stored in sessionStorage as "auth:return-path").
 */
const GuestRoute = () => {
  const { isAuthenticated, roles } = useAuthStore();

  if (isAuthenticated) {
    // Check if we need to return the user to a specific page after re-login
    const returnPath = sessionStorage.getItem("auth:return-path");
    if (returnPath) {
      sessionStorage.removeItem("auth:return-path");
      return <Navigate to={returnPath} replace />;
    }
    const target = roles.includes("ADMIN") ? "/admin/dashboard" : "/dashboard";
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
