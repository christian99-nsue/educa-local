import express from "express";
import {
  ActualizarPerfilAlumno,
  ObtenerPerfilAlumno,
} from "../controllers/alumnoPerfilController";
import { verifyToken } from "../middlewares/authMiddleware";
import { uploadTarea } from "../middlewares/uploadMiddleware";
import { limiteSubidaArchivos } from "../middlewares/rateLimitMiddleware";

const router = express.Router();

router.get("/", verifyToken, ObtenerPerfilAlumno);
router.put(
  "/",
  verifyToken,
  limiteSubidaArchivos,
  uploadTarea.single("foto"),
  ActualizarPerfilAlumno,
);

export default router;
