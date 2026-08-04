import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import passwordResetRoutes from "./routes/passwordResetRoutes";
import asignaturasRoutes from "./routes/asignaturasRoutes";
import tareasRoutes from "./routes/tareasRoutes";
import profesorAsignaturasRoutes from "./routes/profesorAsignaturasRoutes";
import profesorTareasRoutes from "./routes/profesorTareasRoutes";
import asistenciaRoutes from "./routes/asistenciaRoutes";
import calificacionesRoutes from "./routes/calificacionesRoutes";
import horarioRoutes from "./routes/horarioRoutes";
import profesorPerfilRoutes from "./routes/profesorPerfilRoutes";
import detalleAsignaturaRoutes from "./routes/detalleAsignaturaRoutes";
import detalleTareaRoutes from "./routes/detalleTareaRoutes";
import calificacionesAlumnoRoutes from "./routes/calificacionesAlumnoRoutes";
import horarioAlumnoRoutes from "./routes/horarioAlumnoRoutes";
import alumnoPerfilRoutes from "./routes/alumnoPerfilRoutes";
import detalleAsignaturaAlumnoRoutes from "./routes/detalleAsignaturaAlumnoRoutes";
import alumnoTareaRoutes from "./routes/alumnoTareaRoutes";
import detalleCalificacionAsignaturaRoutes from "./routes/detalleCalificacionAsignaturaRoutes";
import notificacionesRoutes from "./routes/notificacionesRoutes";
import { limiteGeneral } from "./middlewares/rateLimitMiddleware";
import adminDashboardRoutes from "./routes/adminDashboardRoutes";
import adminAlumnosRoutes from "./routes/adminAlumnosRoutes";

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
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder_policy", "unsafe-none");
  next();
});
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/auth", passwordResetRoutes);
app.use("/api/asignaturas", asignaturasRoutes);
app.use("/api/tareas", tareasRoutes);
app.use("/api/profesor/asignaturas", profesorAsignaturasRoutes);
app.use("/api/profesor/tareas", profesorTareasRoutes);
app.use("/api/profesor/asistencia", asistenciaRoutes);
app.use("/api/profesor/calificaciones", calificacionesRoutes);
app.use("/api/profesor/horario", horarioRoutes);
app.use("/api/profesor/perfil", profesorPerfilRoutes);
app.use("/api/profesor/asignatura", detalleAsignaturaRoutes);
app.use("/api/profesor/tarea", detalleTareaRoutes);
app.use("/api/calificaciones", calificacionesAlumnoRoutes);
app.use("/api/horario", horarioAlumnoRoutes);
app.use("/api/alumno/perfil", alumnoPerfilRoutes);
app.use("/api/alumno/asignatura", detalleAsignaturaAlumnoRoutes);
app.use("/api/alumno/tarea", alumnoTareaRoutes);
app.use("/api/calificaciones/asignatura", detalleCalificacionAsignaturaRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/alumnos", adminAlumnosRoutes);
app.use("/api", limiteGeneral);

export default app;
