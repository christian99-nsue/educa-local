import { db } from "../config/db";

export const AsignaturasProfesor = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const centroId = req.query.centroId;

  if (!centroId) {
    return res.status(400).json({ error: "centroId es requerido" });
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

    const [asignaturas]: any = await db.query(
      `SELECT
            ca.id AS curso_asignatura_id,
            a.id,
            a.nombre,
            a.codigo,
            cc.curso,
            r.nombre AS rama,
            ca.curso_id,
            (
                SELECT COUNT(*)
                FROM centro_usuarios cu2
                WHERE cu2.curso_id = ca.curso_id
                AND cu2.centro_id = ?
                AND (
                ca.rama_id IS NULL
                OR cu2.rama_id = ca.rama_id
                )
            ) AS total_alumnos
            FROM profesor_asignaturas pa
            JOIN curso_asignaturas ca ON ca.id = pa.curso_asignatura_id
            JOIN asignaturas a ON a.id = ca.asignatura_id
            JOIN centro_cursos cc ON cc.id = ca.curso_id
            LEFT JOIN ramas r ON r.id = ca.rama_id
            WHERE pa.centro_usuario_id = ? `,
      [centroId, centroUsuarioId],
    );
    res.json(asignaturas);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener las asignaturas" });
  }
};
