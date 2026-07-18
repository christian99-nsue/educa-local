import express from "express";
import {
  ListaCalificaciones,
  GuardarCalificaciones,
} from "../controllers/calificacionesController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/lista", verifyToken, ListaCalificaciones);
router.post("/guardar", verifyToken, GuardarCalificaciones);

export default router;
