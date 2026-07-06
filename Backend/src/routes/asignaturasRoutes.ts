import express from "express";
import { Asignaturas } from "../controllers/asignaturasController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/mis-asignaturas", verifyToken, Asignaturas);

export default router;
