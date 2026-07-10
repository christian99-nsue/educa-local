"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const passwordResetRoutes_1 = __importDefault(require("./routes/passwordResetRoutes"));
const asignaturasRoutes_1 = __importDefault(require("./routes/asignaturasRoutes"));
const tareasRoutes_1 = __importDefault(require("./routes/tareasRoutes"));
const profesorAsignaturasRoutes_1 = __importDefault(require("./routes/profesorAsignaturasRoutes"));
const app = (0, express_1.default)();
const allowedOrigins = [
    "https://educa-local.vercel.app",
    "https://christian99-nsue.github.io",
    "http://localhost:5173",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("No permitido por CORS"));
        }
    },
    credentials: true,
}));
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
    res.setHeader("Cross-Origin-Embedder_policy", "unsafe-none");
    next();
});
app.use(express_1.default.json());
app.use("/api/auth", authRoutes_1.default);
app.use("/api/auth", passwordResetRoutes_1.default);
app.use("/api/asignaturas", asignaturasRoutes_1.default);
app.use("/api/tareas", tareasRoutes_1.default);
app.use("/api/profesor/asignaturas", profesorAsignaturasRoutes_1.default);
exports.default = app;
