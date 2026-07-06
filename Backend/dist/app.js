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
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
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
exports.default = app;
