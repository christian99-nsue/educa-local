"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/auth/authRoutes"));
const passwordResetRoutes_1 = __importDefault(require("./routes/auth/passwordResetRoutes"));
const asignaturasRoutes_1 = __importDefault(require("./routes/alumno/asignaturasRoutes"));
const tareasRoutes_1 = __importDefault(require("./routes/alumno/tareasRoutes"));
const profesorAsignaturasRoutes_1 = __importDefault(require("./routes/profesor/profesorAsignaturasRoutes"));
const profesorTareasRoutes_1 = __importDefault(require("./routes/profesor/profesorTareasRoutes"));
const asistenciaRoutes_1 = __importDefault(require("./routes/profesor/asistenciaRoutes"));
const calificacionesRoutes_1 = __importDefault(require("./routes/profesor/calificacionesRoutes"));
const horarioRoutes_1 = __importDefault(require("./routes/profesor/horarioRoutes"));
const profesorPerfilRoutes_1 = __importDefault(require("./routes/profesor/profesorPerfilRoutes"));
const detalleAsignaturaRoutes_1 = __importDefault(require("./routes/profesor/detalleAsignaturaRoutes"));
const detalleTareaRoutes_1 = __importDefault(require("./routes/profesor/detalleTareaRoutes"));
const calificacionesAlumnoRoutes_1 = __importDefault(require("./routes/alumno/calificacionesAlumnoRoutes"));
const horarioAlumnoRoutes_1 = __importDefault(require("./routes/alumno/horarioAlumnoRoutes"));
const alumnoPerfilRoutes_1 = __importDefault(require("./routes/alumno/alumnoPerfilRoutes"));
const detalleAsignaturaAlumnoRoutes_1 = __importDefault(require("./routes/alumno/detalleAsignaturaAlumnoRoutes"));
const alumnoTareaRoutes_1 = __importDefault(require("./routes/alumno/alumnoTareaRoutes"));
const detalleCalificacionAsignaturaRoutes_1 = __importDefault(require("./routes/alumno/detalleCalificacionAsignaturaRoutes"));
const notificacionesRoutes_1 = __importDefault(require("./routes/auth/notificacionesRoutes"));
const rateLimitMiddleware_1 = require("./middlewares/rateLimitMiddleware");
const adminDashboardRoutes_1 = __importDefault(require("./routes/admin/adminDashboardRoutes"));
const adminAlumnosRoutes_1 = __importDefault(require("./routes/admin/adminAlumnosRoutes"));
const adminProfesoresRoutes_1 = __importDefault(require("./routes/admin/adminProfesoresRoutes"));
const adminCursosRoutes_1 = __importDefault(require("./routes/admin/adminCursosRoutes"));
const adminHorarioRoutes_1 = __importDefault(require("./routes/admin/adminHorarioRoutes"));
const passwordRoutes_1 = __importDefault(require("./routes/auth/passwordRoutes"));
const adminAjustesRoutes_1 = __importDefault(require("./routes/admin/adminAjustesRoutes"));
const adminAnadirAlumnoRoutes_1 = __importDefault(require("./routes/admin/adminAnadirAlumnoRoutes"));
const adminAnadirProfesorRoutes_1 = __importDefault(require("./routes/admin/adminAnadirProfesorRoutes"));
const adminCrearCursoRoutes_1 = __importDefault(require("./routes/admin/adminCrearCursoRoutes"));
const adminHorariosBuilderRoutes_1 = __importDefault(require("./routes/admin/adminHorariosBuilderRoutes"));
const adminDetalleCursoRoutes_1 = __importDefault(require("./routes/admin/adminDetalleCursoRoutes"));
const adminActividadRoutes_1 = __importDefault(require("./routes/admin/adminActividadRoutes"));
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
    // Headers CORS más seguros por defecto
    // Si necesitas compartir recursos entre orígenes específicos, usa valores restrictivos
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "cross-origin");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
});
app.use(express_1.default.json());
app.use("/api", rateLimitMiddleware_1.limiteGeneral);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/auth", passwordResetRoutes_1.default);
app.use("/api/alumno/asignaturas", asignaturasRoutes_1.default);
app.use("/api/alumno/tareas", tareasRoutes_1.default);
app.use("/api/profesor/asignaturas", profesorAsignaturasRoutes_1.default);
app.use("/api/profesor/tareas", profesorTareasRoutes_1.default);
app.use("/api/profesor/asistencia", asistenciaRoutes_1.default);
app.use("/api/profesor/calificaciones", calificacionesRoutes_1.default);
app.use("/api/profesor/horario", horarioRoutes_1.default);
app.use("/api/profesor/perfil", profesorPerfilRoutes_1.default);
app.use("/api/profesor/asignatura", detalleAsignaturaRoutes_1.default);
app.use("/api/profesor/tarea", detalleTareaRoutes_1.default);
app.use("/api/alumno/calificaciones", calificacionesAlumnoRoutes_1.default);
app.use("/api/alumno/horario", horarioAlumnoRoutes_1.default);
app.use("/api/alumno/perfil", alumnoPerfilRoutes_1.default);
app.use("/api/alumno/asignatura", detalleAsignaturaAlumnoRoutes_1.default);
app.use("/api/alumno/tarea", alumnoTareaRoutes_1.default);
app.use("/api/alumno/calificaciones/asignatura", detalleCalificacionAsignaturaRoutes_1.default);
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
app.use("/api/admin/cursos/crear", adminCrearCursoRoutes_1.default);
app.use("/api/admin/horarios", adminHorariosBuilderRoutes_1.default);
app.use("/api/admin/cursos", adminDetalleCursoRoutes_1.default);
app.use("/api/admin/actividad", adminActividadRoutes_1.default);
exports.default = app;
