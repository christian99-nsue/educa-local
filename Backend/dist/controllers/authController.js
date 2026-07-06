"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.microsoftAuth = exports.googleAuth = exports.login = void 0;
const authService_1 = require("../services/authService");
const googleService_1 = require("../services/googleService");
const microsoftService_1 = require("../services/microsoftService");
//Login Normal
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { identifier, password } = req.body;
        const data = yield (0, authService_1.loginUser)(identifier, password);
        res.json(data);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.login = login;
//Google Login
const googleAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        console.log("Token recibido:", token);
        if (!token) {
            return res.status(400).json({ message: "Token no recibido" });
        }
        const data = yield (0, googleService_1.googleLogin)(token);
        res.json(data);
    }
    catch (err) {
        console.log("Error completo:", err.message);
        res.status(400).json({ message: err.message });
    }
});
exports.googleAuth = googleAuth;
// Microsoft Login
const microsoftAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            res.status(400).json({ message: "Token Microsoft requerido" });
            return;
        }
        const data = yield (0, microsoftService_1.microsoftLogin)(idToken);
        res.json(data);
    }
    catch (err) {
        console.log("Error Microsoft:", err.message);
        res.status(400).json({ message: err.message || "Error Microsoft login" });
    }
});
exports.microsoftAuth = microsoftAuth;
