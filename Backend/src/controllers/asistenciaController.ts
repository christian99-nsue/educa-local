import { db } from "../config/db";

export const AlumnosAsistencia = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { centroId, cursoAsignaturaId, fecha } = req.query;

  if (!centroId || !cursoAsignaturaId || !fecha) {
    return res.status(400).json({ error: "Faltan parametros requeridos" });
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

    const [permisoRows]: any = await db.query(
      `SELECT id FROM profesor_asignaturas WHERE centro_usuario_id = ? AND curso_asignatura_id = ?`,
      [centroUsuarioId, cursoAsignaturaId],
    );
    if (permisoRows.length === 0) {
      return res
        .status(403)
        .json({ error: "No tienes permiso sobre esta asignatura" });
    }

    const [caRows]: any = await db.query(
      `SELECT curso_id, rama_id FROM curso_asignaturas WHERE id = ?`,
      [cursoAsignaturaId],
    );
    if (caRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Asignatura de curso no encontrada" });
    }
    const { curso_id, rama_id } = caRows[0];

    const [alumnos]: any = await db.query(
      `SELECT u.id, u.nombre, u.apellidos,
              a.estado, a.observaciones
       FROM centro_usuarios cu
       JOIN usuarios u ON u.id = cu.user_id
       LEFT JOIN asistencias a
         ON a.usuario_id = u.id
         AND a.curso_asignatura_id = ?
         AND a.fecha = ?
       WHERE cu.curso_id = ?
         AND cu.centro_id = ?
         AND cu.rol_en_centro = 'alumno'
         AND (? IS NULL OR cu.rama_id = ?)
       ORDER BY u.apellidos, u.nombre`,
      [cursoAsignaturaId, fecha, curso_id, centroId, rama_id, rama_id],
    );

    const alumnosConEstado = alumnos.map((al: any) => ({
      id: al.id,
      nombre: al.nombre,
      apellidos: al.apellidos,
      estado: al.estado || "presente",
      observaciones: al.observaciones || "",
    }));

    res.json(alumnosConEstado);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los alumnos" });
  }
};

export const GuardarAsistencia = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { centroId, cursoAsignaturaId, fecha, registros } = req.body;

  if (!centroId || !cursoAsignaturaId || !fecha || !Array.isArray(registros)) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
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

    const [permisoRows]: any = await db.query(
      `SELECT id FROM profesor_asignaturas WHERE centro_usuario_id = ? AND curso_asignatura_id = ?`,
      [centroUsuarioId, cursoAsignaturaId],
    );
    if (permisoRows.length === 0) {
      return res
        .status(403)
        .json({ error: "No tienes permiso sobre esta asignatura" });
    }

    for (const registro of registros) {
      await db.query(
        `INSERT INTO asistencias (curso_asignatura_id, usuario_id, fecha, estado, observaciones)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE estado = VALUES(estado), observaciones = VALUES(observaciones)`,
        [
          cursoAsignaturaId,
          registro.usuarioId,
          fecha,
          registro.estado,
          registro.observaciones || null,
        ],
      );
    }

    res.json({ mensaje: "Asistencia guardada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al guardar la asistencia" });
  }
};
