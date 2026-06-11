import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/user/HomePage/HomePage";
import IntroductionPage from "../pages/user/IntroductionPage/IntroductionPage";
import PrivacyPolicyPage from "../pages/user/PrivacyPolicyPage/PrivacyPolicyPage";
import TermsOfServicePage from "../pages/user/TermsOfServicePage/TermsOfServicePage";
import LoginPage from "../pages/user/LoginPage/LoginPage";
import RegisterPage from "../pages/user/RegisterPage/RegisterPage";
import VerifyEmailPage from "../pages/user/VerifyEmailPage/VerifyEmailPage";
import DashboardPage from "../pages/user/DashboardPage/DashboardPage";
import UserInfoPage from "../pages/user/UserInfoPage/UserInfoPage";
import ProfilesPage from "../pages/user/ProfilesPage/ProfilesPage";
import PasswordAndSecurityPage from "../pages/user/PasswordAndSecurityPage/PasswordAndSecurityPage";
import ActivitiesPage from "../pages/user/ActivitiesPage/ActivitiesPage";
import GeneralSettingsPage from "../pages/user/GeneralSettingsPage/GeneralSettingsPage";
import UserLayout from "../layouts/user/UserLayout";
import SettingsLayout from "../layouts/user/SettingsLayout";
import GuestRoute from "./guards/GuestRoute";
import ProtectedRoute from "./guards/ProtectedRoute";
import AdminRoutes from "./AdminRoutes";
import ScrollToTop from "../components/ScrollToTop";

const AppRouter = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/introduction" element={<IntroductionPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/dashboard/*" element={<AdminRoutes />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* These routes are placeholders until they are implemented */}
            <Route path="/interview" element={<div className="p-8">Bắt đầu phỏng vấn</div>} />
            <Route path="/interview/review_result" element={<div className="p-8">Kết quả phỏng vấn</div>} />
            <Route path="/chatbot" element={<div className="p-8">Chatbot</div>} />
            <Route path="/notifications" element={<div className="p-8">Thông báo</div>} />
            
            <Route element={<SettingsLayout />}>
              <Route path="/userinfo" element={<UserInfoPage />} />
              <Route path="/profiles" element={<ProfilesPage />} />
              <Route path="/settings" element={<GeneralSettingsPage />} />
              <Route path="/password_and_security" element={<PasswordAndSecurityPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default AppRouter;
