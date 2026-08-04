import { db } from "../config/db";
import supabase from "../config/supabaseConfig";
import { crearNotificacionesMasivas } from "../utils/notificacionesUtils";
import { registrarActividad } from "../utils/actividadUtil";

export const CrearTarea = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const {
    curso_asignatura_id,
    titulo,
    descripcion,
    instrucciones,
    fecha_entrega,
    centroId,
  } = req.body;

  if (!curso_asignatura_id || !titulo || !fecha_entrega || !centroId) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
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
      [centroUsuarioId, curso_asignatura_id],
    );

    if (permisoRows.length === 0) {
      return res.status(403).json({
        error: "No tienes permiso para crear tareas en esta asignatura",
      });
    }

    let archivoUrl = null;
    let archivoNombre = null;

    if (req.file) {
      const extension = req.file.originalname.split(".").pop() || "";
      const nombreBase = req.file.originalname
        .replace(/\.[^/.]+$/, "") // quita la extensión
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quita tildes/diacríticos
        .trim()
        .replace(/\s+/g, "_") // espacios -> guion bajo
        .replace(/[^a-zA-Z0-9-_]/g, ""); // quita cualquier otro caracter no seguro

      const nombreUnico = `${Date.now()}-${nombreBase}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("tareas")
        .upload(nombreUnico, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) {
        console.log(uploadError);
        return res.status(500).json({ error: "Error al subir el archivo" });
      }

      const { data: urlData } = supabase.storage
        .from("tareas")
        .getPublicUrl(nombreUnico);

      archivoUrl = urlData.publicUrl;
      archivoNombre = req.file.originalname;
    }

    const [result]: any = await db.query(
      `INSERT INTO tareas (titulo, descripcion, instrucciones, curso_asignatura_id, fecha_entrega, archivo_url, archivo_nombre)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        descripcion || null,
        instrucciones || null,
        curso_asignatura_id,
        fecha_entrega,
        archivoUrl,
        archivoNombre,
      ],
    );

    const [infoRows]: any = await db.query(
      `SELECT
        u.nombre AS profesor_nombre,
        u.apellidos AS profesor_apellidos,
        cc.curso
        FROM curso_asignaturas ca
        JOIN centro_cursos cc ON cc.id = ca.curso_id
        JOIN profesor_asignaturas pa ON pa.curso_asignatura_id = ca.id
        JOIN centro_usuarios cu ON cu.id = pa.centro_usuario_id
        JOIN usuarios u ON u.id = cu.user_id
        WHERE ca.id = ?`,
      [curso_asignatura_id],
    );

    const nombreProfesor = infoRows[0]
      ? `${infoRows[0].profesor_nombre} ${infoRows[0].profesor_apellidos ?? ""}`.trim()
      : "Profesor";

    const curso = infoRows[0]?.curso ?? "su curso";

    await registrarActividad(
      centroId,
      "tarea_publicada",
      "Nueva tarea publicada",
      `El profesor ${nombreProfesor} publico una nueva tarea en ${curso}`,
    );

    const [alumnosRows]: any = await db.query(
      `SELECT cu.user_id
   FROM curso_asignaturas ca
   JOIN centro_usuarios cu ON cu.curso_id = ca.curso_id
     AND cu.centro_id = ?
     AND cu.rol_en_centro = 'alumno'
     AND (ca.rama_id IS NULL OR cu.rama_id = ca.rama_id)
   WHERE ca.id = ?`,
      [centroId, curso_asignatura_id],
    );

    const [asigRows]: any = await db.query(
      `SELECT a.nombre FROM curso_asignaturas ca JOIN asignaturas a ON a.id = ca.asignatura_id WHERE ca.id = ?`,
      [curso_asignatura_id],
    );

    crearNotificacionesMasivas(
      alumnosRows.map((a: any) => a.user_id),
      {
        tipo: "tarea_publicada",
        titulo: "Nueva tarea publicada",
        mensaje: `Se ha publicado la tarea "${titulo}" en ${asigRows[0]?.nombre}. Fecha limite: ${fecha_entrega}.`,
        enlace: `${process.env.FRONTEND_URL}/alumno/tareas/${result.insertId}`,
      },
    );

    res
      .status(201)
      .json({ id: result.insertId, mensaje: "Tarea creada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear la tarea" });
  }
};
