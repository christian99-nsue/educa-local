import { db } from "../../config/db";

const verificarAdmin = async (usuarioId: number, centroId: any) => {
  const [rows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'admin'`,
    [usuarioId, centroId],
  );
  return rows.length > 0;
};

const DIAS_NOMBRE: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miercoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sabado",
  7: "Domingo",
};

export const ObtenerListaHorarios = async (req: any, res: any) => {
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
      `SELECT cc.id, cc.curso_base, cc.nivel, cc.grupo, r.nombre AS rama
       FROM centro_cursos cc
       LEFT JOIN ramas r ON r.id = cc.rama_id
       WHERE cc.centro_id = ?
       ORDER BY cc.nivel, cc.curso_base, cc.grupo`,
      [centroId],
    );

    const resultado = [];
    for (const c of cursos) {
      const [clases]: any = await db.query(
        `SELECT hc.dia_semana, hc.hora_inicio, hc.hora_fin
         FROM horario_clases hc
         JOIN curso_asignaturas ca ON ca.id = hc.curso_asignatura_id
         WHERE ca.curso_id = ?`,
        [c.id],
      );

      if (clases.length === 0) {
        resultado.push({
          id: c.id,
          nivel: c.nivel,
          cursoBase: c.curso_base,
          rama: c.rama,
          grupo: c.grupo,
          rangoDias: null,
          rangoHoras: null,
          totalClases: 0,
        });
        continue;
      }

      const dias = Array.from(
        new Set(clases.map((cl: any) => cl.dia_semana)),
      ).sort() as number[];
      const horaMin = clases.reduce(
        (min: string, cl: any) => (cl.hora_inicio < min ? cl.hora_inicio : min),
        clases[0].hora_inicio,
      );
      const horaMax = clases.reduce(
        (max: string, cl: any) => (cl.hora_fin > max ? cl.hora_fin : max),
        clases[0].hora_fin,
      );

      resultado.push({
        id: c.id,
        nivel: c.nivel,
        cursoBase: c.curso_base,
        rama: c.rama,
        grupo: c.grupo,
        rangoDias:
          dias.length > 1
            ? `${DIAS_NOMBRE[dias[0]]} - ${DIAS_NOMBRE[dias[dias.length - 1]]}`
            : DIAS_NOMBRE[dias[0]],
        rangoHoras: `${horaMin.slice(0, 5)} - ${horaMax.slice(0, 5)}`,
        totalClases: clases.length,
      });
    }

    res.json(resultado);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los horarios" });
  }
};

export const ObtenerOpcionesContexto = async (req: any, res: any) => {
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
      `SELECT cc.id, cc.curso_base, cc.nivel, cc.grupo, cc.rama_id, r.nombre AS rama
       FROM centro_cursos cc
       LEFT JOIN ramas r ON r.id = cc.rama_id
       WHERE cc.centro_id = ?
       ORDER BY cc.nivel, cc.curso_base, r.nombre, cc.grupo`,
      [centroId],
    );

    res.json(
      cursos.map((c: any) => ({
        id: c.id,
        nivel: c.nivel,
        cursoBase: c.curso_base,
        ramaId: c.rama_id,
        rama: c.rama,
        grupo: c.grupo,
      })),
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener las opciones" });
  }
};

export const ObtenerHorarioContexto = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { centroCursoId } = req.params;
  const centroId = req.query.centroId;
  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [cursoRows]: any = await db.query(
      `SELECT cc.curso_base, cc.grupo, r.nombre AS rama
       FROM centro_cursos cc
       LEFT JOIN ramas r ON r.id = cc.rama_id
       WHERE cc.id = ? AND cc.centro_id = ?`,
      [centroCursoId, centroId],
    );
    if (cursoRows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    const [asignaturas]: any = await db.query(
      `SELECT ca.id AS curso_asignatura_id, a.nombre AS asignatura,
              u.id AS profesor_id, u.nombre AS profesor_nombre, u.apellidos AS profesor_apellidos
       FROM curso_asignaturas ca
       JOIN asignaturas a ON a.id = ca.asignatura_id
       LEFT JOIN profesor_asignaturas pa ON pa.curso_asignatura_id = ca.id
       LEFT JOIN centro_usuarios cu ON cu.id = pa.centro_usuario_id
       LEFT JOIN usuarios u ON u.id = cu.user_id
       WHERE ca.curso_id = ?
       ORDER BY a.nombre`,
      [centroCursoId],
    );

    const [clases]: any = await db.query(
      `SELECT hc.id, hc.dia_semana, hc.hora_inicio, hc.hora_fin,
              a.nombre AS asignatura, ca.id AS curso_asignatura_id,
              u.nombre AS profesor_nombre, u.apellidos AS profesor_apellidos
       FROM horario_clases hc
       JOIN curso_asignaturas ca ON ca.id = hc.curso_asignatura_id
       JOIN asignaturas a ON a.id = ca.asignatura_id
       LEFT JOIN profesor_asignaturas pa ON pa.curso_asignatura_id = ca.id
       LEFT JOIN centro_usuarios cu ON cu.id = pa.centro_usuario_id
       LEFT JOIN usuarios u ON u.id = cu.user_id
       WHERE ca.curso_id = ?
       ORDER BY hc.dia_semana, hc.hora_inicio`,
      [centroCursoId],
    );

    const [descansos]: any = await db.query(
      `SELECT id, nombre, hora_inicio, hora_fin FROM horario_descansos WHERE centro_id = ?`,
      [centroId],
    );

    res.json({
      etiqueta: cursoRows[0].rama
        ? `${cursoRows[0].curso_base} - ${cursoRows[0].rama}${cursoRows[0].grupo ? " - Grupo " + cursoRows[0].grupo : ""}`
        : `${cursoRows[0].curso_base}${cursoRows[0].grupo ? " - Grupo " + cursoRows[0].grupo : ""}`,
      asignaturas: asignaturas.map((a: any) => ({
        cursoAsignaturaId: a.curso_asignatura_id,
        asignatura: a.asignatura,
        profesor: a.profesor_nombre
          ? `${a.profesor_nombre} ${a.profesor_apellidos ?? ""}`.trim()
          : null,
      })),
      clases: clases.map((c: any) => ({
        id: c.id,
        diaSemana: c.dia_semana,
        horaInicio: c.hora_inicio,
        horaFin: c.hora_fin,
        asignatura: c.asignatura,
        cursoAsignaturaId: c.curso_asignatura_id,
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

export const CrearClase = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { centroId, cursoAsignaturaId, diaSemana, horaInicio, horaFin } =
    req.body;

  if (
    !centroId ||
    !cursoAsignaturaId ||
    !diaSemana ||
    !horaInicio ||
    !horaFin
  ) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [result]: any = await db.query(
      `INSERT INTO horario_clases (curso_asignatura_id, tipo, dia_semana, hora_inicio, hora_fin)
       VALUES (?, 'clase', ?, ?, ?)`,
      [cursoAsignaturaId, diaSemana, horaInicio, horaFin],
    );

    res
      .status(201)
      .json({ id: result.insertId, mensaje: "Clase añadida correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al añadir la clase" });
  }
};

export const EditarClase = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { claseId } = req.params;
  const { centroId, cursoAsignaturaId, diaSemana, horaInicio, horaFin } =
    req.body;

  if (
    !centroId ||
    !cursoAsignaturaId ||
    !diaSemana ||
    !horaInicio ||
    !horaFin
  ) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    await db.query(
      `UPDATE horario_clases SET curso_asignatura_id = ?, dia_semana = ?, hora_inicio = ?, hora_fin = ? WHERE id = ?`,
      [cursoAsignaturaId, diaSemana, horaInicio, horaFin, claseId],
    );

    res.json({ mensaje: "Clase actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar la clase" });
  }
};

export const EliminarClase = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { claseId } = req.params;
  const centroId = req.query.centroId;
  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }
    await db.query(`DELETE FROM horario_clases WHERE id = ?`, [claseId]);
    res.json({ mensaje: "Clase eliminada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar la clase" });
  }
};

export const EliminarHorarioCompleto = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { centroCursoId } = req.params;
  const centroId = req.query.centroId;

  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    await db.query(
      `DELETE hc FROM horario_clases hc
       JOIN curso_asignaturas ca ON ca.id = hc.curso_asignatura_id
       WHERE ca.curso_id = ?`,
      [centroCursoId],
    );

    res.json({ mensaje: "Horario eliminado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar el horario" });
  }
};

export const ObtenerDescansos = async (req: any, res: any) => {
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
    const [rows]: any = await db.query(
      `SELECT id, nombre, hora_inicio, hora_fin FROM horario_descansos WHERE centro_id = ? ORDER BY hora_inicio`,
      [centroId],
    );
    res.json(
      rows.map((r: any) => ({
        id: r.id,
        nombre: r.nombre,
        horaInicio: r.hora_inicio,
        horaFin: r.hora_fin,
      })),
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los descansos" });
  }
};

export const CrearDescanso = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { centroId, nombre, horaInicio, horaFin } = req.body;
  if (!centroId || !nombre || !horaInicio || !horaFin) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }
  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }
    const [result]: any = await db.query(
      `INSERT INTO horario_descansos (centro_id, nombre, hora_inicio, hora_fin) VALUES (?, ?, ?, ?)`,
      [centroId, nombre, horaInicio, horaFin],
    );
    res
      .status(201)
      .json({ id: result.insertId, mensaje: "Descanso creado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear el descanso" });
  }
};

export const EliminarDescanso = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { descansoId } = req.params;
  const centroId = req.query.centroId;
  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });
  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }
    await db.query(`DELETE FROM horario_descansos WHERE id = ?`, [descansoId]);
    res.json({ mensaje: "Descanso eliminado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar el descanso" });
  }
};
