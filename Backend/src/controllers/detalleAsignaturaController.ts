import { db } from "../config/db";
import supabase from "../config/supabaseConfig";

const verificarPermiso = async (
  usuarioId: number,
  centroId: any,
  cursoAsignaturaId: any,
) => {
  const [centroUsuarioRows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ?`,
    [usuarioId, centroId],
  );
  if (centroUsuarioRows.length === 0) return null;
  const centroUsuarioId = centroUsuarioRows[0].id;

  const [permisoRows]: any = await db.query(
    `SELECT id FROM profesor_asignaturas WHERE centro_usuario_id = ? AND curso_asignatura_id = ?`,
    [centroUsuarioId, cursoAsignaturaId],
  );

  console.log("DEBUG verificarPermiso:", {
    usuarioId,
    centroId,
    cursoAsignaturaId,
    centroUsuarioId,
    permisoEncontrado: permisoRows.length > 0,
  });

  if (permisoRows.length === 0) return null;

  return { centroUsuarioId, profesorAsignaturaId: permisoRows[0].id };
};

export const ObtenerDetalleAsignatura = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoAsignaturaId } = req.params;
  const centroId = req.query.centroId;

  if (!centroId) {
    return res.status(400).json({ error: "centroId es requerido" });
  }

  try {
    const permiso = await verificarPermiso(
      usuarioId,
      centroId,
      cursoAsignaturaId,
    );
    console.log(`Permiso: ${permiso}`);
    if (!permiso) {
      return res
        .status(403)
        .json({ error: "No tienes permiso sobre esta asignatura" });
    }

    const [rows]: any = await db.query(
      `SELECT
         a.id AS asignatura_id,
         a.nombre AS asignatura,
         a.codigo,
         cc.curso,
         r.nombre AS rama,
         ca.curso_id,
         u.nombre AS profesor_nombre,
         u.apellidos AS profesor_apellidos,
         (
           SELECT COUNT(*)
           FROM centro_usuarios cu2
           WHERE cu2.curso_id = ca.curso_id
             AND cu2.centro_id = ?
             AND (ca.rama_id IS NULL OR cu2.rama_id = ca.rama_id)
             AND cu2.rol_en_centro = 'alumno'
         ) AS total_alumnos
       FROM curso_asignaturas ca
       JOIN asignaturas a ON a.id = ca.asignatura_id
       JOIN centro_cursos cc ON cc.id = ca.curso_id
       LEFT JOIN ramas r ON r.id = ca.rama_id
       JOIN profesor_asignaturas pa ON pa.curso_asignatura_id = ca.id
       JOIN centro_usuarios cu ON cu.id = pa.centro_usuario_id
       JOIN usuarios u ON u.id = cu.user_id
       WHERE ca.id = ? AND pa.id = ?`,
      [centroId, cursoAsignaturaId, permiso.profesorAsignaturaId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Asignatura no encontrada" });
    }

    const [clasesRaw]: any = await db.query(
      `SELECT dia_semana, hora_inicio, hora_fin
       FROM horario_clases
       WHERE profesor_asignatura_id = ? AND tipo = 'clase'
       ORDER BY dia_semana, hora_inicio`,
      [permiso.profesorAsignaturaId],
    );

    const hoy = new Date();
    const diaSemanaHoy = hoy.getDay() === 0 ? 7 : hoy.getDay();

    const proximasClases = clasesRaw
      .map((c: any) => {
        let diasHasta = c.dia_semana - diaSemanaHoy;
        if (diasHasta < 0) diasHasta += 7;
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + diasHasta);
        return { ...c, fecha, diasHasta };
      })
      .sort((a: any, b: any) => a.diasHasta - b.diasHasta)
      .slice(0, 2);

    res.json({
      asignaturaId: rows[0].asignatura_id,
      asignatura: rows[0].asignatura,
      codigo: rows[0].codigo,
      curso: rows[0].curso,
      rama: rows[0].rama,
      profesor:
        `Prof. ${rows[0].profesor_nombre} ${rows[0].profesor_apellidos ?? ""}`.trim(),
      totalAlumnos: rows[0].total_alumnos,
      proximasClases: proximasClases.map((c: any) => ({
        fecha: c.fecha,
        horaInicio: c.hora_inicio,
        horaFin: c.hora_fin,
        aula: c.aula,
      })),
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Error al obtener el detalle de la asignatura" });
  }
};

export const ObtenerMateriales = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoAsignaturaId } = req.params;
  const centroId = req.query.centroId;
  const carpetaId = req.query.carpetaId || null;

  if (!centroId) {
    return res.status(400).json({ error: "centroId es requerido" });
  }

  try {
    const permiso = await verificarPermiso(
      usuarioId,
      centroId,
      cursoAsignaturaId,
    );
    if (!permiso) {
      return res
        .status(403)
        .json({ error: "No tienes permiso sobre esta asignatura" });
    }

    const [carpetas]: any = await db.query(
      `SELECT mc.id, mc.nombre, mc.created_at,
              (SELECT COUNT(*) FROM materiales m WHERE m.carpeta_id = mc.id) AS total_archivos
       FROM material_carpetas mc
       WHERE mc.curso_asignatura_id = ?
       ${carpetaId ? "AND 1 = 0" : ""}
       ORDER BY mc.created_at DESC`,
      [cursoAsignaturaId],
    );

    const [archivos]: any = await db.query(
      `SELECT id, nombre, extension, archivo_url, tamano_bytes, created_at
       FROM materiales
       WHERE curso_asignatura_id = ?
       AND ${carpetaId ? "carpeta_id = ?" : "carpeta_id IS NULL"}
       ORDER BY created_at DESC`,
      carpetaId ? [cursoAsignaturaId, carpetaId] : [cursoAsignaturaId],
    );

    res.json({
      carpetas: carpetas.map((c: any) => ({
        id: c.id,
        tipo: "carpeta",
        nombre: c.nombre,
        totalArchivos: c.total_archivos,
        createdAt: c.created_at,
      })),
      archivos: archivos.map((a: any) => ({
        id: a.id,
        tipo: "archivo",
        nombre: a.nombre,
        extension: a.extension,
        url: a.archivo_url,
        tamanoBytes: a.tamano_bytes,
        createdAt: a.created_at,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los materiales" });
  }
};

export const CrearCarpeta = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoAsignaturaId, nombre, centroId } = req.body;

  if (!cursoAsignaturaId || !nombre || !centroId) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    const permiso = await verificarPermiso(
      usuarioId,
      centroId,
      cursoAsignaturaId,
    );
    if (!permiso) {
      return res
        .status(403)
        .json({ error: "No tienes permiso sobre esta asignatura" });
    }

    const [result]: any = await db.query(
      `INSERT INTO material_carpetas (curso_asignatura_id, nombre) VALUES (?, ?)`,
      [cursoAsignaturaId, nombre],
    );

    res.status(201).json({ id: result.insertId, mensaje: "Carpeta creada" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear la carpeta" });
  }
};

export const SubirMaterial = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoAsignaturaId, carpetaId, centroId } = req.body;

  if (!cursoAsignaturaId || !centroId || !req.file) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    const permiso = await verificarPermiso(
      usuarioId,
      centroId,
      cursoAsignaturaId,
    );
    if (!permiso) {
      return res
        .status(403)
        .json({ error: "No tienes permiso sobre esta asignatura" });
    }

    const nombreOriginal = req.file.originalname;
    const extension = nombreOriginal.split(".").pop()?.toLowerCase() || "";
    const nombreLimpio = nombreOriginal
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const nombreUnico = `${Date.now()}-${nombreLimpio}`;

    const { error: uploadError } = await supabase.storage
      .from("materiales")
      .upload(nombreUnico, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) {
      console.log(uploadError);
      return res.status(500).json({ error: "Error al subir el archivo" });
    }

    const { data: urlData } = supabase.storage
      .from("materiales")
      .getPublicUrl(nombreUnico);

    const [result]: any = await db.query(
      `INSERT INTO materiales (curso_asignatura_id, carpeta_id, nombre, extension, archivo_url, tamano_bytes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        cursoAsignaturaId,
        carpetaId || null,
        nombreOriginal,
        extension,
        urlData.publicUrl,
        req.file.size,
      ],
    );

    res
      .status(201)
      .json({ id: result.insertId, mensaje: "Material subido correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al subir el material" });
  }
};

