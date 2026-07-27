import { db } from "../config/db";
import {
  notaANumero,
  formatearPromedioDisplay,
  SistemaCalificacion,
  getEstado,
  estadoColor,
} from "../utils/calificacionesUtils";

const DIAS_ABREV: Record<number, string> = {
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
  7: "Dom",
};

const verificarAcceso = async (
  usuarioId: number,
  centroId: any,
  cursoAsignaturaId: any,
) => {
  const [usuarioRows]: any = await db.query(
    `SELECT curso_id, rama_id FROM centro_usuarios WHERE user_id = ? AND centro_id = ?`,
    [usuarioId, centroId],
  );
  if (usuarioRows.length === 0) return null;
  const { curso_id, rama_id } = usuarioRows[0];

  const [caRows]: any = await db.query(
    `SELECT curso_id, rama_id FROM curso_asignaturas WHERE id = ?`,
    [cursoAsignaturaId],
  );
  if (caRows.length === 0) return null;

  const coincide =
    caRows[0].curso_id === curso_id &&
    (caRows[0].rama_id === null || caRows[0].rama_id === rama_id);

  return coincide ? true : null;
};

export const ObtenerDetalleAsignaturaAlumno = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoAsignaturaId } = req.params;
  const centroId = req.query.centroId;

  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    const acceso = await verificarAcceso(
      usuarioId,
      centroId,
      cursoAsignaturaId,
    );
    if (!acceso) {
      return res
        .status(403)
        .json({ error: "No tienes acceso a esta asignatura" });
    }

    const [configRows]: any = await db.query(
      `SELECT sistema_calificacion FROM centro_configuracion WHERE centro_id = ?`,
      [centroId],
    );
    const sistemaCalificacion = (configRows[0]?.sistema_calificacion ??
      "sobre-10") as SistemaCalificacion;

    const [rows]: any = await db.query(
      `SELECT
         a.nombre AS asignatura,
         a.id as asignatura_id,
         a.codigo,
         a.descripcion,
         r.nombre AS rama,
         u.nombre AS profesor_nombre,
         u.apellidos AS profesor_apellidos
       FROM curso_asignaturas ca
       JOIN asignaturas a ON a.id = ca.asignatura_id
       LEFT JOIN ramas r ON r.id = ca.rama_id
       LEFT JOIN profesor_asignaturas pa ON pa.curso_asignatura_id = ca.id
       LEFT JOIN centro_usuarios cu ON cu.id = pa.centro_usuario_id
       LEFT JOIN usuarios u ON u.id = cu.user_id
       WHERE ca.id = ?`,
      [cursoAsignaturaId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Asignatura no encontrada" });
    }
    const r = rows[0];

    const [notasRows]: any = await db.query(
      `SELECT t.curso_asignatura_id, te.nota
      FROM tareas t
      JOIN tarea_entregas te ON te.tarea_id = t.id
      WHERE te.usuario_id = ?
      AND te.estado = 'calificada'
      AND te.nota IS NOT NULL`,
      [usuarioId],
    );

    const [clases]: any = await db.query(
      `SELECT DISTINCT dia_semana, hora_inicio, hora_fin
       FROM horario_clases
       WHERE curso_asignatura_id = ? AND tipo = 'clase'
       ORDER BY dia_semana`,
      [cursoAsignaturaId],
    );

    const notasDeEstaAsignatura = notasRows.filter(
      (n: any) => n.curso_asignatura_id === r.asignatura_id,
    );

    const valoresNumericos = notasDeEstaAsignatura
      .map((n: any) => notaANumero(n.nota, sistemaCalificacion))
      .filter((v: number | null): v is number => v !== null);

    let notaActual: string | null = null;
    let notaColor: { bg: string; color: string } | null = null;
    if (valoresNumericos.length > 0) {
      const promedio =
        valoresNumericos.reduce((acc: number, v: number) => acc + v, 0) /
        valoresNumericos.length;
      notaActual = formatearPromedioDisplay(promedio, sistemaCalificacion);
      const estado = getEstado(promedio);
      notaColor = estadoColor[estado];
    }

    const diasTexto = clases
      .map((c: any) => DIAS_ABREV[c.dia_semana])
      .join(" - ");

    res.json({
      asignatura: r.asignatura,
      codigo: r.codigo,
      rama: r.rama,
      asignaturaId: r.asignatura_id,
      descripcion: r.descripcion,
      notaActual,
      notaColor,
      profesor: r.profesor_nombre
        ? `Prof. ${r.profesor_nombre} ${r.profesor_apellidos ?? ""}`.trim()
        : "Prof. Por asignar",
      horario: clases.length > 0 ? `${diasTexto}` : "Por definir",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener la asignatura" });
  }
};

export const ObtenerTareasPendientesAsignatura = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoAsignaturaId } = req.params;
  const centroId = req.query.centroId;

  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    const acceso = await verificarAcceso(
      usuarioId,
      centroId,
      cursoAsignaturaId,
    );
    if (!acceso) {
      return res
        .status(403)
        .json({ error: "No tienes acceso a esta asignatura" });
    }

    const [tareas]: any = await db.query(
      `SELECT t.id, t.titulo, t.fecha_entrega, COALESCE(te.estado, 'pendiente') AS estado
       FROM tareas t
       LEFT JOIN tarea_entregas te ON te.tarea_id = t.id AND te.usuario_id = ?
       WHERE t.curso_asignatura_id = ?
       AND COALESCE(te.estado, 'pendiente') = 'pendiente'
       ORDER BY t.fecha_entrega ASC`,
      [usuarioId, cursoAsignaturaId],
    );

    res.json(
      tareas.map((t: any) => ({
        id: t.id,
        titulo: t.titulo,
        fechaEntrega: t.fecha_entrega,
      })),
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener las tareas" });
  }
};

export const ObtenerMaterialesAlumno = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoAsignaturaId } = req.params;
  const centroId = req.query.centroId;
  const carpetaId = req.query.carpetaId || null;

  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    const acceso = await verificarAcceso(
      usuarioId,
      centroId,
      cursoAsignaturaId,
    );
    if (!acceso) {
      return res
        .status(403)
        .json({ error: "No tienes acceso a esta asignatura" });
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
      `SELECT id, nombre, extension, archivo_url, tamano_bytes, created_at, carpeta_id
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
        carpetaId: a.carpeta_id,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los materiales" });
  }
};
