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
import LayoutAlumno from "../layouts/LayoutAlumno";
import Inicio from "../pages/alumno/Inicio";
import Asignaturas from "../pages/alumno/Asignaturas";
import Tareas from "../pages/alumno/Tareas";
import LayoutProfesor from "../layouts/LayoutProfesor";
import InicioProfesor from "../pages/profesor/InicioProfesor";
import ProtectedRoute from "./ProtectedRoutes";
import AsignaturasProfesor from "../pages/profesor/AsignaturasProfesor";
import TareasProfesor from "../pages/profesor/TareasProfesor";
import AsistenciaProfesor from "../pages/profesor/AsistenciaProfesor";
import CalificacionesProfesor from "../pages/profesor/CalificacionesProfesor";
import HorarioProfesor from "../pages/profesor/HorarioProfesor";
import PerfilProfesor from "../pages/profesor/perfilProfesor";
import DetalleAsignaturaProfesor from "../pages/profesor/DetalleAsignaturaProfesor";
import DetalleTareaProfesor from "../pages/profesor/DetalleTareaProfesor";
import Calificaciones from "../pages/alumno/Calificaciones";
import HorarioAlumno from "../pages/alumno/HorarioAlumno";
import PerfilAlumno from "../pages/alumno/PerfilAlumno";
import DetalleAsignaturaAlumno from "../pages/alumno/DetalleAsignaturaAlumno";
import DetalleTareaAlumno from "../pages/alumno/DetalleTareaAlumno";
import DetalleCalificacionAsignatura from "../pages/alumno/DetalleCalificacionAsignatura";
import LayoutAdmin from "../layouts/LayoutAdmin";
import InicioAdmin from "../pages/admin/InicioAdmin";
import AlumnosAdmin from "../pages/admin/AlumnosAdmin";
import DetalleAlumnoAdmin from "../pages/admin/DetalleAlumnoAdmin";
import ProfesoresAdmin from "../pages/admin/ProfesoresAdmin";
import CursosAdmin from "../pages/admin/CursosAdmin";
import HorarioAdmin from "../pages/admin/HorarioAdmin";
import AjustesAdmin from "../pages/admin/AjustesAdmin";

export default function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        {/*-------- Rutas publicas  (sin proteger) -----------*/}
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

        {/* --------- Zona ALUMNO: solo rol "alumno" ---------*/}
        <Route element={<ProtectedRoute allowedRoles={["alumno"]} />}>
          <Route path="/alumno" element={<LayoutAlumno />}>
            <Route index element={<Inicio />} />
            <Route path="asignaturas" element={<Asignaturas />} />
            <Route
              path="asignaturas/:cursoAsignaturaId"
              element={<DetalleAsignaturaAlumno />}
            />
            <Route path="tareas" element={<Tareas />} />
            <Route path="tareas/:tareaId" element={<DetalleTareaAlumno />} />
            <Route path="calificaciones" element={<Calificaciones />} />
            <Route
              path="calificaciones/:cursoAsignaturaId"
              element={<DetalleCalificacionAsignatura />}
            />
            <Route path="horario" element={<HorarioAlumno />} />
            <Route path="perfil" element={<PerfilAlumno />} />
          </Route>
        </Route>

        {/*--------- Zona PROFESOR: solo rol "profesor" -----*/}
        <Route element={<ProtectedRoute allowedRoles={["profesor"]} />}>
          <Route path="/profesor" element={<LayoutProfesor />}>
            <Route index element={<InicioProfesor />} />
            <Route path="asignaturas" element={<AsignaturasProfesor />} />
            <Route
              path="asignaturas/:cursoAsignaturaId"
              element={<DetalleAsignaturaProfesor />}
            />
            <Route path="tareas" element={<TareasProfesor />} />
            <Route path="tareas/:tareaId" element={<DetalleTareaProfesor />} />
            <Route path="asistencia" element={<AsistenciaProfesor />} />
            <Route path="calificaciones" element={<CalificacionesProfesor />} />
            <Route path="horario" element={<HorarioProfesor />} />
            <Route path="perfil" element={<PerfilProfesor />} />
          </Route>
        </Route>

        {/*--------- Zona ADMIN: solo rol "admin" -----*/}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<LayoutAdmin />}>
            <Route index element={<InicioAdmin />} />
            <Route path="alumnos" element={<AlumnosAdmin />} />
            <Route path="alumnos/:alumnoId" element={<DetalleAlumnoAdmin />} />
            <Route path="profesores" element={<ProfesoresAdmin />} />
            <Route path="cursos" element={<CursosAdmin />} />
            <Route path="horario" element={<HorarioAdmin />} />
            <Route path="ajustes" element={<AjustesAdmin />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
}
