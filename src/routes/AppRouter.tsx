import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/user/HomePage/HomePage";
import IntroductionPage from "../pages/user/IntroductionPage/IntroductionPage";
import PricingPage from "../pages/user/PricingPage/PricingPage";
import PrivacyPolicyPage from "../pages/user/PrivacyPolicyPage/PrivacyPolicyPage";
import TermsOfServicePage from "../pages/user/TermsOfServicePage/TermsOfServicePage";
import LoginPage from "../pages/user/LoginPage/LoginPage";
import RegisterPage from "../pages/user/RegisterPage/RegisterPage";
import VerifyEmailPage from "../pages/user/VerifyEmailPage/VerifyEmailPage";
import ForgotPasswordPage from "../pages/user/ForgotPasswordPage/ForgotPasswordPage";
import DashboardPage from "../pages/user/DashboardPage/DashboardPage";
import UserInfoPage from "../pages/user/UserInfoPage/UserInfoPage";
import ProfilesPage from "../pages/user/ProfilesPage/ProfilesPage";
import PasswordAndSecurityPage from "../pages/user/PasswordAndSecurityPage/PasswordAndSecurityPage";
import ActivitiesPage from "../pages/user/ActivitiesPage/ActivitiesPage";
import ActiveSessionsPage from "../pages/user/ActiveSessionsPage/ActiveSessionsPage";
import GeneralSettingsPage from "../pages/user/GeneralSettingsPage/GeneralSettingsPage";
import InterviewsPage from "../pages/user/InterviewsPage/InterviewsPage";
import InterviewPrepPage from "../pages/user/InterviewPrepPage/InterviewPrepPage";
import InterviewSessionPage from "../pages/user/InterviewSessionPage/InterviewSessionPage";
import ChatBotPage from "../pages/user/ChatBotPage/ChatBotPage";
import InterviewResultPage from "../pages/user/InterviewResultPage/InterviewResultPage";
import InterviewHistoryPage from "../pages/user/InterviewHistoryPage/InterviewHistoryPage";
import UserReportsPage from "../pages/user/UserReportsPage/UserReportsPage";
import NotificationPage from "../pages/user/NotificationPage/NotificationPage";
import ForumPage from "../pages/user/ForumPage/ForumPage";
import OrdersPage from "../pages/user/OrdersPage/OrdersPage";
import CheckoutPage from "../pages/user/CheckoutPage/CheckoutPage";
import UserLayout from "../layouts/user/UserLayout";
import SettingsLayout from "../layouts/user/SettingsLayout";
import Reset2faPage from "../pages/user/Reset2faPage/Reset2faPage";
import GuestRoute from "./guards/GuestRoute";
import ProtectedRoute from "./guards/ProtectedRoute";
import AdminRoutes from "./AdminRoutes";
import ScrollToTop from "../components/ScrollToTop";
import OAuthRedirectHandler from "./guards/OAuthRedirectHandler";

const AppRouter = () => {
  return (
    <>
      <ScrollToTop />
      <OAuthRedirectHandler />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/introduction" element={<IntroductionPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/reset-2fa/cancel" element={<Reset2faPage />} />
        <Route path="/reset-2fa/confirm" element={<Reset2faPage />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          {/* Interview Session — full-screen, no UserLayout */}
          <Route path="/interviews/:interviewId/session" element={<InterviewSessionPage />} />

          <Route element={<UserLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/interviews" element={<InterviewsPage />} />
            <Route path="/interviews/:interviewId" element={<InterviewPrepPage />} />
            <Route path="/history/:interviewId/result" element={<InterviewResultPage />} />
            <Route path="/history" element={<InterviewHistoryPage />} />
            <Route path="/reports_and_feedbacks" element={<UserReportsPage />} />
            <Route path="/reports" element={<Navigate to="/reports_and_feedbacks" replace />} />
            <Route path="/chatbot" element={<ChatBotPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            
            <Route element={<SettingsLayout />}>
              <Route path="/userinfo" element={<UserInfoPage />} />
              <Route path="/profiles" element={<ProfilesPage />} />
              <Route path="/settings" element={<GeneralSettingsPage />} />
              <Route path="/password_and_security" element={<PasswordAndSecurityPage />} />
              <Route path="/active_sessions" element={<ActiveSessionsPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default AppRouter;
