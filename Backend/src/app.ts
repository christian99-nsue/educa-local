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

const app = express();
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

export default app;
