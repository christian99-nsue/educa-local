import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth/authRoutes";
import passwordResetRoutes from "./routes/auth/passwordResetRoutes";
import asignaturasRoutes from "./routes/alumno/asignaturasRoutes";
import tareasRoutes from "./routes/alumno/tareasRoutes";
import profesorAsignaturasRoutes from "./routes/profesor/profesorAsignaturasRoutes";
import profesorTareasRoutes from "./routes/profesor/profesorTareasRoutes";
import asistenciaRoutes from "./routes/profesor/asistenciaRoutes";
import calificacionesRoutes from "./routes/profesor/calificacionesRoutes";
import horarioRoutes from "./routes/profesor/horarioRoutes";
import profesorPerfilRoutes from "./routes/profesor/profesorPerfilRoutes";
import detalleAsignaturaRoutes from "./routes/profesor/detalleAsignaturaRoutes";
import detalleTareaRoutes from "./routes/profesor/detalleTareaRoutes";
import calificacionesAlumnoRoutes from "./routes/alumno/calificacionesAlumnoRoutes";
import horarioAlumnoRoutes from "./routes/alumno/horarioAlumnoRoutes";
import alumnoPerfilRoutes from "./routes/alumno/alumnoPerfilRoutes";
import detalleAsignaturaAlumnoRoutes from "./routes/alumno/detalleAsignaturaAlumnoRoutes";
import alumnoTareaRoutes from "./routes/alumno/alumnoTareaRoutes";
import detalleCalificacionAsignaturaRoutes from "./routes/alumno/detalleCalificacionAsignaturaRoutes";
import notificacionesRoutes from "./routes/auth/notificacionesRoutes";
import { limiteGeneral } from "./middlewares/rateLimitMiddleware";
import adminDashboardRoutes from "./routes/admin/adminDashboardRoutes";
import adminAlumnosRoutes from "./routes/admin/adminAlumnosRoutes";
import adminProfesoresRoutes from "./routes/admin/adminProfesoresRoutes";
import adminCursosRoutes from "./routes/admin/adminCursosRoutes";
import adminHorarioRoutes from "./routes/admin/adminHorarioRoutes";
import passwordRoutes from "./routes/auth/passwordRoutes";
import adminAjustesRoutes from "./routes/admin/adminAjustesRoutes";
import adminAnadirAlumnoRoutes from "./routes/admin/adminAnadirAlumnoRoutes";
import adminAnadirProfesorRoutes from "./routes/admin/adminAnadirProfesorRoutes";
import adminCrearCursoRoutes from "./routes/admin/adminCrearCursoRoutes";
import adminHorariosBuilderRoutes from "./routes/admin/adminHorariosBuilderRoutes";
import adminDetalleCursoRoutes from "./routes/admin/adminDetalleCursoRoutes";
import adminActividadRoutes from "./routes/admin/adminActividadRoutes";

const app = express();
app.set("trust proxy", 1);
const allowedOrigins = [
  "https://educa-local.vercel.app",
  "https://christian99-nsue.github.io",
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
  }),
);

app.use((req, res, next) => {
  // Headers CORS más seguros por defecto
  // Si necesitas compartir recursos entre orígenes específicos, usa valores restrictivos
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.use(express.json());
app.use("/api", limiteGeneral);

app.use("/api/auth", authRoutes);
app.use("/api/auth", passwordResetRoutes);
app.use("/api/alumno/asignaturas", asignaturasRoutes);
app.use("/api/alumno/tareas", tareasRoutes);
app.use("/api/profesor/asignaturas", profesorAsignaturasRoutes);
app.use("/api/profesor/tareas", profesorTareasRoutes);
app.use("/api/profesor/asistencia", asistenciaRoutes);
app.use("/api/profesor/calificaciones", calificacionesRoutes);
app.use("/api/profesor/horario", horarioRoutes);
app.use("/api/profesor/perfil", profesorPerfilRoutes);
app.use("/api/profesor/asignatura", detalleAsignaturaRoutes);
app.use("/api/profesor/tarea", detalleTareaRoutes);
app.use("/api/alumno/calificaciones", calificacionesAlumnoRoutes);
app.use("/api/alumno/horario", horarioAlumnoRoutes);
app.use("/api/alumno/perfil", alumnoPerfilRoutes);
app.use("/api/alumno/asignatura", detalleAsignaturaAlumnoRoutes);
app.use("/api/alumno/tarea", alumnoTareaRoutes);
app.use(
  "/api/alumno/calificaciones/asignatura",
  detalleCalificacionAsignaturaRoutes,
);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/alumnos", adminAlumnosRoutes);
app.use("/api/admin/profesores", adminProfesoresRoutes);
app.use("/api/admin/cursos", adminCursosRoutes);
app.use("/api/admin/horario", adminHorarioRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/admin/ajustes", adminAjustesRoutes);
app.use("/api/admin/alumnos/anadir", adminAnadirAlumnoRoutes);
app.use("/api/admin/profesores/anadir", adminAnadirProfesorRoutes);
app.use("/api/admin/cursos/crear", adminCrearCursoRoutes);
app.use("/api/admin/horarios", adminHorariosBuilderRoutes);
app.use("/api/admin/cursos", adminDetalleCursoRoutes);
app.use("/api/admin/actividad", adminActividadRoutes);

export default app;
