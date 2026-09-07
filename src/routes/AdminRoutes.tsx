import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import DashboardPage from "../pages/admin/DashboardPage/DashboardPage";
import UsersPage from "../pages/admin/UsersPage/UsersPage";
import QuestionsPage from "../pages/admin/QuestionsPage/QuestionsPage";
import PromptsPage from "../pages/admin/PromptsPage/PromptsPage";
import ReportsPage from "../pages/admin/ReportsPage/ReportsPage";
import FeedbacksPage from "../pages/admin/FeedbacksPage/FeedbacksPage";
import AdminNotificationsPage from "../pages/admin/AdminNotificationsPage/AdminNotificationsPage";
import BannersPage from "../pages/admin/BannersPage/BannersPage";
import PromotionsPage from "../pages/admin/PromotionsPage/PromotionsPage";
import SettingsLayout from "../layouts/user/SettingsLayout";
import GeneralSettingsPage from "../pages/user/GeneralSettingsPage/GeneralSettingsPage";
import UserInfoPage from "../pages/user/UserInfoPage/UserInfoPage";
import ProfilesPage from "../pages/user/ProfilesPage/ProfilesPage";
import PasswordAndSecurityPage from "../pages/user/PasswordAndSecurityPage/PasswordAndSecurityPage";
import ActiveSessionsPage from "../pages/user/ActiveSessionsPage/ActiveSessionsPage";
import ActivitiesPage from "../pages/user/ActivitiesPage/ActivitiesPage";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="prompts" element={<PromptsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="feedbacks" element={<FeedbacksPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        
        <Route path="settings" element={<SettingsLayout />}>
          <Route index element={<GeneralSettingsPage />} />
          <Route path="userinfo" element={<UserInfoPage />} />
          <Route path="profiles" element={<ProfilesPage />} />
          <Route path="password_and_security" element={<PasswordAndSecurityPage />} />
          <Route path="active_sessions" element={<ActiveSessionsPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;