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
exports.microsoftLogin = void 0;
const db_1 = require("../config/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const microsoftTenantId = process.env.MICROSOFT_TENANT_ID;
const microsoftClientId = process.env.MICROSOFT_CLIENT_ID;
const client = (0, jwks_rsa_1.default)({
    jwksUri: `https://login.microsoftonline.com/common/discovery/v2.0/keys`,
});
const getSigningKey = (header, callback) => {
    if (!header.kid) {
        callback(new Error("Token Microsoft sin key id"));
        return;
    }
    client.getSigningKey(header.kid, (error, key) => {
        if (error || !key) {
            callback(error || new Error("No se pudo obtener la clave Microsoft"));
            return;
        }
        callback(null, key.getPublicKey());
    });
};
const verifyMicrosoftIdToken = (idToken) => {
    if (!microsoftTenantId || !microsoftClientId) {
        throw new Error("Microsoft Auth no está configurado en el backend");
    }
    const decoded = jsonwebtoken_1.default.decode(idToken);
    console.log("Issuer del token:", decoded === null || decoded === void 0 ? void 0 : decoded.iss);
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(idToken, getSigningKey, {
            algorithms: ["RS256"],
            audience: microsoftClientId,
            issuer: [
                `https://login.microsoftonline.com/${microsoftTenantId}/v2.0`,
                `https://sts.windows.net/${microsoftTenantId}/`,
                `https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0`,
            ],
        }, (error, decoded) => {
            if (error) {
                reject(error);
                return;
            }
            if (!decoded || typeof decoded === "string") {
                reject(new Error("Token Microsoft inválido"));
                return;
            }
            resolve(decoded);
        });
    });
};
const microsoftLogin = (idToken) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = yield verifyMicrosoftIdToken(idToken);
    const email = payload.email || payload.preferred_username || payload.upn;
    if (!email || typeof email !== "string") {
        throw new Error("El token Microsoft no contiene correo electrónico");
    }
    const [users] = yield db_1.db.query(`SELECT * FROM usuarios WHERE email = ?`, [email]);
    if (users.length === 0) {
        throw new Error("No existe un usuario registrado con ese correo Microsoft");
    }
    const user = users[0];
    const [centros] = yield db_1.db.query(`
    SELECT cu.rol_en_centro, c.id as centro_id, c.nombre as centro_nombre
    FROM centro_usuarios cu
    JOIN centros c ON cu.centro_id = c.id
    WHERE cu.user_id = ?
    `, [user.id]);
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        centros,
    }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return {
        user: {
            id: user.id,
            email: user.email,
            code: user.code,
            nombre: user.nombre,
            apellidos: user.apellidos,
        },
        centros,
        token,
    };
});
exports.microsoftLogin = microsoftLogin;
