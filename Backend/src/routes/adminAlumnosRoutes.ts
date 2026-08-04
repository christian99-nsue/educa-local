import express from "express";
import {
  ObtenerAlumnos,
  ObtenerDetalleAlumno,
  EditarAlumno,
  EliminarAlumno,
} from "../controllers/adminAlumnosController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", verifyToken, ObtenerAlumnos);
router.get("/:alumnoId/detalle", verifyToken, ObtenerDetalleAlumno);
router.put("/:alumnoId", verifyToken, EditarAlumno);
router.delete("/:alumnoId", verifyToken, EliminarAlumno);

export default router;
