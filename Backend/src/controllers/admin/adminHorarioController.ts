import { db } from "../../config/db";

const verificarAdmin = async (usuarioId: number, centroId: any) => {
  const [rows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'admin'`,
    [usuarioId, centroId],
  );
  return rows.length > 0;
};

export const ObtenerCursosParaHorario = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const centroId = req.query.centroId;

  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [cursos]: any = await db.query(
      `SELECT DISTINCT
         cc.id AS curso_id,
         cc.curso,
         cc.nivel,
         r.id AS rama_id,
         r.nombre AS rama
       FROM centro_cursos cc
       LEFT JOIN curso_asignaturas ca ON ca.curso_id = cc.id
       LEFT JOIN ramas r ON r.id = ca.rama_id
       WHERE cc.centro_id = ?
       ORDER BY cc.nivel, cc.curso, r.nombre`,
      [centroId],
    );

    const grupos = new Map<string, any>();

    for (const c of cursos) {
      const key = `${c.curso_id}-${c.rama_id ?? "sin-rama"}`;
      if (!grupos.has(key)) {
        grupos.set(key, {
          cursoId: c.curso_id,
          ramaId: c.rama_id,
          curso: c.curso,
          nivel: c.nivel,
          rama: c.rama,
          etiqueta: c.rama ? `${c.curso} - ${c.rama}` : c.curso,
        });
      }
    }

    const [alumnosPorCurso]: any = await db.query(
      `SELECT curso_id, rama_id, COUNT(*) AS total
       FROM centro_usuarios
       WHERE centro_id = ? AND rol_en_centro = 'alumno'
       GROUP BY curso_id, rama_id`,
      [centroId],
    );

    const totalesMap = new Map<string, number>();
    for (const a of alumnosPorCurso) {
      totalesMap.set(`${a.curso_id}-${a.rama_id ?? "sin-rama"}`, a.total);
    }

    const resultado = Array.from(grupos.entries()).map(([key, g]) => ({
      ...g,
      totalAlumnos: totalesMap.get(key) ?? 0,
    }));

    res.json(resultado);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los cursos" });
  }
};

export const ObtenerHorarioCurso = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoId } = req.params;
  const centroId = req.query.centroId;
  const ramaId = req.query.ramaId || null;

  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [cursoRows]: any = await db.query(
      `SELECT curso FROM centro_cursos WHERE id = ? AND centro_id = ?`,
      [cursoId, centroId],
    );
    if (cursoRows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    const [ramaRows]: any = ramaId
      ? await db.query(`SELECT nombre FROM ramas WHERE id = ?`, [ramaId])
      : [[]];

    const [clases]: any = await db.query(
      `SELECT
         hc.id, hc.tipo, hc.dia_semana, hc.hora_inicio, hc.hora_fin,
         a.nombre AS asignatura,
         u.nombre AS profesor_nombre,
         u.apellidos AS profesor_apellidos
       FROM horario_clases hc
       JOIN curso_asignaturas ca ON ca.id = hc.curso_asignatura_id
       JOIN asignaturas a ON a.id = ca.asignatura_id
       LEFT JOIN profesor_asignaturas pa ON pa.curso_asignatura_id = ca.id
       LEFT JOIN centro_usuarios cu ON cu.id = pa.centro_usuario_id
       LEFT JOIN usuarios u ON u.id = cu.user_id
       WHERE ca.curso_id = ?
       AND (ca.rama_id IS NULL OR ca.rama_id = ?)
       ORDER BY hc.dia_semana, hc.hora_inicio`,
      [cursoId, ramaId],
    );

    const [descansos]: any = await db.query(
      `SELECT id, nombre, hora_inicio, hora_fin FROM horario_descansos WHERE centro_id = ?`,
      [centroId],
    );

    res.json({
      curso: ramaRows[0]?.nombre
        ? `${cursoRows[0].curso} - ${ramaRows[0].nombre}`
        : cursoRows[0].curso,
      clases: clases.map((c: any) => ({
        id: c.id,
        tipo: c.tipo,
        diaSemana: c.dia_semana,
        horaInicio: c.hora_inicio,
        horaFin: c.hora_fin,
        titulo: c.tipo === "tutoria" ? "Tutoria" : c.asignatura,
        profesor: c.profesor_nombre
          ? `${c.profesor_nombre} ${c.profesor_apellidos ?? ""}`.trim()
          : "Sin asignar",
      })),
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
