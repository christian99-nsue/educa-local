import express from "express";
import {
  ObtenerDetalleAsignaturaAlumno,
  ObtenerTareasPendientesAsignatura,
  ObtenerMaterialesAlumno,
} from "../controllers/detalleAsignaturaAlumnoController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get(
  "/:cursoAsignaturaId/detalle",
  verifyToken,
  ObtenerDetalleAsignaturaAlumno,
);
router.get(
  "/:cursoAsignaturaId/tareas-pendientes",
  verifyToken,
  ObtenerTareasPendientesAsignatura,
);
router.get(
  "/:cursoAsignaturaId/materiales",
  verifyToken,
  ObtenerMaterialesAlumno,
);

export default router;
