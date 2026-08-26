import { db } from "../../config/db";

const verificarAdmin = async (usuarioId: number, centroId: any) => {
  const [rows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'admin'`,
    [usuarioId, centroId],
  );
  return rows.length > 0;
};

export const ObtenerCursos = async (req: any, res: any) => {
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

    const [cursos]: any = await db.query(
      `SELECT
         cc.id, cc.curso, cc.nivel,
         u.id AS tutor_id, u.nombre AS tutor_nombre, u.apellidos AS tutor_apellidos, u.foto_url AS tutor_foto,
         (
           SELECT COUNT(*) FROM centro_usuarios cu
           WHERE cu.curso_id = cc.id AND cu.centro_id = ? AND cu.rol_en_centro = 'alumno'
         ) AS total_alumnos,
         (
           SELECT COUNT(*) FROM curso_asignaturas ca WHERE ca.curso_id = cc.id
         ) AS total_asignaturas
       FROM centro_cursos cc
       LEFT JOIN usuarios u ON u.id = cc.tutor_id
       WHERE cc.centro_id = ?
       ORDER BY cc.nivel, cc.curso`,
      [centroId, centroId],
    );

    const [totalesRows]: any = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM centro_cursos WHERE centro_id = ?) AS total_cursos,
         (SELECT COUNT(*) FROM centro_usuarios WHERE centro_id = ? AND rol_en_centro = 'alumno') AS total_alumnos,
         (SELECT COUNT(*) FROM centro_usuarios WHERE centro_id = ? AND rol_en_centro = 'profesor') AS total_profesores,
         (
           SELECT COUNT(*)
           FROM curso_asignaturas ca
           JOIN centro_cursos cc ON cc.id = ca.curso_id
           WHERE cc.centro_id = ?
         ) AS total_asignaturas`,
      [centroId, centroId, centroId, centroId],
    );

    res.json({
      totales: {
        totalCursos: totalesRows[0].total_cursos,
        totalAlumnos: totalesRows[0].total_alumnos,
        totalAsignaturas: totalesRows[0].total_asignaturas,
        totalProfesores: totalesRows[0].total_profesores,
      },
      cursos: cursos.map((c: any) => ({
        id: c.id,
        curso: c.curso,
        nivel: c.nivel,
        totalAlumnos: c.total_alumnos,
        totalAsignaturas: c.total_asignaturas,
        tutor: c.tutor_id
          ? {
              id: c.tutor_id,
              nombre: `${c.tutor_nombre} ${c.tutor_apellidos ?? ""}`.trim(),
              fotoUrl: c.tutor_foto,
            }
          : null,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los cursos" });
  }
};

export const EliminarCurso = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoId } = req.params;
  const centroId = req.query.centroId;

  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    await db.query(`DELETE FROM centro_cursos WHERE id = ? AND centro_id = ?`, [
      cursoId,
      centroId,
    ]);
    res.json({ mensaje: "Curso eliminado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar el curso" });
  }
};
