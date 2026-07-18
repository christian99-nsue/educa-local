import express from "express";
import {
  AlumnosAsistencia,
  GuardarAsistencia,
} from "../controllers/asistenciaController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/alumnos", verifyToken, AlumnosAsistencia);
router.post("/guardar", verifyToken, GuardarAsistencia);

export default router;
