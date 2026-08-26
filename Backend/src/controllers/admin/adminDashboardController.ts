import { db } from "../../config/db";

const iconoPorTipo: Record<string, string> = {
  alumno_registrado: "alumno",
  profesor_registrado: "profesor",
  asignatura_creada: "asignatura",
  tarea_publicada: "tarea",
};

export const ObtenerDashboardAdmin = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const centroId = req.query.centroId;

  if (!centroId) {
    return res.status(400).json({ error: "centroId es requerido" });
  }

  try {
    const [permisoRows]: any = await db.query(
      `SELECT id FROM centro_usuarios WHERE user_id= ? AND centro_id = ? AND rol_en_centro = 'admin'`,
      [usuarioId, centroId],
    );

    if (permisoRows.length === 0) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador en este centro" });
    }

    const [centroRows]: any = await db.query(
      `SELECT nombre FROM centros WHERE id = ?`,
      [centroId],
    );

    const [totalAlumnos]: any = await db.query(
      `SELECT COUNT(*) AS total FROM centro_usuarios WHERE centro_id = ? AND rol_en_centro = 'alumno'`,
      [centroId],
    );

    const [totalProfesores]: any = await db.query(
      `SELECT COUNT(*) AS total FROM centro_usuarios WHERE centro_id = ? AND rol_en_centro = 'profesor'`,
      [centroId],
    );

    const [totalCursos]: any = await db.query(
      `SELECT COUNT(*) AS total FROM centro_cursos WHERE centro_id = ?`,
      [centroId],
    );

    const [tareasActivas]: any = await db.query(
      `SELECT COUNT(*) AS total
            FROM tareas t
            JOIN curso_asignaturas ca ON ca.id = t.curso_asignatura_id
            JOIN centro_cursos cc ON cc.id = ca.curso_id
            WHERE cc.centro_id = ? AND t.fecha_entrega >= NOW()`,
      [centroId],
    );

    const [actividad]: any = await db.query(
      `SELECT tipo, titulo, descripcion, created_at
            FROM actividad_log
            WHERE centro_id = ?
            ORDER BY created_at DESC
            LIMIT 10`,
      [centroId],
    );

    res.json({
      centro: centroRows[0]?.nombre ?? "",
      totalAlumnos: totalAlumnos[0].total,
      totalProfesores: totalProfesores[0].total,
      totalCursos: totalCursos[0].total,
      tareasActivas: tareasActivas[0].total,
      actividadReciente: actividad.map((a: any) => ({
        tipo: a.tipo,
        icono: iconoPorTipo[a.tipo] ?? "alumno",
        titulo: a.titulo,
        descripcion: a.descripcion,
        createdAt: a.created_at,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener el dashboard" });
  }
};