export const EditarCarpeta = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { carpetaId } = req.params;
  const { nombre, centroId } = req.body;

  if (!nombre || !centroId) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    const [carpetaRows]: any = await db.query(
      `SELECT curso_asignatura_id FROM material_carpetas WHERE id = ?`,
      [carpetaId],
    );
    if (carpetaRows.length === 0) {
      return res.status(404).json({ error: "Carpeta no encontrada" });
    }

    const permiso = await verificarPermiso(
      usuarioId,
      centroId,
      carpetaRows[0].curso_asignatura_id,
    );
    if (!permiso) {
      return res
        .status(403)
        .json({ error: "No tienes permiso sobre esta carpeta" });
    }

    await db.query(`UPDATE material_carpetas SET nombre = ? WHERE id = ?`, [
      nombre,
      carpetaId,
    ]);
    res.json({ mensaje: "Carpeta actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar la carpeta" });
  }
};

export const EliminarCarpeta = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { carpetaId } = req.params;
  const centroId = req.query.centroId;

  if (!centroId) {
    return res.status(400).json({ error: "centroId es requerrido" });
  }

  try {
    const [carpetaRows]: any = await db.query(
      `SELECT curso_asignatura_id FROM material_carpetas WHERE id = ?`,
      [carpetaId],
    );
    if (carpetaRows.length === 0) {
      return res
        .status(404)
        .json({ error: "No tienes permiso sobre esta carpeta" });
    }

    const [archivosDentro]: any = await db.query(
      `SELECT archivo_url FROM materiales WHERE carpeta_id = ?`,
      [carpetaId],
    );

    for (const archivo of archivosDentro) {
      const nombreArchivo = archivo.archivo_url.split("/materiales/"[1]);
      if (nombreArchivo) {
        await supabase.storage.from("materiales").remove([nombreArchivo]);
      }
    }
    await db.query(`DELETE FROM materiales WHERE carpeta_id = ?`, [carpetaId]);
    await db.query(`DELETE FROM material_carpetas WHERE id = ?`, [carpetaId]);

    res.json({ mensaje: "Carpeta eliminada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar la carpeta" });
  }
};

