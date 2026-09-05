import { db } from "../../config/db";
import { getIpDeRequest, registrarActividad } from "../../utils/actividadUtil";

const verificarAdmin = async (usuarioId: number, centroId: any) => {
  const [rows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'admin'`,
    [usuarioId, centroId],
  );
  return rows.length > 0;
};

export const ObtenerAlumnos = async (req: any, res: any) => {
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

    const [alumnos]: any = await db.query(
      `SELECT
         u.id, u.nombre, u.apellidos, u.email, u.code, u.foto_url,
         cc.id AS curso_id, cc.curso, cc.nivel,
         r.id AS rama_id, r.nombre AS rama
       FROM centro_usuarios cu
       JOIN usuarios u ON u.id = cu.user_id
       LEFT JOIN centro_cursos cc ON cc.id = cu.curso_id
       LEFT JOIN ramas r ON r.id = cu.rama_id
       WHERE cu.centro_id = ? AND cu.rol_en_centro = 'alumno'
       ORDER BY u.apellidos, u.nombre`,
      [centroId],
    );

    res.json(
      alumnos.map((a: any) => ({
        id: a.id,
        nombre: a.nombre,
        apellidos: a.apellidos,
        email: a.email,
        codigo: a.code,
        fotoUrl: a.foto_url,
        cursoId: a.curso_id,
        curso: a.curso,
        nivel: a.nivel,
        ramaId: a.rama_id,
        rama: a.rama,
      })),
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los alumnos" });
  }
};

export const ObtenerDetalleAlumno = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { alumnoId } = req.params;
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
         u.id, u.nombre, u.apellidos, u.email, u.telefono, u.code, u.foto_url,
         cc.curso, cc.nivel, r.nombre AS rama
       FROM centro_usuarios cu
       JOIN usuarios u ON u.id = cu.user_id
       LEFT JOIN centro_cursos cc ON cc.id = cu.curso_id
       LEFT JOIN ramas r ON r.id = cu.rama_id
       WHERE u.id = ? AND cu.centro_id = ? AND cu.rol_en_centro = 'alumno'`,
      [alumnoId, centroId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const r = rows[0];
    res.json({
      id: r.id,
      nombre: r.nombre,
      apellidos: r.apellidos,
      email: r.email,
      telefono: r.telefono,
      codigo: r.code,
      fotoUrl: r.foto_url,
      curso: r.curso,
      rama: r.rama,
      nivel: r.nivel,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener el alumno" });
  }
};

export const EditarAlumno = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { alumnoId } = req.params;
  const { centroId, nombre, apellidos, email, telefono, cursoId, ramaId } =
    req.body;

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
      [nombre, apellidos || null, email, telefono || null, alumnoId],
    );

    await db.query(
      `UPDATE centro_usuarios SET curso_id = ?, rama_id = ? WHERE user_id = ? AND centro_id = ?`,
      [cursoId || null, ramaId || null, alumnoId, centroId],
    );

    res.json({ mensaje: "Alumno actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el alumno" });
  }
};

export const EliminarAlumno = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { alumnoId } = req.params;
  const centroId = req.query.centroId;

  if (!centroId) {
    return res.status(400).json({ error: "centroId es requerido" });
  }

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    // Obtener los datos del alumno antes de eliminar su relación
    const [alumnos]: any = await db.query(
      `SELECT u.nombre, u.apellidos
       FROM centro_usuarios cu
       JOIN usuarios u ON u.id = cu.user_id
       WHERE cu.user_id = ?
         AND cu.centro_id = ?
         AND cu.rol_en_centro = 'alumno'`,
      [alumnoId, centroId],
    );

    if (alumnos.length === 0) {
      return res.status(404).json({
        error: "Alumno no encontrado en este centro",
      });
    }

    const alumno = alumnos[0];

    // Eliminar al alumno del centro
    await db.query(
      `DELETE FROM centro_usuarios
       WHERE user_id = ?
         AND centro_id = ?
         AND rol_en_centro = 'alumno'`,
      [alumnoId, centroId],
    );

    // Registrar actividad
    await registrarActividad({
      centroId,
      usuarioId: req.user.id,
      tipo: "alumno_removido",
      titulo: "Alumno eliminado",
      descripcion:
        `${alumno.nombre} ${alumno.apellidos ?? ""} ha sido eliminado como alumno`.trim(),
      ip: getIpDeRequest(req),
    });

    res.json({
      mensaje: "Alumno eliminado correctamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error al eliminar el alumno",
    });
  }
};
