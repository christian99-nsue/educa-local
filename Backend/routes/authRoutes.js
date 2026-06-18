import express from "express";
import {
  login,
  selectCenter,
  googleLogin,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/select-center", protect, selectCenter);
router.post("/google", googleLogin);

export default router;
