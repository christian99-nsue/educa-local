import express from "express";
import {
  BuscarUsuarioPorEmail,
  CrearAlumnoNuevo,
  AnadirAlumnoExistente,
  ObtenerCursosParaFormulario,
} from "../../controllers/admin/adminAnadirAlumnoController";
import { verifyToken } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/buscar", verifyToken, BuscarUsuarioPorEmail);
router.get("/cursos", verifyToken, ObtenerCursosParaFormulario);
router.post("/nuevo", verifyToken, CrearAlumnoNuevo);
router.post("/existente", verifyToken, AnadirAlumnoExistente);

export default router;
