import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import DashboardPage from "../pages/admin/DashboardPage/DashboardPage";
import UsersPage from "../pages/admin/UsersPage/UsersPage";
import QuestionsPage from "../pages/admin/QuestionsPage/QuestionsPage";
import PromptsPage from "../pages/admin/PromptsPage/PromptsPage";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="prompts" element={<PromptsPage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;