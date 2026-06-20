import express from "express";
import { googleAuth, login, microsoftAuth } from "../controllers/authController";

const router = express.Router();

router.post("/login", login);
router.post("/google", googleAuth);
router.post("/microsoft", microsoftAuth);

export default router;

