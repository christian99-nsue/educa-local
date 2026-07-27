import express from "express";
import {
  ObtenerNotificaciones,
  MarcarComoLeida,
  MarcarTodasComoLeidas,
} from "../controllers/notificacionesController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", verifyToken, ObtenerNotificaciones);
router.put("/:notificacionId/leida", verifyToken, MarcarComoLeida);
router.put("/marcar-todas", verifyToken, MarcarTodasComoLeidas);

export default router;
