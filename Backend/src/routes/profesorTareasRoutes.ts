import express from "express";
import { TareasProfesor } from "../controllers/profesorTareasController";
import { verifyToken } from "../middlewares/authMiddleware";
import { uploadTarea } from "../middlewares/uploadMiddleware";
import { CrearTarea } from "../controllers/crearTareasController";

const router = express.Router();

router.get("/mis-tareas", verifyToken, TareasProfesor);
router.post("/crear", verifyToken, uploadTarea.single("archivo"), CrearTarea);

export default router;
