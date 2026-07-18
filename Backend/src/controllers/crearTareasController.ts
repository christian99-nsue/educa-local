import { db } from "../config/db";
import supabase from "../config/supabaseConfig";

export const CrearTarea = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { curso_asignatura_id, titulo, descripcion, fecha_entrega, centroId } =
    req.body;

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
      // Saneamos el nombre original antes de usarlo como path de Storage:
      // quitamos tildes/diacríticos, cambiamos espacios por guion bajo y
      // eliminamos cualquier otro caracter que no sea letra, número, "-" o "_".
      // Esto evita paths inválidos en Supabase Storage independientemente
      // de cómo se llame el archivo que suba el usuario.
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
      `INSERT INTO tareas (titulo, descripcion, curso_asignatura_id, fecha_entrega, archivo_url, archivo_nombre)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        descripcion || null,
        curso_asignatura_id,
        fecha_entrega,
        archivoUrl,
        archivoNombre,
      ],
    );

    res
      .status(201)
      .json({ id: result.insertId, mensaje: "Tarea creada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear la tarea" });
  }
};
