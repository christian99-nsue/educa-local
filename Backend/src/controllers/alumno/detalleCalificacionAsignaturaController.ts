import { db } from "../../config/db";
import {
  notaANumero,
  formatearPromedioDisplay,
  getEstado,
  estadoColor,
  SistemaCalificacion,
} from "../../utils/calificacionesUtils";

export const ObtenerDetalleCalificacionAsignatura = async (
  req: any,
  res: any,
) => {
  const usuarioId = req.user.id;
  const { cursoAsignaturaId } = req.params;
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

    const [caRows]: any = await db.query(
      `SELECT curso_id, rama_id FROM curso_asignaturas WHERE id = ?`,
      [cursoAsignaturaId],
    );
    if (caRows.length === 0) {
      return res.status(404).json({ error: "Asignatura no encontrada" });
    }
    const coincide =
      caRows[0].curso_id === curso_id &&
      (caRows[0].rama_id === null || caRows[0].rama_id === rama_id);
    if (!coincide) {
      return res
        .status(403)
        .json({ error: "No tienes acceso a esta asignatura" });
    }

    const [configRows]: any = await db.query(
      `SELECT sistema_calificacion FROM centro_configuracion WHERE centro_id = ?`,
      [centroId],
    );
    const sistemaCalificacion: SistemaCalificacion =
      configRows[0]?.sistema_calificacion ?? "sobre-10";

    const [infoRows]: any = await db.query(
      `SELECT
         a.id AS asignatura_id,
         a.nombre AS asignatura,
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
    const info = infoRows[0];

    const [tareas]: any = await db.query(
      `SELECT t.id, t.titulo, te.fecha_entrega_real, te.nota
       FROM tareas t
       LEFT JOIN tarea_entregas te ON te.tarea_id = t.id AND te.usuario_id = ?
       WHERE t.curso_asignatura_id = ?
       ORDER BY te.fecha_entrega_real DESC`,
      [usuarioId, cursoAsignaturaId],
    );

    const puntosMaximos =
      sistemaCalificacion === "sobre-100"
        ? 100
        : sistemaCalificacion === "sobre-10"
          ? 10
          : null;

    const actividades = tareas
      .filter((t: any) => t.nota != null)
      .map((t: any) => {
        const valor = notaANumero(t.nota, sistemaCalificacion);
        const calificacionTexto =
          valor != null
            ? formatearPromedioDisplay(valor, sistemaCalificacion)
            : "-";
        const estado = valor != null ? getEstado(valor) : null;
        return {
          id: t.id,
          titulo: t.titulo,
          fechaEntrega: t.fecha_entrega_real,
          puntos: puntosMaximos,
          tuPuntuacion: calificacionTexto,
          calificacionTexto,
          color: estado ? estadoColor[estado] : null,
        };
      });

    const valoresNumericos = tareas
      .filter((t: any) => t.nota != null)
      .map((t: any) => notaANumero(t.nota, sistemaCalificacion))
      .filter((v: number | null): v is number => v !== null);

    let promedio: string | null = null;
    let estadoGeneral: string | null = null;
    let colorGeneral: { bg: string; color: string } | null = null;

    if (valoresNumericos.length > 0) {
      const promedioPorcentaje =
        valoresNumericos.reduce((acc: number, v: number) => acc + v, 0) /
        valoresNumericos.length;
      promedio = formatearPromedioDisplay(
        promedioPorcentaje,
        sistemaCalificacion,
      );
      estadoGeneral = getEstado(promedioPorcentaje);
      colorGeneral = estadoColor[estadoGeneral];
    }

    res.json({
      asignaturaId: info.asignatura_id,
      asignatura: info.asignatura,
      rama: info.rama,
      profesor: info.profesor_nombre
        ? `Prof. ${info.profesor_nombre} ${info.profesor_apellidos ?? ""}`.trim()
        : "Prof. Por asignar",
      sistemaCalificacion,
      puntosMaximos,
      promedio,
      estadoGeneral,
      colorGeneral,
      totalActividades: tareas.length,
      actividadesEvaluadas: actividades.length,
      actividades,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener la calificacion" });
  }
};
