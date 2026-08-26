import express from "express";
import { HorarioProfesor } from "../../controllers/profesor/horarioController";
import { verifyToken } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/mi-horario", verifyToken, HorarioProfesor);

export default router;
