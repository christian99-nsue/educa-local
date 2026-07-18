import { db } from "../config/db";

export const ListaCalificaciones = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { centroId, cursoAsignaturaId } = req.query;

  if (!centroId || !cursoAsignaturaId) {
    return res.status(400).json({ error: "Faltan parametros requeridos" });
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

    const [permisoRows]: any = await db.query(
      `SELECT id FROM profesor_asignaturas WHERE centro_usuario_id = ? AND curso_asignatura_id = ?`,
      [centroUsuarioId, cursoAsignaturaId],
    );
    if (permisoRows.length === 0) {
      return res
        .status(403)
        .json({ error: "No tienes permiso sobre esta asignatura" });
    }

    const [caRows]: any = await db.query(
      `SELECT curso_id, rama_id FROM curso_asignaturas WHERE id = ?`,
      [cursoAsignaturaId],
    );
    if (caRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Asignatura de curso no encontrada" });
    }
    const { curso_id, rama_id } = caRows[0];

    const [configRows]: any = await db.query(
      `SELECT sistema_calificacion FROM centro_configuracion WHERE centro_id = ?`,
      [centroId],
    );
    const sistemaCalificacion =
      configRows.length > 0 ? configRows[0].sistema_calificacion : "sobre 10";

    const [tareas]: any = await db.query(
      `SELECT id, titulo FROM tareas WHERE curso_asignatura_id = ? ORDER BY fecha_entrega ASC, id ASC`,
      [cursoAsignaturaId],
    );

    const [alumnos]: any = await db.query(
      `SELECT u.id, u.nombre, u.apellidos
       FROM centro_usuarios cu
       JOIN usuarios u ON u.id = cu.user_id
       WHERE cu.curso_id = ?
         AND cu.centro_id = ?
         AND cu.rol_en_centro = 'alumno'
         AND (? IS NULL OR cu.rama_id = ?)
       ORDER BY u.apellidos, u.nombre`,
      [curso_id, centroId, rama_id, rama_id],
    );

    let entregas: any[] = [];
    if (tareas.length > 0) {
      const tareaIds = tareas.map((t: any) => t.id);
      const [entregasRows]: any = await db.query(
        `SELECT tarea_id, usuario_id, nota FROM tarea_entregas WHERE tarea_id IN (?)`,
        [tareaIds],
      );
      entregas = entregasRows;
    }

    const notasPorAlumno: Record<number, Record<number, string | null>> = {};
    for (const e of entregas) {
      if (!notasPorAlumno[e.usuario_id]) notasPorAlumno[e.usuario_id] = {};
      notasPorAlumno[e.usuario_id][e.tarea_id] = e.nota;
    }

    const letraAValor: Record<string, number> = {
      F: 0,
      D: 1,
      C: 2,
      B: 3,
      A: 4,
    };
    const valorALetra = ["F", "D", "C", "B", "A"];

    const calcularNotaFinal = (notas: Record<number, string | null>) => {
      if (sistemaCalificacion === "A-F") {
        const valores = Object.values(notas)
          .filter(
            (n): n is string =>
              n !== null &&
              n !== "" &&
              letraAValor[String(n).toUpperCase()] !== undefined,
          )
          .map((n) => letraAValor[n.toUpperCase()]);

        if (valores.length === 0) return null;
        const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
        const indice = Math.min(4, Math.max(0, Math.round(promedio)));
        return valorALetra[indice];
      }

      const valoresNumericos = Object.values(notas)
        .filter((n) => n !== null && n !== "" && !isNaN(Number(n)))
        .map((n) => Number(n));

      if (valoresNumericos.length === 0) return null;
      return Number(
        (
          valoresNumericos.reduce((a, b) => a + b, 0) / valoresNumericos.length
        ).toFixed(1),
      );
    };

    const resultado = alumnos.map((al: any) => {
      const notas: Record<number, string | null> = {};

      for (const t of tareas) {
        notas[t.id] = notasPorAlumno[al.id]?.[t.id] ?? null;
      }

      const notaFinal = calcularNotaFinal(notas);

      return {
        id: al.id,
        nombre: al.nombre,
        apellidos: al.apellidos,
        notas,
        notaFinal,
      };
    });

    res.json({ tareas, alumnos: resultado, sistemaCalificacion });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener las calificaciones" });
  }
};

export const GuardarCalificaciones = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { centroId, cursoAsignaturaId, registros } = req.body;

  if (!centroId || !cursoAsignaturaId || !Array.isArray(registros)) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
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

    const [permisoRows]: any = await db.query(
      `SELECT id FROM profesor_asignaturas WHERE centro_usuario_id = ? AND curso_asignatura_id = ?`,
      [centroUsuarioId, cursoAsignaturaId],
    );
    if (permisoRows.length === 0) {
      return res
        .status(403)
        .json({ error: "No tienes permiso sobre esta asignatura" });
    }

    for (const registro of registros) {
      const { tareaId, usuarioId: alumnoId, nota } = registro;
      const notaLimpia = nota === "" || nota === undefined ? null : nota;

      if (notaLimpia === null) {
        await db.query(
          `INSERT INTO tarea_entregas (tarea_id, usuario_id, nota, estado)
           VALUES (?, ?, NULL, 'pendiente')
           ON DUPLICATE KEY UPDATE nota = NULL`,
          [tareaId, alumnoId],
        );
      } else {
        await db.query(
          `INSERT INTO tarea_entregas (tarea_id, usuario_id, nota, estado)
           VALUES (?, ?, ?, 'calificada')
           ON DUPLICATE KEY UPDATE nota = VALUES(nota), estado = 'calificada'`,
          [tareaId, alumnoId, notaLimpia],
        );
      }
    }

    res.json({ mensaje: "Calificaciones guardadas correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al guardar las calificaciones" });
  }
};
