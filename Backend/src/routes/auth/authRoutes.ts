import express from "express";
import { registrarCentro } from "../../controllers/auth/registroController";
import {
  limiteLogin,
  limiteRegistro,
} from "../../middlewares/rateLimitMiddleware";
import {
  googleAuth,
  login,
  microsoftAuth,
} from "../../controllers/auth/authController";

const router = express.Router();

router.post("/login", limiteLogin, login);

router.post("/google", googleAuth);
router.post("/microsoft", microsoftAuth);
router.post("/registro/centro", limiteRegistro, registrarCentro);

export default router;
