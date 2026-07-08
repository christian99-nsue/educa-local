import { db } from "../config/db";

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
    const [asignaturas]: any = await db.query(
      `SELECT a.id, a.nombre, a.descripcion,
      (
      SELECT COUNT(*)
      FROM tareas t
      LEFT JOIN tarea_entregas te 
        ON te.tarea_id = t.id AND te.usuario_id = ?
        WHERE t.asignatura_id = a.id
        AND t.curso_id = ca.curso_id
        AND (t.rama_id IS NULL OR t.rama_id = ?)
        AND COALESCE(te.estado, "pendiente") = "pendiente"
      ) AS tareas_pendientes
       FROM curso_asignaturas ca
       JOIN asignaturas a ON a.id = ca.asignatura_id
       WHERE ca.curso_id = ?
       AND (ca.rama_id IS NULL OR ca.rama_id = ?)`,
      [usuarioId, rama_id, curso_id, rama_id],
    );
    res.json(asignaturas);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener las asignaturas" });
  }
};
