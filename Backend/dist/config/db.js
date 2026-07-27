"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const usaSufijos = !!process.env.DB_TARGET;
const target = process.env.DB_TARGET === "railway" ? "RAILWAY" : "LOCAL";
const dbHost = usaSufijos
    ? process.env[`DB_HOST_${target}`]
    : process.env.DB_HOST;
const dbUser = usaSufijos
    ? process.env[`DB_USER_${target}`]
    : process.env.DB_USER;
const dbPassword = usaSufijos
    ? process.env[`DB_PASSWORD_${target}`]
    : process.env.DB_PASSWORD;
const dbName = usaSufijos
    ? process.env[`DB_NAME_${target}`]
    : process.env.DB_NAME;
const dbPort = usaSufijos
    ? process.env[`DB_PORT_${target}`]
    : process.env.DB_PORT;
exports.db = promise_1.default.createPool({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    port: Number(dbPort),
});
console.log(`Conectado a la base de datos: ${usaSufijos ? target : "Variables de Railway/entorno directo"}`);
