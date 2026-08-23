import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";

/**
 * Invisible component that handles redirect after OAuth login.
 *
 * Flow:
 * 1. User clicks "Login with Google" → sessionStorage flag is set → full page redirect to backend OAuth
 * 2. Backend completes OAuth flow → redirects user back to "/" (default Spring Security behavior)
 * 3. OAuthRedirectHandler consumes flag and calls refreshToken() exactly ONCE to restore auth session
 * 4. Redirects user to the correct dashboard based on role
 */
const OAuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHandlingRef = useRef(false);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  useEffect(() => {
    const oauthPending = sessionStorage.getItem("oauth_pending");
    if (!oauthPending || isHandlingRef.current) return;

    // Immediately remove flag to prevent multiple triggers in React Strict Mode
    sessionStorage.removeItem("oauth_pending");
    isHandlingRef.current = true;

    refreshToken()
      .then(() => {
        const state = useAuthStore.getState();
        const roles = state.roles;
        const publicPaths = [
          "/",
          "/introduction",
          "/privacy-policy",
          "/terms-of-service",
          "/login",
          "/register",
        ];
        if (publicPaths.includes(location.pathname)) {
          const target = roles.includes("ADMIN") ? "/admin/dashboard" : "/dashboard";
          navigate(target, { replace: true });
        }
      })
      .catch((err) => {
        console.error("Failed to restore OAuth session:", err);
      });
  }, [navigate, location.pathname, refreshToken]);

  return null;
};

export default OAuthRedirectHandler;