export const EditarArchivo = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { materialId } = req.params;
  const { nombre, centroId } = req.body;

  if (!nombre || !centroId) {
    return res.status(400).json({ error: "Faltan datos requerridos" });
  }

  try {
    const [materialRows]: any = await db.query(
      `SELECT curso_asignatura_id FROM materiales WHERE id = ?`,
      [materialId],
    );

    console.log("DEBUG EditarArchivo materialRows:", materialRows);
    if (materialRows.length === 0) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    const permiso = await verificarPermiso(
      usuarioId,
      centroId,
      materialRows[0].curso_asignatura_id,
    );
    if (!permiso) {
      return res
        .status(403)
        .json({ error: "No tienes permiso sobre este archivo" });
    }

    await db.query(`UPDATE materiales SET nombre = ? WHERE id = ?`, [
      nombre,
      materialId,
    ]);
    res.json({ mensaje: "Archivo actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el archivo" });
  }
};

export const EliminarArchivo = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { materialId } = req.params;
  const centroId = req.query.centroId;

  if (!centroId) {
    return res.status(400).json({ error: "CentroId requerrido" });
  }

  try {
    const [materialRows]: any = await db.query(
      `SELECT curso_asignatura_id, archivo_url FROM materiales WHERE id = ?`,
      [materialId],
    );
    if (materialRows.length === 0) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    const permiso = await verificarPermiso(
      usuarioId,
      centroId,
      materialRows[0].curso_asignatura_id,
    );
    if (!permiso) {
      return res
        .status(403)
        .json({ error: "No tienes permiso sobre este archivo" });
    }

    const nombreArchivo = materialRows[0].archivo_url.split("/materiales")[1];
    if (nombreArchivo) {
      await supabase.storage.from("materiales").remove([nombreArchivo]);
    }

    await db.query(`DELETE FROM materiales WHERE id = ?`, [materialId]);
    res.json({ mensaje: "Archivo eliminado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar el archivo" });
  }
};
