import { db } from "../config/db";

export const HorarioProfesor = async (req: any, res: any) => {
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

    const [clases]: any = await db.query(
      `SELECT
         hc.id,
         hc.tipo,
         hc.dia_semana,
         hc.hora_inicio,
         hc.hora_fin,
         a.nombre AS asignatura,
         cc.curso,
         r.nombre AS rama
       FROM horario_clases hc
       JOIN curso_asignaturas ca ON ca.id = hc.curso_asignatura_id
       JOIN asignaturas a ON a.id = ca.asignatura_id
       JOIN centro_cursos cc ON cc.id = ca.curso_id
       LEFT JOIN ramas r ON r.id = ca.rama_id
       JOIN profesor_asignaturas pa ON pa.curso_asignatura_id = ca.id
       WHERE pa.centro_usuario_id = ?
       ORDER BY hc.dia_semana, hc.hora_inicio`,
      [centroUsuarioId],
    );

    const clasesFormateadas = clases.map((c: any) => ({
      id: c.id,
      tipo: c.tipo,
      diaSemana: c.dia_semana,
      horaInicio: c.hora_inicio,
      horaFin: c.hora_fin,
      aula: c.aula,
      asignatura: c.asignatura,
      curso: c.curso,
      rama: c.rama,
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
