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
} from "../../controllers/admin/adminEditarCursoController";

const router = express.Router();

router.get("/:cursoId/detalle", verifyToken, ObtenerDetalleCurso);
router.get("/profesores-tutor", verifyToken, ObtenerProfesoresParaTutor);
router.put("/:cursoId/informacion", verifyToken, ActualizarInformacionCurso);

router.get("/:cursoId/grupos", verifyToken, ObtenerGruposCurso);
router.post("/:cursoId/grupos", verifyToken, CrearGrupo);
router.put("/grupos/:grupoId", verifyToken, EditarGrupo);
router.delete("/grupos/:grupoId", verifyToken, EliminarGrupo);

export default router;
