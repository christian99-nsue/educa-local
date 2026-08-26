import { db } from "../../config/db";
import {
  notaANumero,
  formatearPromedioDisplay,
  SistemaCalificacion,
  getEstado,
  estadoColor,
} from "../../utils/calificacionesUtils";

export const Asignaturas = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const centroId = req.query.centroId;

  if (!centroId) {
    return res.status(400).json({ error: "centroId es requerido" });
  }
  try {
    const [usuarioRows]: any = await db.query(
      `SELECT curso_id, rama_id FROM centro_usuarios
            WHERE user_id = ? AND centro_id = ?`,
      [usuarioId, centroId],
    );
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

    const [configRows]: any = await db.query(
      `SELECT sistema_calificacion FROM centro_configuracion WHERE centro_id = ?`,
      [centroId],
    );
    const sistemaCalificacion = (configRows[0]?.sistema_calificacion ??
      "sobre-10") as SistemaCalificacion;

    const [asignaturas]: any = await db.query(
      `SELECT
      ca.id AS curso_asignatura_id,
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
   AND (ca.rama_id IS NULL OR ca.rama_id = ?)`,
      [usuarioId, usuarioId, usuarioId, curso_id, rama_id],
    );

    const [notasRows]: any = await db.query(
      `SELECT t.curso_asignatura_id, te.nota
      FROM tareas t
      JOIN tarea_entregas te ON te.tarea_id = t.id
      WHERE te.usuario_id = ?
      AND te.estado = 'calificada'
      AND te.nota IS NOT NULL`,
      [usuarioId],
    );

    const asignaturasConDatos = asignaturas.map((a: any) => {
      const porcentajeAsistencia =
        a.total_clases_registradas > 0
          ? Math.round((a.total_presentes / a.total_clases_registradas) * 100)
          : 0;

      const profesor = a.profesor_nombre
        ? `Prof. ${a.profesor_nombre} ${a.profesor_apellidos ?? ""}`.trim()
        : "Prof. Por asignar";

      const notasDeEstaAsignatura = notasRows.filter(
        (n: any) => n.curso_asignatura_id === a.id,
      );

      const valoresNumericos = notasDeEstaAsignatura
        .map((n: any) => notaANumero(n.nota, sistemaCalificacion))
        .filter((v: number | null): v is number => v !== null);

      let notaActual: string | null = null;
      let notaColor: { bg: string; color: string } | null = null;
      if (valoresNumericos.length > 0) {
        const promedio =
          valoresNumericos.reduce((acc: number, v: number) => acc + v, 0) /
          valoresNumericos.length;
        notaActual = formatearPromedioDisplay(promedio, sistemaCalificacion);
        const estado = getEstado(promedio);
        notaColor = estadoColor[estado];
      }

      return {
        cursoAsignaturaId: a.curso_asignatura_id,
        id: a.id,
        nombre: a.nombre,
        descripcion: a.descripcion,
        tareas_pendientes: a.tareas_pendientes,
        asistencia: porcentajeAsistencia,
        profesor,
        notaActual,
        notaColor,
      };
    });

    res.json(asignaturasConDatos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener las asignaturas" });
  }
};
