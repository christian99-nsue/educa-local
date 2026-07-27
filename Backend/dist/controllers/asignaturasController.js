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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asignaturas = void 0;
const db_1 = require("../config/db");
const Asignaturas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const usuarioId = req.user.id;
    const centroId = req.query.centroId;
    if (!centroId) {
        return res.status(400).json({ error: "centroId es requerido" });
    }
    try {
        const [usuarioRows] = yield db_1.db.query(`SELECT curso_id, rama_id FROM centro_usuarios
            WHERE user_id = ? AND centro_id = ?`, [usuarioId, centroId]);
        if (usuarioRows.length === 0) {
            return res
                .status(404)
                .json({ error: "Usuario no encontrado en este centro" });
        }
        const { curso_id, rama_id } = usuarioRows[0];
        if (!curso_id) {
            return res
                .status(400)
                .json({ error: "El usuario no tiene curso asignado" });
        }
        const [asignaturas] = yield db_1.db.query(`SELECT
     a.id,
     a.nombre,
     a.descripcion,
     u.nombre AS profesor_nombre,
     u.apellidos AS profesor_apellidos,
     (
       SELECT COUNT(*)
       FROM tareas t
       LEFT JOIN tarea_entregas te
         ON te.tarea_id = t.id AND te.usuario_id = ?
       WHERE t.curso_asignatura_id = ca.id
         AND COALESCE(te.estado, 'pendiente') = 'pendiente'
     ) AS tareas_pendientes,
     (
       SELECT COUNT(*)
       FROM asistencias asi
       WHERE asi.curso_asignatura_id = ca.id
         AND asi.usuario_id = ?
     ) AS total_clases_registradas,
     (
       SELECT COUNT(*)
       FROM asistencias asi
       WHERE asi.curso_asignatura_id = ca.id
         AND asi.usuario_id = ?
         AND asi.estado = 'presente'
     ) AS total_presentes
   FROM curso_asignaturas ca
   JOIN asignaturas a ON a.id = ca.asignatura_id
   LEFT JOIN profesor_asignaturas pa ON pa.curso_asignatura_id = ca.id
   LEFT JOIN centro_usuarios cu ON cu.id = pa.centro_usuario_id
   LEFT JOIN usuarios u ON u.id = cu.user_id
   WHERE ca.curso_id = ?
   AND (ca.rama_id IS NULL OR ca.rama_id = ?)`, [usuarioId, usuarioId, usuarioId, curso_id, rama_id]);
        const asignaturasConDatos = asignaturas.map((a) => {
            var _a;
            const porcentaje = a.total_clases_registradas > 0
                ? Math.round((a.total_presentes / a.total_clases_registradas) * 100)
                : 0;
            const profesor = a.profesor_nombre
                ? `Prof. ${a.profesor_nombre} ${(_a = a.profesor_apellidos) !== null && _a !== void 0 ? _a : ""}`.trim()
                : "Prof. Por asignar";
            return {
                id: a.id,
                nombre: a.nombre,
                descripcion: a.descripcion,
                tareas_pendientes: a.tareas_pendientes,
                asistencia: porcentaje,
                profesor,
            };
        });
        res.json(asignaturasConDatos);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al obtener las asignaturas" });
    }
});
exports.Asignaturas = Asignaturas;
