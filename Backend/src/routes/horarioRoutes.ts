import express from "express";
import { HorarioProfesor } from "../controllers/horarioController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/mi-horario", verifyToken, HorarioProfesor);

export default router;
