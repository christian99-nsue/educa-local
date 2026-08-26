import express from "express";
import { CalificacionesAlumno } from "../../controllers/alumno/calificacionesAlumnoController";
import { verifyToken } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/mis-calificaciones", verifyToken, CalificacionesAlumno);

export default router;
