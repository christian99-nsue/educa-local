import express from "express";
import { Tareas } from "../controllers/tareasController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/mis-tareas", verifyToken, Tareas);

export default router;
