import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/user/HomePage/HomePage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
};

export default AppRouter;
