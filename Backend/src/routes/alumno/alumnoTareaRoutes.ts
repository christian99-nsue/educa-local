import express from "express";
import {
  ObtenerDetalleTareaAlumno,
  EntregarTarea,
} from "../../controllers/alumno/alumnoTareaController";
import { verifyToken } from "../../middlewares/authMiddleware";
import { uploadTarea } from "../../middlewares/uploadMiddleware";

const router = express.Router();

router.get("/:tareaId/detalle", verifyToken, ObtenerDetalleTareaAlumno);
router.post(
  "/:tareaId/entregar",
  verifyToken,
  uploadTarea.single("archivo"),
  EntregarTarea,
);

export default router;
