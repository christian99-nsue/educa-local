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
exports.loginUser = void 0;
const db_1 = require("../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const loginUser = (identifier, password) => __awaiter(void 0, void 0, void 0, function* () {
    const cleanIdentifier = identifier === null || identifier === void 0 ? void 0 : identifier.trim();
    if (!cleanIdentifier || !password) {
        throw new Error("Correo/codigo y contrasena requeridos");
    }
    const sql = `
    SELECT * FROM usuarios 
    WHERE email = ? OR code = ?
  `;
    const [rows] = yield db_1.db.query(sql, [cleanIdentifier, cleanIdentifier]);
    if (rows.length === 0) {
        throw new Error("Usuario no encontrado");
    }
    const user = rows[0];
    const match = yield bcrypt_1.default.compare(password, user.password);
    if (!match) {
        throw new Error("Contraseña incorrecta");
    }
    const [centrosRaw] = (yield db_1.db.query(`
  SELECT 
    c.id AS centro_id,
    c.nombre AS centro_nombre,
    cu.rol_en_centro,
    cc.curso AS curso_nombre
  FROM centro_usuarios cu
  JOIN centros c ON cu.centro_id = c.id
  LEFT JOIN centro_cursos cc ON cu.curso_id = cc.id
  WHERE cu.user_id = ?
  `, [user.id]));
    const centros = centrosRaw.map((c) => ({
        id: c.centro_id,
        nombre: c.centro_nombre,
        rol: c.rol_en_centro,
        nombre_del_curso: c.curso_nombre,
    }));
    const centrosUnicos = Array.from(new Map(centros.map((c) => [c.id, c])).values());
    console.log("centrosunicos:", JSON.stringify(centrosUnicos, null, 2));
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        centros: centrosUnicos,
    }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return {
        user: {
            id: user.id,
            email: user.email,
            code: user.code,
            nombre: user.nombre,
            apellidos: user.apellidos,
        },
        centros: centrosUnicos,
        token,
    };
});
exports.loginUser = loginUser;
