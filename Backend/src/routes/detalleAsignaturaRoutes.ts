import express from "express";
import {
  ObtenerDetalleAsignatura,
  ObtenerMateriales,
  CrearCarpeta,
  SubirMaterial,
} from "../controllers/detalleAsignaturaController";
import { verifyToken } from "../middlewares/authMiddleware";
import { uploadMaterial } from "../middlewares/uploadMaterialMiddleware";

const router = express.Router();

router.get(
  "/:cursoAsignaturaId/detalle",
  verifyToken,
  ObtenerDetalleAsignatura,
);
router.get("/:cursoAsignaturaId/materiales", verifyToken, ObtenerMateriales);
router.post("/materiales/crear-carpeta", verifyToken, CrearCarpeta);
router.post(
  "/materiales/subir",
  verifyToken,
  uploadMaterial.single("archivo"),
  SubirMaterial,
);

export default router;
