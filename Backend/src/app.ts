import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import passwordResetRoutes from "./routes/passwordResetRoutes";
import asignaturasRoutes from "./routes/asignaturasRoutes";
import tareasRoutes from "./routes/tareasRoutes";

const app = express();
const allowedOrigins = [
  "https://educa-local.vercel.app",
  "https://christian99-nsue.github.io",
  "http://localhost:5173",
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

export default app;
