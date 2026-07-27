import express from "express";
import { ObtenerDetalleCalificacionAsignatura } from "../controllers/detalleCalificacionAsignaturaController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get(
  "/:cursoAsignaturaId/detalle",
  verifyToken,
  ObtenerDetalleCalificacionAsignatura,
);

export default router;
