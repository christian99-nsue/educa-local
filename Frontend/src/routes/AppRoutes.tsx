import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/student/Dashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
