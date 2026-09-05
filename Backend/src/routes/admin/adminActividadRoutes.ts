import express from "express";
import {
  ObtenerActividadCompleta,
  ObtenerUsuariosParaFiltro,
} from "../../controllers/admin/adminActividadController";
import { verifyToken } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/", verifyToken, ObtenerActividadCompleta);
router.get("/usuarios", verifyToken, ObtenerUsuariosParaFiltro);

export default router;
