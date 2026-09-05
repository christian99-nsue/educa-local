import { db } from "../../config/db";
import { registrarActividad, getIpDeRequest } from "../../utils/actividadUtil";

const verificarAdmin = async (usuarioId: number, centroId: any) => {
  const [rows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'admin'`,
    [usuarioId, centroId],
  );
  return rows.length > 0;
};

export const ObtenerProfesoresParaTutor = async (req: any, res: any) => {
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
      `SELECT u.id, u.nombre, u.apellidos
       FROM centro_usuarios cu
       JOIN usuarios u ON u.id = cu.user_id
       WHERE cu.centro_id = ? AND cu.rol_en_centro = 'profesor'
       ORDER BY u.nombre`,
      [centroId],
    );

    res.json(
      rows.map((r: any) => ({
        id: r.id,
        nombre: `${r.nombre} ${r.apellidos ?? ""}`.trim(),
      })),
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los profesores" });
  }
};

export const ActualizarInformacionCurso = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoId } = req.params;
  const { centroId, codigo, descripcion, estado, tutorId } = req.body;

  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    await db.query(
      `UPDATE centro_cursos SET codigo = ?, descripcion = ?, estado = ?, tutor_id = ? WHERE id = ? AND centro_id = ?`,
      [
        codigo || null,
        descripcion || null,
        estado || "activo",
        tutorId || null,
        cursoId,
        centroId,
      ],
    );

    res.json({ mensaje: "Curso actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el curso" });
  }
};

export const ObtenerGruposCurso = async (req: any, res: any) => {
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
      `SELECT curso_base, nivel, rama_id FROM centro_cursos WHERE id = ? AND centro_id = ?`,
      [cursoId, centroId],
    );
    if (cursoRows.length === 0)
      return res.status(404).json({ error: "Curso no encontrado" });
    const { curso_base, nivel, rama_id } = cursoRows[0];

    const [grupos]: any = await db.query(
      `SELECT cc.id, cc.grupo, cc.estado, cc.tutor_id,
              u.nombre AS tutor_nombre, u.apellidos AS tutor_apellidos,
              (SELECT COUNT(*) FROM centro_usuarios cu WHERE cu.curso_id = cc.id AND cu.centro_id = ? AND cu.rol_en_centro = 'alumno') AS total_alumnos
       FROM centro_cursos cc
       LEFT JOIN usuarios u ON u.id = cc.tutor_id
       WHERE cc.centro_id = ? AND cc.curso_base = ? AND cc.nivel = ?
       AND (cc.rama_id <=> ?)
       ORDER BY cc.grupo`,
      [centroId, centroId, curso_base, nivel, rama_id],
    );

    res.json(
      grupos.map((g: any) => ({
        id: g.id,
        grupo: g.grupo,
        estado: g.estado ?? "activo",
        tutorId: g.tutor_id,
        tutor: g.tutor_nombre
          ? `${g.tutor_nombre} ${g.tutor_apellidos ?? ""}`.trim()
          : null,
        totalAlumnos: g.total_alumnos,
      })),
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los grupos" });
  }
};

export const CrearGrupo = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoId } = req.params;
  const { centroId, grupo, tutorId } = req.body;
  if (!centroId || !grupo)
    return res.status(400).json({ error: "Faltan datos requeridos" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [cursoRows]: any = await db.query(
      `SELECT curso_base, curso, nivel, rama_id FROM centro_cursos WHERE id = ? AND centro_id = ?`,
      [cursoId, centroId],
    );
    if (cursoRows.length === 0)
      return res.status(404).json({ error: "Curso no encontrado" });
    const c = cursoRows[0];

    const [ramaRows]: any = c.rama_id
      ? await db.query(`SELECT nombre FROM ramas WHERE id = ?`, [c.rama_id])
      : [[]];
    let nombreCompleto = c.curso_base;
    if (ramaRows[0]?.nombre) nombreCompleto += ` - ${ramaRows[0].nombre}`;
    nombreCompleto += ` - Grupo ${grupo}`;

    const [existe]: any = await db.query(
      `SELECT id FROM centro_cursos WHERE centro_id = ? AND curso = ?`,
      [centroId, nombreCompleto],
    );
    if (existe.length > 0) {
      return res
        .status(409)
        .json({ error: "Ya existe un grupo con ese nombre en este curso" });
    }

    const [result]: any = await db.query(
      `INSERT INTO centro_cursos (centro_id, curso, curso_base, nivel, grupo, rama_id, tutor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        centroId,
        nombreCompleto,
        c.curso_base,
        c.nivel,
        grupo,
        c.rama_id,
        tutorId || null,
      ],
    );

    res
      .status(201)
      .json({ id: result.insertId, mensaje: "Grupo creado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear el grupo" });
  }
};

