import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import passwordResetRoutes from "./routes/passwordResetRoutes";
import asignaturasRoutes from "./routes/asignaturasRoutes";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
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

export default app;
