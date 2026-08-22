import { db } from "../config/db";
import { abreviarRama } from "../utils/abreviarRama";

const verificarAdmin = async (usuarioId: number, centroId: any) => {
  const [rows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'admin'`,
    [usuarioId, centroId],
  );
  return rows.length > 0;
};

export const ObtenerPerfilProfesorAdmin = async (req: any, res: any) => {
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

    const [userRows]: any = await db.query(
      `SELECT u.id, u.nombre, u.apellidos, u.email, u.telefono, u.code, u.foto_url,
              cu.estado, cu.created_at
       FROM centro_usuarios cu
       JOIN usuarios u ON u.id = cu.user_id
       WHERE u.id = ? AND cu.centro_id = ? AND cu.rol_en_centro = 'profesor'`,
      [profesorId, centroId],
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }
    const u = userRows[0];

    const [asignacionesRows]: any = await db.query(
      `SELECT
         a.nombre AS asignatura,
         cc.curso_base, cc.grupo,
         r.nombre AS rama,
         hc.dia_semana, hc.hora_inicio, hc.hora_fin
       FROM profesor_asignaturas pa
       JOIN centro_usuarios cu ON cu.id = pa.centro_usuario_id
       JOIN curso_asignaturas ca ON ca.id = pa.curso_asignatura_id
       JOIN asignaturas a ON a.id = ca.asignatura_id
       JOIN centro_cursos cc ON cc.id = ca.curso_id
       LEFT JOIN ramas r ON r.id = ca.rama_id
       LEFT JOIN horario_clases hc ON hc.curso_asignatura_id = ca.id
       WHERE cu.user_id = ? AND cu.centro_id = ?
       ORDER BY a.nombre, hc.dia_semana, hc.hora_inicio`,
      [profesorId, centroId],
    );

    const asignaturasMap = new Map<string, any>();
    for (const r of asignacionesRows) {
      const etiquetaCurso = r.rama
        ? `${r.curso_base} - ${r.rama} ${r.grupo ? `Grupo - ${r.grupo}` : ""}`
        : `${r.curso_base} ${r.grupo ? `Grupo - ${r.grupo}` : ""}`;
      const key = `${r.asignatura}`;
      if (!asignaturasMap.has(key)) {
        asignaturasMap.set(key, {
          asignatura: r.asignatura,
          cursos: new Set<string>(),
        });
      }
      asignaturasMap.get(key).cursos.add(etiquetaCurso);
    }
    const asignaturasAgrupadas = Array.from(asignaturasMap.values()).map(
      (a) => ({
        asignatura: a.asignatura,
        cursos: Array.from(a.cursos),
      }),
    );

    const DIAS_NOMBRE: Record<number, string> = {
      1: "Lunes",
      2: "Martes",
      3: "Miercoles",
      4: "Jueves",
      5: "Viernes",
    };
    const horarioResumen: Record<string, any[]> = {};
    for (const r of asignacionesRows) {
      if (!r.dia_semana) continue;
      const dia = DIAS_NOMBRE[r.dia_semana];
      if (!horarioResumen[dia]) horarioResumen[dia] = [];
      horarioResumen[dia].push({
        horaInicio: r.hora_inicio,
        horaFin: r.hora_fin,
        asignatura: r.asignatura,
        curso: r.rama
          ? `${r.curso_base} ${abreviarRama(r.rama)} ${r.grupo ? r.grupo : ""}`
          : `${r.curso_base} ${r.grupo ? r.grupo : ""}`,
      });
    }

    res.json({
      id: u.id,
      nombre: u.nombre,
      apellidos: u.apellidos,
      email: u.email,
      telefono: u.telefono,
      codigo: u.code,
      fotoUrl: u.foto_url,
      estado: u.estado,
      fechaAlta: u.created_at,
      totalAsignaciones:
        asignacionesRows.length > 0
          ? new Set(
              asignacionesRows.map(
                (r: any) => `${r.asignatura}-${r.curso_base}-${r.grupo}`,
              ),
            ).size
          : 0,
      asignaturas: asignaturasAgrupadas,
      horarioResumen,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener el perfil del profesor" });
  }
};
