import { db } from "../../config/db";

const verificarAdmin = async (usuarioId: number, centroId: any) => {
  const [rows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'admin'`,
    [usuarioId, centroId],
  );
  return rows.length > 0;
};

export const ObtenerProfesoresParaTutor = async (req: any, res: any) => {
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
      `SELECT u.id, u.nombre, u.apellidos
       FROM centro_usuarios cu
       JOIN usuarios u ON u.id = cu.user_id
       WHERE cu.centro_id = ? AND cu.rol_en_centro = 'profesor'
       ORDER BY u.nombre`,
      [centroId],
    );

    res.json(
      rows.map((r: any) => ({
        id: r.id,
        nombre: `${r.nombre} ${r.apellidos ?? ""}`.trim(),
      })),
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los profesores" });
  }
};

export const ActualizarInformacionCurso = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoId } = req.params;
  const { centroId, codigo, descripcion, estado, tutorId } = req.body;

  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    await db.query(
      `UPDATE centro_cursos SET codigo = ?, descripcion = ?, estado = ?, tutor_id = ? WHERE id = ? AND centro_id = ?`,
      [
        codigo || null,
        descripcion || null,
        estado || "activo",
        tutorId || null,
        cursoId,
        centroId,
      ],
    );

    res.json({ mensaje: "Curso actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el curso" });
  }
};

export const ObtenerGruposCurso = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoId } = req.params;
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
      `SELECT curso_base, nivel, rama_id FROM centro_cursos WHERE id = ? AND centro_id = ?`,
      [cursoId, centroId],
    );
    if (cursoRows.length === 0)
      return res.status(404).json({ error: "Curso no encontrado" });
    const { curso_base, nivel, rama_id } = cursoRows[0];

    const [grupos]: any = await db.query(
      `SELECT cc.id, cc.grupo, cc.estado, cc.tutor_id,
              u.nombre AS tutor_nombre, u.apellidos AS tutor_apellidos,
              (SELECT COUNT(*) FROM centro_usuarios cu WHERE cu.curso_id = cc.id AND cu.centro_id = ? AND cu.rol_en_centro = 'alumno') AS total_alumnos
       FROM centro_cursos cc
       LEFT JOIN usuarios u ON u.id = cc.tutor_id
       WHERE cc.centro_id = ? AND cc.curso_base = ? AND cc.nivel = ?
       AND (cc.rama_id <=> ?)
       ORDER BY cc.grupo`,
      [centroId, centroId, curso_base, nivel, rama_id],
    );

    res.json(
      grupos.map((g: any) => ({
        id: g.id,
        grupo: g.grupo,
        estado: g.estado ?? "activo",
        tutorId: g.tutor_id,
        tutor: g.tutor_nombre
          ? `${g.tutor_nombre} ${g.tutor_apellidos ?? ""}`.trim()
          : null,
        totalAlumnos: g.total_alumnos,
      })),
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los grupos" });
  }
};

export const CrearGrupo = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoId } = req.params;
  const { centroId, grupo, tutorId } = req.body;
  if (!centroId || !grupo)
    return res.status(400).json({ error: "Faltan datos requeridos" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [cursoRows]: any = await db.query(
      `SELECT curso_base, curso, nivel, rama_id FROM centro_cursos WHERE id = ? AND centro_id = ?`,
      [cursoId, centroId],
    );
    if (cursoRows.length === 0)
      return res.status(404).json({ error: "Curso no encontrado" });
    const c = cursoRows[0];

    const [ramaRows]: any = c.rama_id
      ? await db.query(`SELECT nombre FROM ramas WHERE id = ?`, [c.rama_id])
      : [[]];
    let nombreCompleto = c.curso_base;
    if (ramaRows[0]?.nombre) nombreCompleto += ` - ${ramaRows[0].nombre}`;
    nombreCompleto += ` - Grupo ${grupo}`;

    const [existe]: any = await db.query(
      `SELECT id FROM centro_cursos WHERE centro_id = ? AND curso = ?`,
      [centroId, nombreCompleto],
    );
    if (existe.length > 0) {
      return res
        .status(409)
        .json({ error: "Ya existe un grupo con ese nombre en este curso" });
    }

    const [result]: any = await db.query(
      `INSERT INTO centro_cursos (centro_id, curso, curso_base, nivel, grupo, rama_id, tutor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        centroId,
        nombreCompleto,
        c.curso_base,
        c.nivel,
        grupo,
        c.rama_id,
        tutorId || null,
      ],
    );

    res
      .status(201)
      .json({ id: result.insertId, mensaje: "Grupo creado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear el grupo" });
  }
};

export const EditarGrupo = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { grupoId } = req.params;
  const { centroId, tutorId, estado } = req.body;
  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    await db.query(
      `UPDATE centro_cursos SET tutor_id = ?, estado = ? WHERE id = ? AND centro_id = ?`,
      [tutorId || null, estado || "activo", grupoId, centroId],
    );

    res.json({ mensaje: "Grupo actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el grupo" });
  }
};

export const EliminarGrupo = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { grupoId } = req.params;
  const centroId = req.query.centroId;
  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [alumnosRows]: any = await db.query(
      `SELECT COUNT(*) AS total FROM centro_usuarios WHERE curso_id = ? AND centro_id = ?`,
      [grupoId, centroId],
    );
    if (alumnosRows[0].total > 0) {
      return res
        .status(409)
        .json({
          error: "No puedes eliminar un grupo que tiene alumnos matriculados",
        });
    }

    await db.query(`DELETE FROM centro_cursos WHERE id = ? AND centro_id = ?`, [
      grupoId,
      centroId,
    ]);
    res.json({ mensaje: "Grupo eliminado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar el grupo" });
  }
};
