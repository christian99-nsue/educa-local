import { db } from "../config/db";

const verificarPermisoTarea = async (
  usuarioId: number,
  centroId: any,
  tareaId: any,
) => {
  const [tareaRows]: any = await db.query(
    `SELECT curso_asignatura_id FROM tareas WHERE id = ?`,
    [tareaId],
  );
  if (tareaRows.length === 0) return null;

  const [centroUsuarioRows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ?`,
    [usuarioId, centroId],
  );
  if (centroUsuarioRows.length === 0) return null;
  const centroUsuarioId = centroUsuarioRows[0].id;

  const [permisoRows]: any = await db.query(
    `SELECT id FROM profesor_asignaturas WHERE centro_usuario_id = ? AND curso_asignatura_id = ?`,
    [centroUsuarioId, tareaRows[0].curso_asignatura_id],
  );
  if (permisoRows.length === 0) return null;

  return true;
};

export const ObtenerEntrega = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { tareaId, alumnoId } = req.params;
  const centroId = req.query.centroId;

  if (!centroId) {
    return res.status(400).json({ error: "centroId es requerido" });
  }

  try {
    const tienePermiso = await verificarPermisoTarea(
      usuarioId,
      centroId,
      tareaId,
    );
    if (!tienePermiso) {
      return res
        .status(403)
        .json({ error: "No tienes permiso sobre esta tarea" });
    }

    const [rows]: any = await db.query(
      `SELECT
         u.id, u.nombre, u.apellidos, u.foto_url,
         te.estado, te.fecha_entrega_real, te.nota, te.comentario,
         te.archivo_url, te.archivo_nombre, te.archivo_tamano
       FROM usuarios u
       LEFT JOIN tarea_entregas te ON te.tarea_id = ? AND te.usuario_id = u.id
       WHERE u.id = ?`,
      [tareaId, alumnoId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    const r = rows[0];
    res.json({
      id: r.id,
      nombre: r.nombre,
      apellidos: r.apellidos,
      fotoUrl: r.foto_url,
      estado: r.estado || "pendiente",
      fechaEntregaReal: r.fecha_entrega_real,
      nota: r.nota,
      comentario: r.comentario,
      archivoUrl: r.archivo_url,
      archivoNombre: r.archivo_nombre,
      archivoTamano: r.archivo_tamano,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener la entrega" });
  }
};

export const GuardarCalificacion = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { tareaId, alumnoId } = req.params;
  const { centroId, nota, comentario } = req.body;

  if (!centroId || nota === undefined || nota === null) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    const tienePermiso = await verificarPermisoTarea(
      usuarioId,
      centroId,
      tareaId,
    );
    if (!tienePermiso) {
      return res
        .status(403)
        .json({ error: "No tienes permiso sobre esta tarea" });
    }

    await db.query(
      `INSERT INTO tarea_entregas (tarea_id, usuario_id, estado, nota, comentario)
       VALUES (?, ?, 'calificada', ?, ?)
       ON DUPLICATE KEY UPDATE estado = 'calificada', nota = VALUES(nota), comentario = VALUES(comentario)`,
      [tareaId, alumnoId, nota, comentario || null],
    );

    res.json({ mensaje: "Calificacion guardada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al guardar la calificacion" });
  }
};
