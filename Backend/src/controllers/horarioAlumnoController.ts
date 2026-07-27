import { db } from "../config/db";

export const HorarioAlumno = async (req: any, res: any) => {
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

    const [clases]: any = await db.query(
      `SELECT
         hc.id,
         hc.tipo,
         hc.dia_semana,
         hc.hora_inicio,
         hc.hora_fin,
         a.nombre AS asignatura,
         r.nombre AS rama,
         u.nombre AS profesor_nombre,
         u.apellidos AS profesor_apellidos
       FROM horario_clases hc
       JOIN curso_asignaturas ca ON ca.id = hc.curso_asignatura_id
       JOIN asignaturas a ON a.id = ca.asignatura_id
       LEFT JOIN ramas r ON r.id = ca.rama_id
       LEFT JOIN profesor_asignaturas pa ON pa.curso_asignatura_id = ca.id
       LEFT JOIN centro_usuarios cu ON cu.id = pa.centro_usuario_id
       LEFT JOIN usuarios u ON u.id = cu.user_id
       WHERE ca.curso_id = ?
       AND (ca.rama_id IS NULL OR ca.rama_id = ?)
       AND hc.tipo = 'clase'
       ORDER BY hc.dia_semana, hc.hora_inicio`,
      [curso_id, rama_id],
    );

    const clasesFormateadas = clases.map((c: any) => ({
      id: c.id,
      tipo: c.tipo,
      diaSemana: c.dia_semana,
      horaInicio: c.hora_inicio,
      horaFin: c.hora_fin,
      asignatura: c.asignatura,
      rama: c.rama,
      profesor: c.profesor_nombre
        ? `Prof. ${c.profesor_nombre} ${c.profesor_apellidos ?? ""}`.trim()
        : "Prof. Por asignar",
    }));

    const [descansos]: any = await db.query(
      `SELECT id, nombre, hora_inicio, hora_fin FROM horario_descansos WHERE centro_id = ?`,
      [centroId],
    );

    res.json({
      clases: clasesFormateadas,
      descansos: descansos.map((d: any) => ({
        id: d.id,
        nombre: d.nombre,
        horaInicio: d.hora_inicio,
        horaFin: d.hora_fin,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener el horario" });
  }
};
