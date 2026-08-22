import { db } from "../config/db";

const verificarAdmin = async (usuarioId: number, centroId: any) => {
  const [rows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'admin'`,
    [usuarioId, centroId],
  );
  return rows.length > 0;
};

export const ObtenerProfesores = async (req: any, res: any) => {
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
      `SELECT
         u.id, u.nombre, u.apellidos, u.email, u.code, u.foto_url,
         a.nombre AS asignatura,
         cc.id AS curso_id, cc.curso, cc.nivel
       FROM centro_usuarios cu
       JOIN usuarios u ON u.id = cu.user_id
       LEFT JOIN profesor_asignaturas pa ON pa.centro_usuario_id = cu.id
       LEFT JOIN curso_asignaturas ca ON ca.id = pa.curso_asignatura_id
       LEFT JOIN asignaturas a ON a.id = ca.asignatura_id
       LEFT JOIN centro_cursos cc ON cc.id = ca.curso_id
       WHERE cu.centro_id = ? AND cu.rol_en_centro = 'profesor'
       ORDER BY u.apellidos, u.nombre`,
      [centroId],
    );

    const profesoresMap = new Map<number, any>();

    for (const r of rows) {
      if (!profesoresMap.has(r.id)) {
        profesoresMap.set(r.id, {
          id: r.id,
          nombre: r.nombre,
          apellidos: r.apellidos,
          email: r.email,
          codigo: r.code,
          fotoUrl: r.foto_url,
          asignaturas: new Set<string>(),
          cursos: new Map<number, string>(),
          niveles: new Set<string>(),
        });
      }
      const p = profesoresMap.get(r.id);
      if (r.asignatura) p.asignaturas.add(r.asignatura);
      if (r.curso_id) p.cursos.set(r.curso_id, r.curso);
      if (r.nivel) p.niveles.add(r.nivel);
    }

    const profesores = Array.from(profesoresMap.values()).map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      apellidos: p.apellidos,
      email: p.email,
      codigo: p.codigo,
      fotoUrl: p.fotoUrl,
      asignaturas: Array.from(p.asignaturas),
      cursos: Array.from(p.cursos.values()),
      cursosIds: Array.from(p.cursos.keys()),
      niveles: Array.from(p.niveles),
    }));

    res.json(profesores);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los profesores" });
  }
};

export const ObtenerDetalleProfesor = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { profesorId } = req.params;
  const centroId = req.query.centroId;

  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [userRows]: any = await db.query(
      `SELECT u.id, u.nombre, u.apellidos, u.email, u.telefono, u.code, u.foto_url
       FROM centro_usuarios cu
       JOIN usuarios u ON u.id = cu.user_id
       WHERE u.id = ? AND cu.centro_id = ? AND cu.rol_en_centro = 'profesor'`,
      [profesorId, centroId],
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }

    const [asignaturasRows]: any = await db.query(
      `SELECT a.nombre AS asignatura, cc.curso, r.nombre AS rama
       FROM centro_usuarios cu
       JOIN profesor_asignaturas pa ON pa.centro_usuario_id = cu.id
       JOIN curso_asignaturas ca ON ca.id = pa.curso_asignatura_id
       JOIN asignaturas a ON a.id = ca.asignatura_id
       JOIN centro_cursos cc ON cc.id = ca.curso_id
       LEFT JOIN ramas r ON r.id = ca.rama_id
       WHERE cu.user_id = ? AND cu.centro_id = ?`,
      [profesorId, centroId],
    );

    res.json({
      ...userRows[0],
      asignaturas: asignaturasRows.map((a: any) => ({
        asignatura: a.asignatura,
        curso: a.curso,
        rama: a.rama,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener el profesor" });
  }
};

export const EditarProfesor = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { profesorId } = req.params;
  const { centroId, nombre, apellidos, email, telefono, estado } = req.body;

  if (!centroId || !nombre || !email) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    await db.query(
      `UPDATE usuarios SET nombre = ?, apellidos = ?, email = ?, telefono = ? WHERE id = ?`,
      [nombre, apellidos || null, email, telefono || null, profesorId],
    );

    if (estado) {
      await db.query(
        `UPDATE centro_usuarios SET estado = ? WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'profesor'`,
        [estado, profesorId, centroId],
      );
    }

    res.json({ mensaje: "Profesor actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el profesor" });
  }
};

export const EliminarProfesor = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { profesorId } = req.params;
  const centroId = req.query.centroId;

  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [cuRows]: any = await db.query(
      `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'profesor'`,
      [profesorId, centroId],
    );

    if (cuRows.length > 0) {
      await db.query(
        `DELETE FROM profesor_asignaturas WHERE centro_usuario_id = ?`,
        [cuRows[0].id],
      );
    }

    await db.query(
      `DELETE FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'profesor'`,
      [profesorId, centroId],
    );

    res.json({ mensaje: "Profesor eliminado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar el profesor" });
  }
};
