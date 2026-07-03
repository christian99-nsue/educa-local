import { HashRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import SelectCenterPage from "../pages/auth/SelectCentroPage";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Register from "../pages/auth/Register";
import ResetPassword from "../pages/auth/ResetPassword";
import RegisterAdminAccount from "../pages/auth/RegisterAdminAccount";
import RegisterAcademicStructure from "../pages/auth/RegisterAcademicStructure";
import RegisterConfiguration from "../pages/auth/RegisterConfiguration";
import RegisterConfirmation from "../pages/auth/RegisterConfirmation";

export default function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/select-centro" element={<SelectCenterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/register-admin-account"
          element={<RegisterAdminAccount />}
        />
        <Route
          path="/register-academic-structure"
          element={<RegisterAcademicStructure />}
        />
        <Route
          path="/register-configuration"
          element={<RegisterConfiguration />}
        />
        <Route
          path="/register-confirmation"
          element={<RegisterConfirmation />}
        />
      </Routes>
    </HashRouter>
  );
}
