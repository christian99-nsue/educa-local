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
       JOIN profesor_asignaturas pa ON pa.id = hc.profesor_asignatura_id
       JOIN curso_asignaturas ca ON ca.id = pa.curso_asignatura_id
       JOIN asignaturas a ON a.id = ca.asignatura_id
       JOIN centro_cursos cc ON cc.id = ca.curso_id
       LEFT JOIN ramas r ON r.id = ca.rama_id
       WHERE pa.centro_usuario_id = ?
       ORDER BY hc.dia_semana, hc.hora_inicio`,
      [centroUsuarioId],
    );

    const clasesFormateadas = clases.map((c: any) => {
      let titulo = c.asignatura;
      if (c.tipo === "refuerzo") titulo = `Refuerzo ${c.asignatura}`;
      if (c.tipo === "tutoria") titulo = "Tutoria";

      return {
        id: c.id,
        tipo: c.tipo,
        diaSemana: c.dia_semana,
        horaInicio: c.hora_inicio,
        horaFin: c.hora_fin,
        aula: c.aula,
        titulo,
        curso: c.curso,
        rama: c.rama,
      };
    });

    res.json(clasesFormateadas);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener el horario" });
  }
};
