import { db } from "../config/db";

const verificarPermisoTarea = async (
  usuarioId: number,
  centroId: any,
  tareaId: any,
) => {
  const [tareaRows]: any = await db.query(
    `SELECT t.id, t.curso_asignatura_id FROM tareas t WHERE t.id = ?`,
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

  return { cursoAsignaturaId: tareaRows[0].curso_asignatura_id };
};

export const ObtenerDetalleTarea = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { tareaId } = req.params;
  const centroId = req.query.centroId;

  if (!centroId) {
    return res.status(400).json({ error: "centroId es requerido" });
  }

  try {
    const permiso = await verificarPermisoTarea(usuarioId, centroId, tareaId);
    if (!permiso) {
      return res
        .status(403)
        .json({ error: "No tienes permiso sobre esta tarea" });
    }

    const [tareaRows]: any = await db.query(
      `SELECT
         t.id,
         t.titulo,
         t.descripcion,
         t.instrucciones,
         t.fecha_entrega,
         t.fecha_creacion,
         t.archivo_url,
         t.archivo_nombre,
         a.id AS asignatura_id,
         a.nombre AS asignatura,
         cc.curso,
         r.nombre AS rama,
         ca.curso_id,
         ca.rama_id
       FROM tareas t
       JOIN curso_asignaturas ca ON ca.id = t.curso_asignatura_id
       JOIN asignaturas a ON a.id = ca.asignatura_id
       JOIN centro_cursos cc ON cc.id = ca.curso_id
       LEFT JOIN ramas r ON r.id = ca.rama_id
       WHERE t.id = ?`,
      [tareaId],
    );

    if (tareaRows.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    const tarea = tareaRows[0];

    const [alumnos]: any = await db.query(
      `SELECT
         u.id,
         u.nombre,
         u.apellidos,
         u.foto_url,
         te.estado,
         te.fecha_entrega_real,
         te.nota,
         te.archivo_url AS entrega_archivo_url,
         te.archivo_nombre AS entrega_archivo_nombre,
         te.archivo_tamano
       FROM centro_usuarios cu
       JOIN usuarios u ON u.id = cu.user_id
       LEFT JOIN tarea_entregas te ON te.tarea_id = ? AND te.usuario_id = u.id
       WHERE cu.curso_id = ?
         AND cu.centro_id = ?
         AND cu.rol_en_centro = 'alumno'
         AND (? IS NULL OR cu.rama_id = ?)
       ORDER BY u.apellidos, u.nombre`,
      [tareaId, tarea.curso_id, centroId, tarea.rama_id, tarea.rama_id],
    );

    const entregasFormateadas = alumnos.map((al: any) => ({
      id: al.id,
      nombre: al.nombre,
      apellidos: al.apellidos,
      fotoUrl: al.foto_url,
      estado: al.estado || "pendiente",
      fechaEntregaReal: al.fecha_entrega_real,
      nota: al.nota,
      archivoUrl: al.entrega_archivo_url,
      archivoNombre: al.entrega_archivo_nombre,
      archivoTamano: al.archivo_tamano,
    }));

    const entregados = entregasFormateadas.filter(
      (e: any) => e.estado === "entregada" || e.estado === "calificada",
    );
    const pendientes = entregasFormateadas.filter(
      (e: any) => e.estado === "pendiente",
    );

    res.json({
      id: tarea.id,
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      instrucciones: tarea.instrucciones,
      asignaturaId: tarea.asignatura_id,
      fechaCreacion: tarea.fecha_creacion,
      fechaEntrega: tarea.fecha_entrega,
      archivoUrl: tarea.archivo_url,
      archivoNombre: tarea.archivo_nombre,
      asignatura: tarea.asignatura,
      curso: tarea.curso,
      rama: tarea.rama,
      totalAlumnos: entregasFormateadas.length,
      totalEntregados: entregados.length,
      totalPendientes: pendientes.length,
      entregas: entregasFormateadas,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener el detalle de la tarea" });
  }
};
