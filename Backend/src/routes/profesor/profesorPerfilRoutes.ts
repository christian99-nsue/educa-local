import express from "express";
import {
  ObtenerPerfilProfesor,
  ActualizarPerfilProfesor,
} from "../../controllers/profesor/profesorPerfilController";
import { verifyToken } from "../../middlewares/authMiddleware";
import { uploadTarea } from "../../middlewares/uploadMiddleware";
import { limiteSubidaArchivos } from "../../middlewares/rateLimitMiddleware";

const router = express.Router();

router.get("/", verifyToken, ObtenerPerfilProfesor);
router.put(
  "/",
  verifyToken,
  limiteSubidaArchivos,
  uploadTarea.single("foto"),
  ActualizarPerfilProfesor,
);

export default router;
