import { db } from "../../config/db";

const verificarAdmin = async (usuarioId: number, centroId: any) => {
  const [rows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'admin'`,
    [usuarioId, centroId],
  );
  return rows.length > 0;
};

export const ObtenerDetalleCurso = async (req: any, res: any) => {
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

    const [cursoRows]: any = await db.query(
      `SELECT cc.id, cc.curso, cc.curso_base, cc.nivel, cc.grupo, cc.rama_id, cc.codigo, cc.descripcion,
              cc.estado, cc.created_at, cc.updated_at,
              r.nombre AS rama,
              u.id AS tutor_id, u.nombre AS tutor_nombre, u.apellidos AS tutor_apellidos
       FROM centro_cursos cc
       LEFT JOIN ramas r ON r.id = cc.rama_id
       LEFT JOIN usuarios u ON u.id = cc.tutor_id
       WHERE cc.id = ? AND cc.centro_id = ?`,
      [cursoId, centroId],
    );

    if (cursoRows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    const c = cursoRows[0];

    const [grupos]: any = await db.query(
      `SELECT cc.id, cc.grupo, cc.estado,
              (SELECT COUNT(*) FROM centro_usuarios cu WHERE cu.curso_id = cc.id AND cu.centro_id = ? AND cu.rol_en_centro = 'alumno') AS total_alumnos,
              u.nombre AS tutor_nombre, u.apellidos AS tutor_apellidos
       FROM centro_cursos cc
       LEFT JOIN usuarios u ON u.id = cc.tutor_id
       WHERE cc.centro_id = ? AND cc.curso_base = ? AND cc.nivel = ?
       AND (cc.rama_id <=> ?)
       ORDER BY cc.grupo`,
      [centroId, centroId, c.curso_base, c.nivel, c.rama_id],
    );

    const [asignaturas]: any = await db.query(
      `SELECT DISTINCT a.id, a.nombre
       FROM curso_asignaturas ca
       JOIN asignaturas a ON a.id = ca.asignatura_id
       WHERE ca.curso_id = ?`,
      [cursoId],
    );

    const [profesores]: any = await db.query(
      `SELECT DISTINCT u.id, u.nombre, u.apellidos, u.foto_url, a.nombre AS asignatura
       FROM profesor_asignaturas pa
       JOIN curso_asignaturas ca ON ca.id = pa.curso_asignatura_id
       JOIN centro_usuarios cu ON cu.id = pa.centro_usuario_id
       JOIN usuarios u ON u.id = cu.user_id
       JOIN asignaturas a ON a.id = ca.asignatura_id
       WHERE ca.curso_id = ?`,
      [cursoId],
    );

    const [totalAlumnosGrupo]: any = await db.query(
      `SELECT COUNT(*) AS total FROM centro_usuarios WHERE curso_id = ? AND centro_id = ? AND rol_en_centro = 'alumno'`,
      [cursoId, centroId],
    );

    res.json({
      id: c.id,
      curso: c.curso,
      cursoBase: c.curso_base,
      nivel: c.nivel,
      grupo: c.grupo,
      rama: c.rama,
      ramaId: c.rama_id,
      codigo: c.codigo,
      descripcion: c.descripcion,
      estado: c.estado ?? "activo",
      fechaCreacion: c.created_at,
      fechaActualizacion: c.updated_at,
      tutor: c.tutor_id
        ? {
            id: c.tutor_id,
            nombre: `${c.tutor_nombre} ${c.tutor_apellidos ?? ""}`.trim(),
          }
        : null,
      totalGrupos: grupos.length,
      totalAsignaturas: asignaturas.length,
      totalProfesores: profesores.length,
      totalAlumnos: totalAlumnosGrupo[0].total,
      grupos: grupos.map((g: any) => ({
        id: g.id,
        grupo: g.grupo,
        totalAlumnos: g.total_alumnos,
        estado: g.estado ?? "activo",
        tutor: g.tutor_nombre
          ? `${g.tutor_nombre} ${g.tutor_apellidos ?? ""}`.trim()
          : null,
      })),
      asignaturas: asignaturas.map((a: any) => ({
        id: a.id,
        nombre: a.nombre,
      })),
      profesores: profesores.map((p: any) => ({
        id: p.id,
        nombre: `${p.nombre} ${p.apellidos ?? ""}`.trim(),
        fotoUrl: p.foto_url,
        asignatura: p.asignatura,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener el curso" });
  }
};