export const EditarGrupo = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { grupoId } = req.params;
  const { centroId, tutorId, estado } = req.body;
  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    await db.query(
      `UPDATE centro_cursos SET tutor_id = ?, estado = ? WHERE id = ? AND centro_id = ?`,
      [tutorId || null, estado || "activo", grupoId, centroId],
    );

    res.json({ mensaje: "Grupo actualizado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar el grupo" });
  }
};

export const EliminarGrupo = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { grupoId } = req.params;
  const centroId = req.query.centroId;
  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [alumnosRows]: any = await db.query(
      `SELECT COUNT(*) AS total FROM centro_usuarios WHERE curso_id = ? AND centro_id = ?`,
      [grupoId, centroId],
    );
    if (alumnosRows[0].total > 0) {
      return res.status(409).json({
        error: "No puedes eliminar un grupo que tiene alumnos matriculados",
      });
    }

    await db.query(`DELETE FROM centro_cursos WHERE id = ? AND centro_id = ?`, [
      grupoId,
      centroId,
    ]);
    res.json({ mensaje: "Grupo eliminado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar el grupo" });
  }
};

export const ObtenerAsignaturasCurso = async (req: any, res: any) => {
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

    const [rows]: any = await db.query(
      `SELECT ca.id, a.id AS asignatura_id, a.nombre AS asignatura, a.codigo, ca.tipo
      FROM curso_asignaturas ca
      JOIN asignaturas a ON a.id = ca.asignatura_id
      WHERE ca.curso_id = ?
      ORDER BY a.nombre`,
      [cursoId],
    );

    res.json(
      rows.map((r: any) => ({
        id: r.id,
        asignaturaId: r.asignatura_id,
        asignatura: r.asignatura,
        codigo: r.codigo,
        tipo: r.tipo ?? "obligatoria",
      })),
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener las asignaturas" });
  }
};

export const ObtenerCatalogoAsignaturas = async (req: any, res: any) => {
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
      `SELECT id, nombre FROM asignaturas WHERE centro_id = ? ORDER BY nombre`,
      [centroId],
    );

    res.json(rows.map((r: any) => ({ id: r.id, nombre: r.nombre })));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener el catalogo" });
  }
};

