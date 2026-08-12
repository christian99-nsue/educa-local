import express from "express";
import {
  ObtenerCursosParaHorario,
  ObtenerHorarioCurso,
} from "../controllers/adminHorarioController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/cursos", verifyToken, ObtenerCursosParaHorario);
router.get("/curso/:cursoId", verifyToken, ObtenerHorarioCurso);

export default router;
