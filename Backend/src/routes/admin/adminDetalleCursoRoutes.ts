import express from "express";
import { ObtenerDetalleCurso } from "../../controllers/admin/adminDetalleCursoController";
import { verifyToken } from "../../middlewares/authMiddleware";
import {
  ObtenerProfesoresParaTutor,
  ActualizarInformacionCurso,
  ObtenerGruposCurso,
  CrearGrupo,
  EditarGrupo,
  EliminarGrupo,
  ObtenerAsignaturasCurso,
  ObtenerCatalogoAsignaturas,
  AnadirAsignaturaCurso,
  EliminarAsignaturaCurso,
  ObtenerProfesoresDelCurso,
  AsignarProfesorCurso,
  EliminarProfesorCurso,
  EditarAsignaturaCurso,
  EliminarCursoCompleto,
} from "../../controllers/admin/adminEditarCursoController";

const router = express.Router();

router.get("/:cursoId/detalle", verifyToken, ObtenerDetalleCurso);
router.get("/profesores-tutor", verifyToken, ObtenerProfesoresParaTutor);
router.put("/:cursoId/informacion", verifyToken, ActualizarInformacionCurso);
router.get("/:cursoId/grupos", verifyToken, ObtenerGruposCurso);
router.post("/:cursoId/grupos", verifyToken, CrearGrupo);
router.put("/grupos/:grupoId", verifyToken, EditarGrupo);
router.delete("/grupos/:grupoId", verifyToken, EliminarGrupo);
router.get("/:cursoId/asignaturas-curso", verifyToken, ObtenerAsignaturasCurso);
router.get("/catalogo-asignaturas", verifyToken, ObtenerCatalogoAsignaturas);
router.post("/:cursoId/asignaturas-curso", verifyToken, AnadirAsignaturaCurso);
router.delete(
  "/asignaturas-curso/:cursoAsignaturaId",
  verifyToken,
  EliminarAsignaturaCurso,
);
router.get(
  "/:cursoId/profesores-curso",
  verifyToken,
  ObtenerProfesoresDelCurso,
);
router.post("/:cursoId/profesores-curso", verifyToken, AsignarProfesorCurso);
router.delete(
  "/profesores-curso/:asignacionId",
  verifyToken,
  EliminarProfesorCurso,
);
router.put(
  "/asignaturas-curso/:cursoAsignaturaId",
  verifyToken,
  EditarAsignaturaCurso,
);
router.delete("/:cursoId", verifyToken, EliminarCursoCompleto);

export default router;
