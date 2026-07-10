import express from "express";
import { AsignaturasProfesor } from "../controllers/profesorAsignaturasController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/mis-asignaturas", verifyToken, AsignaturasProfesor);

export default router;
