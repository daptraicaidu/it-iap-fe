import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "../routes/AppRouter";
import useAuthStore from "../store/authStore";
import "../i18n";

function App() {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const [isReady, setIsReady] = useState(false);

  // On app mount, attempt to restore auth session via refresh token cookie
  useEffect(() => {
    refreshToken().finally(() => setIsReady(true));
  }, [refreshToken]);

  // Show nothing while checking auth — prevents flash of wrong route
  if (!isReady) return null;

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
