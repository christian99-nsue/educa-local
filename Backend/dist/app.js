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
const profesorTareasRoutes_1 = __importDefault(require("./routes/profesorTareasRoutes"));
const asistenciaRoutes_1 = __importDefault(require("./routes/asistenciaRoutes"));
const calificacionesRoutes_1 = __importDefault(require("./routes/calificacionesRoutes"));
const horarioRoutes_1 = __importDefault(require("./routes/horarioRoutes"));
const profesorPerfilRoutes_1 = __importDefault(require("./routes/profesorPerfilRoutes"));
const detalleAsignaturaRoutes_1 = __importDefault(require("./routes/detalleAsignaturaRoutes"));
const detalleTareaRoutes_1 = __importDefault(require("./routes/detalleTareaRoutes"));
const calificacionesAlumnoRoutes_1 = __importDefault(require("./routes/calificacionesAlumnoRoutes"));
const horarioAlumnoRoutes_1 = __importDefault(require("./routes/horarioAlumnoRoutes"));
const alumnoPerfilRoutes_1 = __importDefault(require("./routes/alumnoPerfilRoutes"));
const detalleAsignaturaAlumnoRoutes_1 = __importDefault(require("./routes/detalleAsignaturaAlumnoRoutes"));
const alumnoTareaRoutes_1 = __importDefault(require("./routes/alumnoTareaRoutes"));
const detalleCalificacionAsignaturaRoutes_1 = __importDefault(require("./routes/detalleCalificacionAsignaturaRoutes"));
const notificacionesRoutes_1 = __importDefault(require("./routes/notificacionesRoutes"));
const rateLimitMiddleware_1 = require("./middlewares/rateLimitMiddleware");
const adminDashboardRoutes_1 = __importDefault(require("./routes/adminDashboardRoutes"));
const adminAlumnosRoutes_1 = __importDefault(require("./routes/adminAlumnosRoutes"));
const adminProfesoresRoutes_1 = __importDefault(require("./routes/adminProfesoresRoutes"));
const adminCursosRoutes_1 = __importDefault(require("./routes/adminCursosRoutes"));
const adminHorarioRoutes_1 = __importDefault(require("./routes/adminHorarioRoutes"));
const passwordRoutes_1 = __importDefault(require("./routes/passwordRoutes"));
const adminAjustesRoutes_1 = __importDefault(require("./routes/adminAjustesRoutes"));
const adminAnadirAlumnoRoutes_1 = __importDefault(require("./routes/adminAnadirAlumnoRoutes"));
const adminAnadirProfesorRoutes_1 = __importDefault(require("./routes/adminAnadirProfesorRoutes"));
const app = (0, express_1.default)();
app.set("trust proxy", 1);
const allowedOrigins = [
    "https://educa-local.vercel.app",
    "https://christian99-nsue.github.io",
    "http://localhost:5173",
    "http://localhost:5174",
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
app.use("/api/profesor/tareas", profesorTareasRoutes_1.default);
app.use("/api/profesor/asistencia", asistenciaRoutes_1.default);
app.use("/api/profesor/calificaciones", calificacionesRoutes_1.default);
app.use("/api/profesor/horario", horarioRoutes_1.default);
app.use("/api/profesor/perfil", profesorPerfilRoutes_1.default);
app.use("/api/profesor/asignatura", detalleAsignaturaRoutes_1.default);
app.use("/api/profesor/tarea", detalleTareaRoutes_1.default);
app.use("/api/calificaciones", calificacionesAlumnoRoutes_1.default);
app.use("/api/horario", horarioAlumnoRoutes_1.default);
app.use("/api/alumno/perfil", alumnoPerfilRoutes_1.default);
app.use("/api/alumno/asignatura", detalleAsignaturaAlumnoRoutes_1.default);
app.use("/api/alumno/tarea", alumnoTareaRoutes_1.default);
app.use("/api/calificaciones/asignatura", detalleCalificacionAsignaturaRoutes_1.default);
app.use("/api/notificaciones", notificacionesRoutes_1.default);
app.use("/api/admin/dashboard", adminDashboardRoutes_1.default);
app.use("/api/admin/alumnos", adminAlumnosRoutes_1.default);
app.use("/api/admin/profesores", adminProfesoresRoutes_1.default);
app.use("/api/admin/cursos", adminCursosRoutes_1.default);
app.use("/api/admin/horario", adminHorarioRoutes_1.default);
app.use("/api/password", passwordRoutes_1.default);
app.use("/api/admin/ajustes", adminAjustesRoutes_1.default);
app.use("/api/admin/alumnos/anadir", adminAnadirAlumnoRoutes_1.default);
app.use("/api/admin/profesores/anadir", adminAnadirProfesorRoutes_1.default);
app.use("/api", rateLimitMiddleware_1.limiteGeneral);
exports.default = app;
