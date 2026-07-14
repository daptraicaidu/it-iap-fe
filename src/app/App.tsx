import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "../routes/AppRouter";
import useAuthStore from "../store/authStore";
import "../i18n";

function App() {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [isReady, setIsReady] = useState(false);

  // On app mount, attempt to restore auth session via refresh token cookie
  useEffect(() => {
    refreshToken().finally(() => setIsReady(true));
  }, [refreshToken]);

  // Listen for session-expired events dispatched by the Axios interceptor
  // when a token refresh fails. This avoids a full page reload (window.location.href)
  // and lets React Router handle the redirect to /login gracefully.
  useEffect(() => {
    const handleSessionExpired = () => {
      // Save the current path so we can redirect back after re-login
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== "/login") {
        sessionStorage.setItem("auth:return-path", currentPath);
      }
      clearAuth();
    };
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [clearAuth]);

  // Show nothing while checking auth — prevents flash of wrong route
  if (!isReady) return null;

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
