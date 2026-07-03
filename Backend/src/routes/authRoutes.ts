import express from "express";
import { registrarCentro } from "../controllers/registroController";
import {
  googleAuth,
  login,
  microsoftAuth,
} from "../controllers/authController";

const router = express.Router();

router.post("/login", login);

router.post("/google", googleAuth);
router.post("/microsoft", microsoftAuth);
router.post("/registro/centro", registrarCentro);

export default router;
