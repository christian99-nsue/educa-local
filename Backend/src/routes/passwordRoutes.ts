import express from "express";
import { CambiarPassword } from "../controllers/cambiarPasswordController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.put("/cambiar", verifyToken, CambiarPassword);

export default router;
