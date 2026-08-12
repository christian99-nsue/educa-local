import express from "express";
import {
  BuscarUsuarioPorEmailProfesor,
  ObtenerAsignaturasParaFormulario,
  CrearProfesorNuevo,
  AnadirProfesorExistente,
} from "../controllers/adminAnadirProfesorController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/buscar", verifyToken, BuscarUsuarioPorEmailProfesor);
router.get("/asignaturas", verifyToken, ObtenerAsignaturasParaFormulario);
router.post("/nuevo", verifyToken, CrearProfesorNuevo);
router.post("/existente", verifyToken, AnadirProfesorExistente);

export default router;
