import express from "express";
import {
  ObtenerAjustes,
  ActualizarCentro,
  ActualizarAdmin,
} from "../controllers/adminAjustesController";
import { verifyToken } from "../middlewares/authMiddleware";
import { uploadTarea } from "../middlewares/uploadMiddleware";

const router = express.Router();

router.get("/", verifyToken, ObtenerAjustes);
router.put(
  "/centro",
  verifyToken,
  uploadTarea.single("logo"),
  ActualizarCentro,
);
router.put("/admin", verifyToken, uploadTarea.single("foto"), ActualizarAdmin);

export default router;
