import express from "express";
import {
  ObtenerListaHorarios,
  ObtenerOpcionesContexto,
  ObtenerHorarioContexto,
  CrearClase,
  EditarClase,
  EliminarClase,
  EliminarHorarioCompleto,
} from "../../controllers/admin/adminHorariosBuilderController";
import { verifyToken } from "../../middlewares/authMiddleware";
import {
  ObtenerDescansos,
  CrearDescanso,
  EliminarDescanso,
} from "../../controllers/admin/adminHorariosBuilderController";

const router = express.Router();

router.get("/lista", verifyToken, ObtenerListaHorarios);
router.get("/opciones-contexto", verifyToken, ObtenerOpcionesContexto);
router.get("/contexto/:centroCursoId", verifyToken, ObtenerHorarioContexto);
router.post("/clase", verifyToken, CrearClase);
router.put("/clase/:claseId", verifyToken, EditarClase);
router.delete("/clase/:claseId", verifyToken, EliminarClase);
router.delete("/contexto/:centroCursoId", verifyToken, EliminarHorarioCompleto);
router.get("/descansos", verifyToken, ObtenerDescansos);
router.post("/descansos", verifyToken, CrearDescanso);
router.delete("/descansos/:descansoId", verifyToken, EliminarDescanso);

export default router;
