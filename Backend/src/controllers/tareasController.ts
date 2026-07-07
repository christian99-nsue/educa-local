import { db } from "../config/db";

export const Tareas = async (req: any, res: any) => {
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

    const [tareas]: any = await db.query(
      `SELECT
         t.id,
         t.titulo,
         t.descripcion,
         t.fecha_entrega,
         a.nombre AS asignatura_nombre,
         COALESCE(te.estado, 'pendiente') AS estado_entrega,
         te.nota
       FROM tareas t
       JOIN asignaturas a ON a.id = t.asignatura_id
       LEFT JOIN tarea_entregas te
         ON te.tarea_id = t.id AND te.usuario_id = ?
       WHERE t.curso_id = ?
       AND (t.rama_id IS NULL OR t.rama_id = ?)
       ORDER BY t.fecha_entrega ASC`,
      [usuarioId, curso_id, rama_id],
    );

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const tareasConEstado = tareas.map((t: any) => {
      const fechaEntrega = new Date(t.fecha_entrega);
      let estado = t.estado_entrega;

      if (estado === "pendiente" && fechaEntrega < hoy) {
        estado = "atrasada";
      } else if (estado === "pendiente") {
        estado = "activa";
      }

      const diffMs = fechaEntrega.getTime() - hoy.getTime();
      const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      return {
        id: t.id,
        titulo: t.titulo,
        asignatura: t.asignatura_nombre,
        fechaEntrega: t.fecha_entrega,
        diasRestantes,
        estado,
        nota: t.nota,
      };
    });

    res.json(tareasConEstado);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener las tareas" });
  }
};
