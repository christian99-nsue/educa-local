"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const registroController_1 = require("../controllers/registroController");
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
router.post("/login", authController_1.login);
router.post("/google", authController_1.googleAuth);
router.post("/microsoft", authController_1.microsoftAuth);
router.post("/registro/centro", registroController_1.registrarCentro);
exports.default = router;
