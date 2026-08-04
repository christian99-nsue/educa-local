import express from "express";
import { ObtenerDashboardAdmin } from "../controllers/adminDashboardController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", verifyToken, ObtenerDashboardAdmin);

export default router;
