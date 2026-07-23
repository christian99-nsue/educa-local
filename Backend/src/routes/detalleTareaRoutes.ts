import express from "express";
import { ObtenerDetalleTarea } from "../controllers/detalleTareaController";
import {
  ObtenerEntrega,
  GuardarCalificacion,
} from "../controllers/calificarController";
import { EditarTarea } from "../controllers/editarTareaController";
import { verifyToken } from "../middlewares/authMiddleware";
import { uploadTarea } from "../middlewares/uploadMiddleware";

const router = express.Router();

router.get("/:tareaId/detalle", verifyToken, ObtenerDetalleTarea);
router.get("/:tareaId/entrega/:alumnoId", verifyToken, ObtenerEntrega);
router.get(
  "/:tareaId/entrega/:alumnoId/calificar",
  verifyToken,
  GuardarCalificacion,
);
router.put(
  "/:tareaId/editar",
  verifyToken,
  uploadTarea.single("archivo"),
  EditarTarea,
);

export default router;
