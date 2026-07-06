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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../config/db");
const emailService_1 = require("../services/emailService");
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email requerido" });
            return;
        }
        const [users] = yield db_1.db.query(`SELECT * FROM usuarios WHERE email = ?`, [email]);
        if (users.length === 0) {
            // Por seguridad respondemos igual aunque no exista el usuario
            res.json({ message: "Si el correo existe recibirás un email" });
            return;
        }
        // Generar token único
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
        // Eliminar tokens anteriores del mismo email
        yield db_1.db.query(`DELETE FROM password_resets WHERE email = ?`, [email]);
        // Guardar nuevo token
        yield db_1.db.query(`INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)`, [email, token, expiresAt]);
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        yield (0, emailService_1.sendPasswordResetEmail)(email, resetLink);
        res.json({ message: "Si el correo existe recibirás un email" });
    }
    catch (err) {
        console.error("Error forgotPassword:", err);
        res.status(500).json({ message: "Error al procesar la solicitud" });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            res.status(400).json({ message: "Token y contraseña requeridos" });
            return;
        }
        const [resets] = yield db_1.db.query(`SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()`, [token]);
        if (resets.length === 0) {
            res.status(400).json({ message: "Token inválido o expirado" });
            return;
        }
        const { email } = resets[0];
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield db_1.db.query(`UPDATE usuarios SET password = ? WHERE email = ?`, [
            hashedPassword,
            email,
        ]);
        yield db_1.db.query(`DELETE FROM password_resets WHERE token = ?`, [token]);
        res.json({ message: "Contraseña actualizada correctamente" });
    }
    catch (err) {
        console.error("Error resetPassword:", err);
        res.status(500).json({ message: "Error al actualizar la contraseña" });
    }
});
exports.resetPassword = resetPassword;
