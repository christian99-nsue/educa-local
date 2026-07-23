import express from "express";
import {
  ObtenerDetalleAsignatura,
  ObtenerMateriales,
  CrearCarpeta,
  SubirMaterial,
  EditarArchivo,
  EditarCarpeta,
  EliminarArchivo,
  EliminarCarpeta,
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
router.put("/materiales/carpeta/:carpetaId", verifyToken, EditarCarpeta);
router.delete("/materiales/carpeta/:carpetaId", verifyToken, EliminarCarpeta);
router.put("/materiales/archivo/:materialId", verifyToken, EditarArchivo);
router.delete("/materiales/archivo/:materialId", verifyToken, EliminarArchivo);

export default router;
