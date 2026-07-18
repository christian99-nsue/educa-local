import { db } from "../config/db";
import supabase from "../config/supabaseConfig";

export const ObtenerPerfilProfesor = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  try {
    const [rows]: any = await db.query(
      `SELECT nombre, apellidos, email, telefono, foto_url FROM usuarios WHERE id = ?`,
      [usuarioId],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
};

export const ActualizarPerfilProfesor = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { nombre, apellidos, email, telefono } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ error: "Nombre y email son requeridos" });
  }

  try {
    let fotoUrl: string | undefined;

    if (req.file) {
      const nombreLimpio = req.file.originalname
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const nombreUnico = `${usuarioId}-${Date.now()}-${nombreLimpio}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(nombreUnico, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) {
        console.log(uploadError);
        return res.status(500).json({ error: "Error al subir la foto" });
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(nombreUnico);

      fotoUrl = urlData.publicUrl;
    }

    if (fotoUrl) {
      await db.query(
        `UPDATE usuarios SET nombre = ?, apellidos = ?, email = ?, telefono = ?, foto_url = ? WHERE id = ?`,
        [
          nombre,
          apellidos || null,
          email,
          telefono || null,
          fotoUrl,
          usuarioId,
        ],
      );
    } else {
      await db.query(
        `UPDATE usuarios SET nombre = ?, apellidos = ?, email = ?, telefono = ? WHERE id = ?`,
        [nombre, apellidos || null, email, telefono || null, usuarioId],
      );
    }

    const [rows]: any = await db.query(
      `SELECT nombre, apellidos, email, telefono, foto_url FROM usuarios WHERE id = ?`,
      [usuarioId],
    );

    res.json(rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
};