export const AnadirAsignaturaCurso = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoId } = req.params;
  const { centroId, nombreAsignatura, codigo, tipo } = req.body;
  if (!centroId || !nombreAsignatura)
    return res.status(400).json({ error: "Faltan datos requeridos" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [cursoRows]: any = await db.query(
      `SELECT rama_id FROM centro_cursos WHERE id = ? AND centro_id = ?`,
      [cursoId, centroId],
    );

    if (cursoRows.length === 0)
      return res.status(404).json({ error: "Curso no encontrado" });

    const nombreLimpio = nombreAsignatura.trim();
    const [existeAsig]: any = await db.query(
      `SELECT id FROM asignaturas WHERE centro_id = ? AND LOWER(nombre) = LOWER(?)`,
      [centroId, nombreLimpio],
    );

    let asignaturaId: number;
    if (existeAsig.length > 0) {
      asignaturaId = existeAsig[0].id;
    } else {
      const [nuevaAsig]: any = await db.query(
        `INSERT INTO asignaturas (nombre, centro_id, codigo) VALUES (?, ?, ?)`,
        [nombreLimpio, centroId],
      );
      asignaturaId = nuevaAsig.insertId;
    }

    const [existe]: any = await db.query(
      `SELECT id FROM curso_asignaturas WHERE curso_id = ? AND asignatura_id = ?`,
      [cursoId, asignaturaId],
    );
    if (existe.length > 0) {
      return res
        .status(409)
        .json({ error: "Esta asignatura ya esta añadida a este curso" });
    }

    const [result]: any = await db.query(
      `INSERT INTO curso_asignaturas (curso_id, asignatura_id, rama_id, tipo) VALUES (?, ?, ?, ?)`,
      [cursoId, asignaturaId, cursoRows[0].rama_id, tipo || "obligatoria"],
    );

    res.status(201).json({
      id: result.insertId,
      mensaje: "Asignatura añadida correctamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al añadir la asignatura" });
  }
};

export const EliminarAsignaturaCurso = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoAsignaturaId } = req.params;
  const centroId = req.query.centroId;
  if (!centroId)
    return res.status(400).json({ arror: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [tareasRows]: any = await db.query(
      `SELECT COUNT(*) AS total FROM tareas WHERE curso_asignatura_id = ?`,
      [cursoAsignaturaId],
    );
    if (tareasRows[0].total > 0) {
      return res.status(409).json({
        error: "No puedes eliminar una asignatura que ya tiene tareas creadas",
      });
    }

    await db.query(
      `DELETE FROM profesor_asignaturas WHERE curso_asignatura_id = ?`,
      [cursoAsignaturaId],
    );
    await db.query(`DELETE FROM horario_clases WHERE curso_asignatura_id = ?`, [
      cursoAsignaturaId,
    ]);
    await db.query(`DELETE FROM curso_asignaturas WHERE id = ?`, [
      cursoAsignaturaId,
    ]);

    res.json({ mensaje: "Asignatura eliminada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al eliminar la asignatura" });
  }
};

export const ObtenerProfesoresDelCurso = async (req: any, res: any) => {
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

    const [rows]: any = await db.query(
      `SELECT pa.id AS asignacion_id, u.id AS profesor_id, u.nombre, u.apellidos, u.foto_url, a.nombre AS asignatura
       FROM profesor_asignaturas pa
       JOIN curso_asignaturas ca ON ca.id = pa.curso_asignatura_id
       JOIN centro_usuarios cu ON cu.id = pa.centro_usuario_id
       JOIN usuarios u ON u.id = cu.user_id
       JOIN asignaturas a ON a.id = ca.asignatura_id
       WHERE ca.curso_id = ?
       ORDER BY u.nombre`,
      [cursoId],
    );

    res.json(
      rows.map((r: any) => ({
        asignacionId: r.asignacion_id,
        profesorId: r.profesor_id,
        nombre: `${r.nombre} ${r.apellidos ?? ""}`.trim(),
        fotoUrl: r.foto_url,
        asignatura: r.asignatura,
      })),
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los profesores" });
  }
};

