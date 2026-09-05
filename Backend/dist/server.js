"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const envValidation_1 = require("./config/envValidation");
dotenv_1.default.config();
// Validar variables de entorno requeridas
(0, envValidation_1.validateEnvironment)();
const PORT = process.env.PORT || 3000;
if (!PORT) {
    console.error("❌ Error: PORT no está definida en las variables de entorno");
    process.exit(1);
}
const server = app_1.default.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.error(`❌ Error: El puerto ${PORT} ya está en uso. Usa otro puerto.`);
    }
    else {
        console.error(`❌ Error del servidor: ${error.message}`);
    }
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Promesa rechazada sin manejar:", promise, "Razón:", reason);
    process.exit(1);
});
process.on("uncaughtException", (error) => {
    console.error("❌ Excepción no capturada:", error);
    process.exit(1);
});
