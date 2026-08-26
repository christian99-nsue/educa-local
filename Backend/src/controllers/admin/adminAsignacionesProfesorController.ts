import { db } from "../../config/db";

const verificarAdmin = async (usuarioId: number, centroId: any) => {
  const [rows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'admin'`,
    [usuarioId, centroId],
  );
  return rows.length > 0;
};

export const ObtenerAsignacionesProfesor = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { profesorId } = req.params;
  const centroId = req.query.centroId;

  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [rows]: any = await db.query(
      `SELECT
         pa.id AS profesor_asignatura_id,
         a.nombre AS asignatura,
         cc.curso_base, cc.grupo,
         r.nombre AS rama,
         (
           SELECT GROUP_CONCAT(DISTINCT CONCAT(hc.dia_semana, '|', hc.hora_inicio, '|', hc.hora_fin) SEPARATOR ';;')
           FROM horario_clases hc WHERE hc.curso_asignatura_id = ca.id
         ) AS horarios
       FROM profesor_asignaturas pa
       JOIN centro_usuarios cu ON cu.id = pa.centro_usuario_id
       JOIN curso_asignaturas ca ON ca.id = pa.curso_asignatura_id
       JOIN asignaturas a ON a.id = ca.asignatura_id
       JOIN centro_cursos cc ON cc.id = ca.curso_id
       LEFT JOIN ramas r ON r.id = ca.rama_id
       WHERE cu.user_id = ? AND cu.centro_id = ?
       ORDER BY a.nombre`,
      [profesorId, centroId],
    );

    const DIAS_NOMBRE: Record<number, string> = {
      1: "Lunes",
      2: "Martes",
      3: "Miercoles",
      4: "Jueves",
      5: "Viernes",
    };

    res.json(
      rows.map((r: any) => ({
        profesorAsignaturaId: r.profesor_asignatura_id,
        asignatura: r.asignatura,
        curso: r.curso_base,
        rama: r.rama,
        grupo: r.grupo,
        horarioTexto: r.horarios
          ? r.horarios
              .split(";;")
              .map((h: string) => {
                const [dia, inicio, fin] = h.split("|");
                return `${DIAS_NOMBRE[Number(dia)]} ${inicio.slice(0, 5)}-${fin.slice(0, 5)}`;
              })
              .join(", ")
          : "Sin horario asignado",
      })),
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener las asignaciones" });
  }
};

export const ObtenerOpcionesAsignacion = async (req: any, res: any) => {
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

    const [rows]: any = await db.query(
      `SELECT ca.id AS curso_asignatura_id, a.nombre AS asignatura,
              cc.nivel, cc.curso_base, cc.grupo, r.nombre AS rama
       FROM curso_asignaturas ca
       JOIN asignaturas a ON a.id = ca.asignatura_id
       JOIN centro_cursos cc ON cc.id = ca.curso_id
       LEFT JOIN ramas r ON r.id = ca.rama_id
       WHERE cc.centro_id = ?
       ORDER BY cc.nivel, cc.curso_base, r.nombre, cc.grupo, a.nombre`,
      [centroId],
    );

    res.json(
      rows.map((r: any) => ({
        cursoAsignaturaId: r.curso_asignatura_id,
        asignatura: r.asignatura,
        nivel: r.nivel,
        cursoBase: r.curso_base,
        rama: r.rama,
        grupo: r.grupo,
      })),
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener las opciones" });
  }
};

export const CrearAsignacion = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { profesorId } = req.params;
  const { centroId, cursoAsignaturaId } = req.body;

  if (!centroId || !cursoAsignaturaId) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [cuRows]: any = await db.query(
      `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'profesor'`,
      [profesorId, centroId],
    );
    if (cuRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Profesor no encontrado en este centro" });
    }

    const [existe]: any = await db.query(
      `SELECT id FROM profesor_asignaturas WHERE centro_usuario_id = ? AND curso_asignatura_id = ?`,
      [cuRows[0].id, cursoAsignaturaId],
    );
    if (existe.length > 0) {
      return res
        .status(409)
        .json({ error: "Este profesor ya tiene asignada esta combinacion" });
    }

    const [result]: any = await db.query(
      `INSERT INTO profesor_asignaturas (centro_usuario_id, curso_asignatura_id) VALUES (?, ?)`,
      [cuRows[0].id, cursoAsignaturaId],
    );

    res.status(201).json({
      id: result.insertId,
      mensaje: "Asignacion creada correctamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear la asignacion" });
  }
};

export const EliminarAsignacion = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { asignacionId } = req.params;
  const centroId = req.query.centroId;
  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }
    await db.query(`DELETE FROM profesor_asignaturas WHERE id = ?`, [
      asignacionId,
    ]);
    res.json({ mensaje: "Asignacion eliminada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar la asignacion" });
  }
};

export const EditarAsignacion = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { asignacionId } = req.params;
  const { centroId, cursoAsignaturaId } = req.body;

  if (!centroId || !cursoAsignaturaId) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    await db.query(
      `UPDATE profesor_asignaturas SET curso_asignatura_id = ? WHERE id = ?`,
      [cursoAsignaturaId, asignacionId],
    );

    res.json({ mensaje: "Asignacion actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar la asignacion" });
  }
};
