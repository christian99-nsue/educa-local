import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../utils/auth";

export interface StoredUser {
  id: number;
  email: string;
  code?: string;
  rol_en_centro: string;
  centro?: {
    nombre?: string;
  };
}

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode;
}

function fallbackPathForRole(rol: string) {
  if (rol === "admin") return "/admin";
  if (rol === "profesor") return "/profesor";
  return "/alumno";
}

export default function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const user = getUser() as StoredUser | null;

  //1. No hay sesion => login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  //2. Hay sesion pero el rol no coincide => su propia zona
  if (allowedRoles && !allowedRoles.includes(user.rol_en_centro)) {
    return <Navigate to={fallbackPathForRole(user.rol_en_centro)} replace />;
  }

  return <>{children ?? <Outlet />}</>;
}
