import express from "express";
import {
  ObtenerRamas,
  CrearCurso,
} from "../controllers/adminCrearCursoController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/ramas", verifyToken, ObtenerRamas);
router.post("/", verifyToken, CrearCurso);

export default router;
