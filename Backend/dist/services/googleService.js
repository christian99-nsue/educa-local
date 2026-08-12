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
exports.googleLogin = void 0;
const google_auth_library_1 = require("google-auth-library");
const db_1 = require("../config/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleLogin = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const ticket = yield client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload === null || payload === void 0 ? void 0 : payload.email;
    const [users] = yield db_1.db.query(`SELECT * FROM usuarios WHERE email = ?`, [email]);
    const user = users[0];
    if (!user)
        throw new Error("Usuario no encontrado");
    const [centrosRaw] = yield db_1.db.query(`
    SELECT 
      c.id AS centro_id,
      c.nombre AS centro_nombre,
      cu.rol_en_centro,
      cc.curso AS curso_nombre
    FROM centro_usuarios cu
    JOIN centros c ON cu.centro_id = c.id
    LEFT JOIN centro_cursos cc ON cu.curso_id = cc.id
    WHERE cu.user_id = ?
    `, [user.id]);
    const centros = centrosRaw.map((c) => ({
        id: c.centro_id,
        nombre: c.centro_nombre,
        rol: c.rol_en_centro,
        nombre_del_curso: c.curso_nombre,
    }));
    const centrosUnicos = Array.from(new Map(centros.map((c) => [c.id, c])).values());
    const tokenJWT = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
    return {
        token: tokenJWT,
        user: {
            id: user.id,
            email: user.email,
            code: user.code,
            nombre: user.nombre,
            apellidos: user.apellidos,
            foto_url: user.foto_url,
        },
        centros: centrosUnicos,
    };
});
exports.googleLogin = googleLogin;
