import { db } from "../config/db";
import supabase from "../config/supabaseConfig";
import {
  notaANumero,
  formatearPromedioDisplay,
  getEstado,
  estadoColor,
  SistemaCalificacion,
} from "../utils/calificacionesUtils";

export const ObtenerDetalleTareaAlumno = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { tareaId } = req.params;
  const centroId = req.query.centroId;

  if (!centroId) {
    return res.status(400).json({ error: "centroId es requerido" });
  }

  try {
    const [usuarioRows]: any = await db.query(
      `SELECT curso_id, rama_id FROM centro_usuarios WHERE user_id = ? AND centro_id = ?`,
      [usuarioId, centroId],
    );
    if (usuarioRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Usuario no encontrado en este centro" });
    }
    const { curso_id, rama_id } = usuarioRows[0];

    const [configRows]: any = await db.query(
      `SELECT sistema_calificacion FROM centro_configuracion WHERE centro_id = ?`,
      [centroId],
    );
    const sistemaCalificacion: SistemaCalificacion =
      configRows[0]?.sistema_calificacion ?? "sobre-10";

    const [tareaRows]: any = await db.query(
      `SELECT
         t.id, t.titulo, t.descripcion, t.instrucciones,
         t.fecha_entrega, t.fecha_creacion, t.archivo_url, t.archivo_nombre,
         a.nombre AS asignatura,
         u.nombre AS profesor_nombre,
         u.apellidos AS profesor_apellidos,
         ca.curso_id, ca.rama_id
       FROM tareas t
       JOIN curso_asignaturas ca ON ca.id = t.curso_asignatura_id
       JOIN asignaturas a ON a.id = ca.asignatura_id
       LEFT JOIN profesor_asignaturas pa ON pa.curso_asignatura_id = ca.id
       LEFT JOIN centro_usuarios cu ON cu.id = pa.centro_usuario_id
       LEFT JOIN usuarios u ON u.id = cu.user_id
       WHERE t.id = ?`,
      [tareaId],
    );

    if (tareaRows.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }
    const t = tareaRows[0];

    const coincide =
      t.curso_id === curso_id && (t.rama_id === null || t.rama_id === rama_id);
    if (!coincide) {
      return res.status(403).json({ error: "No tienes acceso a esta tarea" });
    }

    const [entregaRows]: any = await db.query(
      `SELECT estado, fecha_entrega_real, nota, comentario, archivo_url, archivo_nombre, archivo_tamano
       FROM tarea_entregas WHERE tarea_id = ? AND usuario_id = ?`,
      [tareaId, usuarioId],
    );
    const entrega = entregaRows[0];

    let calificacion = null;
    if (entrega?.estado === "calificada" && entrega.nota) {
      const valor = notaANumero(entrega.nota, sistemaCalificacion);
      const nota =
        sistemaCalificacion === "A-F"
          ? entrega.nota.toUpperCase()
          : formatearPromedioDisplay(valor ?? 0, sistemaCalificacion);
      const estado = valor != null ? getEstado(valor) : null;
      calificacion = {
        nota,
        estado,
        color: estado ? estadoColor[estado] : null,
      };
    }

    const vencida = new Date() > new Date(t.fecha_entrega);
    let estadoMostrar = entrega?.estado ?? "pendiente";
    if (estadoMostrar === "pendiente" && vencida) {
      estadoMostrar = "vencida";
    }

    res.json({
      id: t.id,
      titulo: t.titulo,
      descripcion: t.descripcion,
      instrucciones: t.instrucciones,
      fechaCreacion: t.fecha_creacion,
      fechaEntrega: t.fecha_entrega,
      archivoUrl: t.archivo_url,
      archivoNombre: t.archivo_nombre,
      asignatura: t.asignatura,
      profesor: t.profesor_nombre
        ? `Prof. ${t.profesor_nombre} ${t.profesor_apellidos ?? ""}`.trim()
        : "Prof. Por asignar",
      estado: estadoMostrar,
      miEntrega: entrega
        ? {
            fechaEntregaReal: entrega.fecha_entrega_real,
            archivoUrl: entrega.archivo_url,
            archivoNombre: entrega.archivo_nombre,
            archivoTamano: entrega.archivo_tamano,
            comentario: entrega.comentario,
          }
        : null,
      calificacion,
      vencida,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener la tarea" });
  }
};

export const EntregarTarea = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { tareaId } = req.params;
  const { centroId } = req.body;

  if (!centroId || !req.file) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    const [tareaRows]: any = await db.query(
      `SELECT curso_asignatura_id, fecha_entrega FROM tareas WHERE id = ?`,
      [tareaId],
    );
    if (tareaRows.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    const fechaLimite = new Date(tareaRows[0].fecha_entrega);
    if (new Date() > fechaLimite) {
      return res
        .status(403)
        .json({ error: "El pazo de entrega para esta tarea ha vencido" });
    }

    const nombreLimpio = req.file.originalname
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const nombreUnico = `${tareaId}-${usuarioId}-${Date.now()}-${nombreLimpio}`;

    const { error: uploadError } = await supabase.storage
      .from("entregas-alumnos")
      .upload(nombreUnico, req.file.buffer, { contentType: req.file.mimetype });

    if (uploadError) {
      console.log(uploadError);
      return res.status(500).json({ error: "Error al subir el archivo" });
    }

    const { data: urlData } = supabase.storage
      .from("entregas-alumnos")
      .getPublicUrl(nombreUnico);

    await db.query(
      `INSERT INTO tarea_entregas (tarea_id, usuario_id, estado, fecha_entrega_real, archivo_url, archivo_nombre, archivo_tamano)
       VALUES (?, ?, 'entregada', NOW(), ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         estado = 'entregada',
         fecha_entrega_real = NOW(),
         archivo_url = VALUES(archivo_url),
         archivo_nombre = VALUES(archivo_nombre),
         archivo_tamano = VALUES(archivo_tamano)`,
      [
        tareaId,
        usuarioId,
        urlData.publicUrl,
        req.file.originalname,
        req.file.size,
      ],
    );

    res.status(201).json({ mensaje: "Tarea entregada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al entregar la tarea" });
  }
};
