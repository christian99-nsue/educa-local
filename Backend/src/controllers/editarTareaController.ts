import { db } from "../config/db";
import supabase from "../config/supabaseConfig";

export const EditarTarea = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { tareaId } = req.params;
  const { centroId, titulo, descripcion, instrucciones, fecha_entrega } =
    req.body;

  if (!centroId || !titulo || !fecha_entrega) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    const [tareaRows]: any = await db.query(
      `SELECT curso_asignatura_id FROM tareas WHERE id = ?`,
      [tareaId],
    );
    if (tareaRows.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

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
      [centroUsuarioId, tareaRows[0].curso_asignatura_id],
    );
    if (permisoRows.length === 0) {
      return res
        .status(403)
        .json({ error: "No tienes permiso sobre esta tarea" });
    }

    let archivoUrl: string | undefined;
    let archivoNombre: string | undefined;

    if (req.file) {
      const nombreLimpio = req.file.originalname
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const nombreUnico = `${Date.now()}-${nombreLimpio}`;

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

    if (archivoUrl) {
      await db.query(
        `UPDATE tareas SET titulo = ?, descripcion = ?, instrucciones = ?, fecha_entrega = ?, archivo_url = ?, archivo_nombre = ? WHERE id = ?`,
        [
          titulo,
          descripcion || null,
          instrucciones || null,
          fecha_entrega,
          archivoUrl,
          archivoNombre,
          tareaId,
        ],
      );
    } else {
      await db.query(
        `UPDATE tareas SET titulo = ?, descripcion = ?, instrucciones = ?, fecha_entrega = ? WHERE id = ?`,
        [
          titulo,
          descripcion || null,
          instrucciones || null,
          fecha_entrega,
          tareaId,
        ],
      );
    }

    res.json({ mensaje: "Tarea actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar la tarea" });
  }
};
