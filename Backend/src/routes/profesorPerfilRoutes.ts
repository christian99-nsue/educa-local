import express from "express";
import {
  ObtenerPerfilProfesor,
  ActualizarPerfilProfesor,
} from "../controllers/profesorPerfilController";
import { verifyToken } from "../middlewares/authMiddleware";
import { uploadTarea } from "../middlewares/uploadMiddleware";

const router = express.Router();

router.get("/", verifyToken, ObtenerPerfilProfesor);
router.put(
  "/",
  verifyToken,
  uploadTarea.single("foto"),
  ActualizarPerfilProfesor,
);

export default router;
