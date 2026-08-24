import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "../routes/AppRouter";
import useAuthStore from "../store/authStore";
import "../i18n";

function App() {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // Listen for session-expired events dispatched by the Axios interceptor
  // when a token refresh fails (401 error). This avoids a full page reload
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

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