export const AsignarProfesorCurso = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoId } = req.params;
  const { centroId, profesorId, cursoAsignaturaId } = req.body;
  if (!centroId || !profesorId || !cursoAsignaturaId) {
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
    if (cuRows.length === 0)
      return res
        .status(404)
        .json({ error: "Profesor no encontrado en este centro" });

    const [existe]: any = await db.query(
      `SELECT id FROM profesor_asignaturas WHERE centro_usuario_id = ? AND curso_asignatura_id = ?`,
      [cuRows[0].id, cursoAsignaturaId],
    );
    if (existe.length > 0) {
      return res.status(409).json({
        error: "Este profesor ya imparte esta asignatura en este curso",
      });
    }

    const [result]: any = await db.query(
      `INSERT INTO profesor_asignaturas (centro_usuario_id, curso_asignatura_id) VALUES (?, ?)`,
      [cuRows[0].id, cursoAsignaturaId],
    );
    const [profRows]: any = await db.query(
      `SELECT nombre, apellidos FROM usuarios WHERE id = ?`,
      [profesorId],
    );
    const [asigRows]: any = await db.query(
      `SELECT a.nombre AS asignatura, cc.curso FROM curso_asignaturas ca
   JOIN asignaturas a ON a.id = ca.asignatura_id
   JOIN centro_cursos cc ON cc.id = ca.curso_id
   WHERE ca.id = ?`,
      [cursoAsignaturaId],
    );
    await registrarActividad({
      centroId,
      usuarioId,
      tipo: "profesor_asignado",
      titulo: "Asigno profesor a curso",
      descripcion: `${profRows[0]?.nombre} ${profRows[0]?.apellidos ?? ""} → ${asigRows[0]?.asignatura} (${asigRows[0]?.curso})`,
      ip: getIpDeRequest(req),
    });

    res.status(201).json({
      id: result.insertId,
      mensaje: "Profesor asignado correctamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al asignar el profesor" });
  }
};

export const EliminarProfesorCurso = async (req: any, res: any) => {
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
    await registrarActividad({
      centroId,
      usuarioId,
      tipo: "profesor_removido",
      titulo: "Elimino asignacion de profesor",
      descripcion: "Asignacion eliminada",
      ip: getIpDeRequest(req),
    });
    res.json({ mensaje: "Profesor removido correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al remover el profesor" });
  }
};

export const EditarAsignaturaCurso = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { cursoAsignaturaId } = req.params;
  const { centroId, asignaturaId, nombreAsignatura, codigo, tipo } = req.body;
  if (!centroId || !asignaturaId || !nombreAsignatura) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    await db.query(
      `UPDATE asignaturas SET nombre = ?, codigo = ? WHERE id = ? AND centro_id = ?`,
      [nombreAsignatura.trim(), codigo || null, asignaturaId, centroId],
    );

    await db.query(`UPDATE curso_asignaturas SET tipo = ? WHERE id = ?`, [
      tipo || "obligatoria",
      cursoAsignaturaId,
    ]);

    await registrarActividad({
      centroId,
      usuarioId,
      tipo: "asignatura_editada",
      titulo: "Edito asignatura",
      descripcion: `${nombreAsignatura.trim()}`,
      ip: getIpDeRequest(req),
    });

    res.json({ mensaje: "Asignatura actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al actualizar la asignatura" });
  }
};

export const EliminarCursoCompleto = async (req: any, res: any) => {
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

    const [alumnoRows]: any = await db.query(
      `SELECT COUNT(*) AS total FROM centro_usuarios WHERE curso_id = ? AND centro_id = ?`,
      [cursoId, centroId],
    );
    if (alumnoRows[0].total > 0) {
      return res.status(409).json({
        error: "No puedes eliminar un curso que tiene alumnos matriculados",
      });
    }

    const [caRows]: any = await db.query(
      `SELECT if FROM curso_asignaturas WHERE  curso_id = ?`,
      [cursoId],
    );
    const caIds = caRows.map((r: any) => r.id);
    if (caIds.length > 0) {
      await db.query(
        `DELETE FROM horario_clases WHERE curso_asignatura_id IN (?)`,
        [caIds],
      );
      await db.query(
        `DELETE FROM profesor_asignaturas WHERE curso_asignatura_id IN (?)`,
        [caIds],
      );
      await db.query(`DELETE FROM curso_asignaturas WHERE curso_id IN (?)`, [
        cursoId,
      ]);
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
