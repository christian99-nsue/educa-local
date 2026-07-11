import { db } from "../config/db";

export const TareasProfesor = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const centroId = req.query.centroId;

  if (!centroId) {
    return res.status(400).json({ error: "centroId es requerido" });
  }

  try {
    const [centroUsuarioRows]: any = await db.query(
      `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ?`,
      [usuarioId, centroId],
    );

    if (centroUsuarioRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Usuario no encontrado en este centro" });
    }

    const centroUsuarioId = centroUsuarioRows[0].id;

    const [tareas]: any = await db.query(
      `SELECT
         t.id,
         t.titulo,
         ca.id AS curso_asignatura_id,
         a.nombre AS asignatura,
         cc.curso,
         r.nombre AS rama,
         t.fecha_entrega,
         (
           SELECT COUNT(*)
           FROM tarea_entregas te
           WHERE te.tarea_id = t.id
             AND te.estado IN ('entregada', 'calificada')
         ) AS entregas_realizadas,
         (
           SELECT COUNT(*)
           FROM centro_usuarios cu2
           WHERE cu2.curso_id = ca.curso_id
             AND cu2.centro_id = ?
             AND (ca.rama_id IS NULL OR cu2.rama_id = ca.rama_id)
         ) AS total_alumnos,
         (
           SELECT COUNT(*)
           FROM tarea_entregas te2
           WHERE te2.tarea_id = t.id AND te2.estado = 'calificada'
         ) AS calificadas_count
       FROM tareas t
       JOIN curso_asignaturas ca ON ca.id = t.curso_asignatura_id
       JOIN asignaturas a ON a.id = ca.asignatura_id
       JOIN centro_cursos cc ON cc.id = ca.curso_id
       LEFT JOIN ramas r ON r.id = ca.rama_id
       JOIN profesor_asignaturas pa ON pa.curso_asignatura_id = ca.id
       WHERE pa.centro_usuario_id = ?
       ORDER BY t.fecha_entrega ASC`,
      [centroId, centroUsuarioId],
    );

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const tareasConEstado = tareas.map((t: any) => {
      const fechaEntrega = new Date(t.fecha_entrega);
      let estado: "activa" | "cerrada" | "calificada";

      if (t.calificadas_count > 0) {
        estado = "calificada";
      } else if (fechaEntrega < hoy) {
        estado = "cerrada";
      } else {
        estado = "activa";
      }

      return {
        id: t.id,
        titulo: t.titulo,
        cursoAsignaturaId: t.curso_asignatura_id,
        asignatura: t.asignatura,
        curso: t.curso,
        rama: t.rama,
        fechaEntrega: t.fecha_entrega,
        entregasRealizadas: t.entregas_realizadas,
        totalAlumnos: t.total_alumnos,
        estado,
      };
    });

    res.json(tareasConEstado);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener las tareas" });
  }
};
