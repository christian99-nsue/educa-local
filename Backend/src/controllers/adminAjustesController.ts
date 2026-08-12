import { db } from "../config/db";
import supabase from "../config/supabaseConfig";

const verificarAdmin = async (usuarioId: number, centroId: any) => {
  const [rows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'admin'`,
    [usuarioId, centroId],
  );
  return rows.length > 0;
};

export const ObtenerAjustes = async (req: any, res: any) => {
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

    const [centroRows]: any = await db.query(
      `SELECT nombre, codigo, email, sitio_web, telefono, direccion, director, logo_url FROM centros WHERE id = ?`,
      [centroId],
    );
    if (centroRows.length === 0) {
      return res.status(404).json({ error: "Centro no encontrado" });
    }

    const [configRows]: any = await db.query(
      `SELECT ano_academico, inicio_ano_academico FROM centro_configuracion WHERE centro_id = ?`,
      [centroId],
    );

    const [adminRows]: any = await db.query(
      `SELECT u.nombre, u.apellidos, u.email, u.telefono, u.code, u.foto_url
       FROM centro_usuarios cu
       JOIN usuarios u ON u.id = cu.user_id
       WHERE cu.user_id = ? AND cu.centro_id = ? AND cu.rol_en_centro = 'admin'`,
      [usuarioId, centroId],
    );

    res.json({
      centro: {
        nombre: centroRows[0].nombre,
        codigo: centroRows[0].codigo,
        email: centroRows[0].email,
        sitioWeb: centroRows[0].sitio_web,
        telefono: centroRows[0].telefono,
        direccion: centroRows[0].direccion,
        director: centroRows[0].director,
        logoUrl: centroRows[0].logo_url,
        anoAcademico: configRows[0]?.ano_academico ?? null,
        inicioAnoAcademico: configRows[0]?.inicio_ano_academico ?? null,
      },
      admin: adminRows[0]
        ? {
            nombre: adminRows[0].nombre,
            apellidos: adminRows[0].apellidos,
            codigo: adminRows[0].code,
            telefono: adminRows[0].telefono,
            email: adminRows[0].email,
            fotoUrl: adminRows[0].foto_url,
          }
        : null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los ajustes" });
  }
};

export const ActualizarCentro = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const {
    centroId,
    nombre,
    email,
    sitioWeb,
    telefono,
    direccion,
    director,
    anoAcademico,
    inicioAnoAcademico,
  } = req.body;

  if (!centroId || !nombre) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    let logoUrl: string | undefined;

    if (req.file) {
      const nombreLimpio = req.file.originalname
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const nombreUnico = `${centroId}-${Date.now()}-${nombreLimpio}`;

      const { error: uploadError } = await supabase.storage
        .from("logos-centros")
        .upload(nombreUnico, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) {
        console.log(uploadError);
        return res.status(500).json({ error: "Error al subir el logo" });
      }

      const { data: urlData } = supabase.storage
        .from("logos-centros")
        .getPublicUrl(nombreUnico);
      logoUrl = urlData.publicUrl;
    }

    if (logoUrl) {
      await db.query(
        `UPDATE centros SET nombre = ?, email = ?, sitio_web = ?, telefono = ?, direccion = ?, director = ?, logo_url = ? WHERE id = ?`,
        [
          nombre,
          email || null,
          sitioWeb || null,
          telefono || null,
          direccion || null,
          director || null,
          logoUrl,
          centroId,
        ],
      );
    } else {
      await db.query(
        `UPDATE centros SET nombre = ?, email = ?, sitio_web = ?, telefono = ?, direccion = ?, director = ? WHERE id = ?`,
        [
          nombre,
          email || null,
          sitioWeb || null,
          telefono || null,
          direccion || null,
          director || null,
          centroId,
        ],
      );
    }

    if (anoAcademico) {
      await db.query(
        `INSERT INTO centro_configuracion (centro_id, ano_academico, inicio_ano_academico)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE ano_academico = VALUES(ano_academico), inicio_ano_academico = VALUES(inicio_ano_academico)`,
        [centroId, anoAcademico, inicioAnoAcademico],
      );
    }

    res.json({ mensaje: "Centro actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el centro" });
  }
};

export const ActualizarAdmin = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { centroId, nombre, apellidos, telefono, email } = req.body;

  if (!centroId || !nombre || !email) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

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
        `UPDATE usuarios SET nombre = ?, apellidos = ?, telefono = ?, email = ?, foto_url = ? WHERE id = ?`,
        [
          nombre,
          apellidos || null,
          telefono || null,
          email || null,
          fotoUrl,
          usuarioId,
        ],
      );
    } else {
      await db.query(
        `UPDATE usuarios SET nombre = ?, apellidos = ?, telefono = ?, email = ? WHERE id = ?`,
        [nombre, apellidos || null, telefono || null, email, usuarioId],
      );
    }

    res.json({ mensaje: "Administrador actualizado correctamente", fotoUrl });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el administrador" });
  }
};
