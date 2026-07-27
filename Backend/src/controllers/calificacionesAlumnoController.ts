import { db } from "../config/db";
import {
  notaANumero,
  formatearPromedioDisplay,
  getEstado,
  estadoColor,
  SistemaCalificacion,
} from "../utils/calificacionesUtils";

export const CalificacionesAlumno = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const centroId = req.query.centroId;

  if (!centroId) {
    return res.status(400).json({ error: "centroId es requerido" });
  }

  try {
    const [usuarioRows]: any = await db.query(
      `SELECT curso_id, rama_id FROM centro_usuarios
       WHERE user_id = ? AND centro_id = ?`,
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

    const [asignaturas]: any = await db.query(
      `SELECT
         ca.id AS curso_asignatura_id,
         a.nombre AS asignatura,
         u.nombre AS profesor_nombre,
         u.apellidos AS profesor_apellidos,
         (SELECT COUNT(*) FROM tareas t WHERE t.curso_asignatura_id = ca.id) AS total_actividades
       FROM curso_asignaturas ca
       JOIN asignaturas a ON a.id = ca.asignatura_id
       LEFT JOIN profesor_asignaturas pa ON pa.curso_asignatura_id = ca.id
       LEFT JOIN centro_usuarios cu ON cu.id = pa.centro_usuario_id
       LEFT JOIN usuarios u ON u.id = cu.user_id
       WHERE ca.curso_id = ?
       AND (ca.rama_id IS NULL OR ca.rama_id = ?)`,
      [curso_id, rama_id],
    );

    const [notasRows]: any = await db.query(
      `SELECT t.curso_asignatura_id, te.nota, te.estado
       FROM tareas t
       JOIN tarea_entregas te ON te.tarea_id = t.id
       WHERE te.usuario_id = ?
       AND t.curso_asignatura_id IN (?)`,
      [usuarioId, asignaturas.map((a: any) => a.curso_asignatura_id)],
    );

    const asignaturasFormateadas = asignaturas.map((a: any) => {
      const notasDeEstaAsignatura = notasRows.filter(
        (n: any) => n.curso_asignatura_id === a.curso_asignatura_id,
      );

      const calificadas = notasDeEstaAsignatura.filter(
        (n: any) => n.estado === "calificada" && n.nota,
      );
      const pendientesCalificar = notasDeEstaAsignatura.filter(
        (n: any) => n.estado === "entregada",
      ).length;

      const valoresNumericos = calificadas
        .map((n: any) => notaANumero(n.nota, sistemaCalificacion))
        .filter((v: number | null): v is number => v !== null);

      let promedioPorcentaje: number | null = null;
      if (valoresNumericos.length > 0) {
        const suma = valoresNumericos.reduce(
          (acc: number, v: number) => acc + v,
          0,
        );
        promedioPorcentaje = suma / valoresNumericos.length;
      }

      const estado =
        promedioPorcentaje != null ? getEstado(promedioPorcentaje) : null;

      return {
        cursoAsignaturaId: a.curso_asignatura_id,
        asignatura: a.asignatura,
        profesor: a.profesor_nombre
          ? `Prof. ${a.profesor_nombre} ${a.profesor_apellidos ?? ""}`.trim()
          : "Prof. Por asignar",
        promedio:
          promedioPorcentaje != null
            ? formatearPromedioDisplay(promedioPorcentaje, sistemaCalificacion)
            : null,
        promedioPorcentaje,
        totalActividades: a.total_actividades,
        actividadesCalificadas: calificadas.length,
        pendientesCalificar,
        estado,
        estadoColor: estado ? estadoColor[estado] : null,
      };
    });

    const conPromedio = asignaturasFormateadas.filter(
      (a: any) => a.promedioPorcentaje != null,
    );
    const promedioGeneralPorcentaje =
      conPromedio.length > 0
        ? conPromedio.reduce(
            (acc: number, a: any) => acc + a.promedioPorcentaje,
            0,
          ) / conPromedio.length
        : null;

    const totalActividadesCalificadas = asignaturasFormateadas.reduce(
      (acc: number, a: any) => acc + a.actividadesCalificadas,
      0,
    );
    const totalPendientesCalificar = asignaturasFormateadas.reduce(
      (acc: number, a: any) => acc + a.pendientesCalificar,
      0,
    );

    res.json({
      sistemaCalificacion,
      promedioGeneral:
        promedioGeneralPorcentaje != null
          ? formatearPromedioDisplay(
              promedioGeneralPorcentaje,
              sistemaCalificacion,
            )
          : null,
      estadoGeneral:
        promedioGeneralPorcentaje != null
          ? getEstado(promedioGeneralPorcentaje)
          : null,
      totalAsignaturas: asignaturasFormateadas.length,
      totalActividadesCalificadas,
      totalPendientesCalificar,
      asignaturas: asignaturasFormateadas.map(
        ({ promedioPorcentaje, ...resto }: any) => resto,
      ),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener las calificaciones" });
  }
};
