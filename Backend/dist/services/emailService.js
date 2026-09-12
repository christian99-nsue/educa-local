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
exports.sendPasswordResetEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, subject, html }) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("SMTP no configurado: faltan EMAIL_USER o EMAIL_PASS");
    }
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    try {
        yield transporter.sendMail({
            from: `"Educa Local" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
    }
    catch (error) {
        console.error("Error SMTP al enviar correo:", {
            code: error === null || error === void 0 ? void 0 : error.code,
            responseCode: error === null || error === void 0 ? void 0 : error.responseCode,
            command: error === null || error === void 0 ? void 0 : error.command,
            message: error === null || error === void 0 ? void 0 : error.message,
        });
        throw error;
    }
});
exports.sendEmail = sendEmail;
const sendPasswordResetEmail = (email, resetLink) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.sendEmail)({
        to: email,
        subject: "Recuperación de contraseña",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Recuperar contraseña</h2>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el botón para continuar:</p>
        <a href="${resetLink}" style="
          background-color: #7c3aed;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          display: inline-block;
          margin: 16px 0;
        ">Restablecer contraseña</a>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
        <p>El enlace expira en <strong>1 hora</strong>.</p>
      </div>
    `,
    });
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
