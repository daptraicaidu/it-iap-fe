import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import DashboardPage from "../pages/admin/DashboardPage/DashboardPage";
import UsersPage from "../pages/admin/UsersPage/UsersPage";
import QuestionsPage from "../pages/admin/QuestionsPage/QuestionsPage";
import PromptsPage from "../pages/admin/PromptsPage/PromptsPage";
import ReportsPage from "../pages/admin/ReportsPage/ReportsPage";
import FeedbacksPage from "../pages/admin/FeedbacksPage/FeedbacksPage";
import AdminNotificationsPage from "../pages/admin/AdminNotificationsPage/AdminNotificationsPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage/AdminSettingsPage";
import BannersPage from "../pages/admin/BannersPage/BannersPage";
import PromotionsPage from "../pages/admin/PromotionsPage/PromotionsPage";

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
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;