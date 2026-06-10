import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/user/HomePage/HomePage";
import LoginPage from "../pages/user/LoginPage/LoginPage";
import RegisterPage from "../pages/user/RegisterPage/RegisterPage";
import VerifyEmailPage from "../pages/user/VerifyEmailPage/VerifyEmailPage";
import DashboardPage from "../pages/user/DashboardPage/DashboardPage";
import ProfileInfoPage from "../pages/user/ProfileInfoPage/ProfileInfoPage";
import ProfileManagePage from "../pages/user/ProfileManagePage/ProfileManagePage";
import ChangePasswordPage from "../pages/user/ChangePasswordPage/ChangePasswordPage";
import GuestRoute from "../components/GuestRoute";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoutes from "./adminRoutes";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Guest-only routes: redirect to dashboard if already authenticated */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>


      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin/dashboard/*" element={<AdminRoutes />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/info" element={<ProfileInfoPage />} />
        <Route path="/info/changepassword" element={<ChangePasswordPage />} />
        <Route path="/profile" element={<ProfileManagePage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
