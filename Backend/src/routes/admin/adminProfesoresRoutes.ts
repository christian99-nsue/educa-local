import express from "express";
import {
  ObtenerProfesores,
  ObtenerDetalleProfesor,
  EditarProfesor,
  EliminarProfesor,
} from "../../controllers/admin/adminProfesoresController";
import { ObtenerPerfilProfesorAdmin } from "../../controllers/admin/adminPerfilProfesorController";
import { verifyToken } from "../../middlewares/authMiddleware";
import {
  ObtenerAsignacionesProfesor,
  ObtenerOpcionesAsignacion,
  CrearAsignacion,
  EliminarAsignacion,
} from "../../controllers/admin/adminAsignacionesProfesorController";
import { RestablecerPasswordProfesor } from "../../controllers/admin/adminAccesoProfesorController";
import { EditarAsignacion } from "../../controllers/admin/adminAsignacionesProfesorController";

const router = express.Router();

router.get("/", verifyToken, ObtenerProfesores);
router.get("/:profesorId/detalle", verifyToken, ObtenerDetalleProfesor);
router.put("/:profesorId", verifyToken, EditarProfesor);
router.delete("/:profesorId", verifyToken, EliminarProfesor);
router.get("/:profesorId/perfil", verifyToken, ObtenerPerfilProfesorAdmin);
router.get(
  "/:profesorId/asignaciones",
  verifyToken,
  ObtenerAsignacionesProfesor,
);
router.get("/opciones-asignacion", verifyToken, ObtenerOpcionesAsignacion);
router.post("/:profesorId/asignaciones", verifyToken, CrearAsignacion);
router.delete("/asignaciones/:asignacionId", verifyToken, EliminarAsignacion);
router.post(
  "/:profesorId/restablecer-password",
  verifyToken,
  RestablecerPasswordProfesor,
);

router.put("/asignaciones/:asignacionId", verifyToken, EditarAsignacion);

export default router;
