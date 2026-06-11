import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";

/**
 * Invisible component that handles redirect after OAuth login.
 *
 * Flow:
 * 1. User clicks "Login with Google" → sessionStorage flag is set → full page redirect to backend OAuth
 * 2. Backend completes OAuth flow → redirects user back to "/" (default Spring Security behavior)
 * 3. App remounts → refreshToken() restores auth session
 * 4. This component detects the flag + authenticated state → redirects to the correct dashboard
 */
const OAuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, roles } = useAuthStore();

  useEffect(() => {
    const oauthPending = sessionStorage.getItem("oauth_pending");

    if (oauthPending && isAuthenticated) {
      sessionStorage.removeItem("oauth_pending");

      // Only redirect if user is on a public page (e.g. "/" after OAuth callback)
      const publicPaths = ["/", "/introduction", "/privacy-policy", "/terms-of-service"];
      if (publicPaths.includes(location.pathname)) {
        const target = roles.includes("ADMIN") ? "/admin/dashboard" : "/dashboard";
        navigate(target, { replace: true });
      }
    }

    // If auth failed (e.g. OAuth was denied), clean up the flag
    if (oauthPending && !isAuthenticated) {
      sessionStorage.removeItem("oauth_pending");
    }
  }, [isAuthenticated, roles, navigate, location.pathname]);

  return null;
};

export default OAuthRedirectHandler;
