import express from "express";
import { HorarioAlumno } from "../controllers/horarioAlumnoController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/mi-horario", verifyToken, HorarioAlumno);

export default router;
