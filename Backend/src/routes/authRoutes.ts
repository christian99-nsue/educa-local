import express from "express";
import {
  googleAuth,
  login,
  microsoftAuth,
} from "../controllers/authController";

const router = express.Router();

router.post("/login", login);

router.get("/google", (req, res) => {
  res.send("Google auth endpoint funcionando");
});
router.post("/microsoft", microsoftAuth);

export default router;
