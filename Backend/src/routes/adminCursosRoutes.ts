import express from "express";
import {
  ObtenerCursos,
  EliminarCurso,
} from "../controllers/adminCursosController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", verifyToken, ObtenerCursos);
router.delete("/:cursoId", verifyToken, EliminarCurso);

export default router;
