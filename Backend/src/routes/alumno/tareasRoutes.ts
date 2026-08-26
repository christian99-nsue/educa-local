import express from "express";
import { Tareas } from "../../controllers/alumno/tareasController";
import { verifyToken } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/mis-tareas", verifyToken, Tareas);

export default router;
