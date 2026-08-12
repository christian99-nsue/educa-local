import express from "express";
import {
  ObtenerProfesores,
  ObtenerDetalleProfesor,
  EditarProfesor,
  EliminarProfesor,
} from "../controllers/adminProfesoresController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", verifyToken, ObtenerProfesores);
router.get("/:profesorId/detalle", verifyToken, ObtenerDetalleProfesor);
router.put("/:profesorId", verifyToken, EditarProfesor);
router.delete("/:profesorId", verifyToken, EliminarProfesor);

export default router;
