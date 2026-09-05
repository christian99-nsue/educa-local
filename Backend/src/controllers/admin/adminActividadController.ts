import { db } from "../../config/db";

const verificarAdmin = async (usuarioId: number, centroId: any) => {
  const [rows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'admin'`,
    [usuarioId, centroId],
  );
  return rows.length > 0;
};

export const ObtenerActividadCompleta = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const centroId = req.query.centroId;
  const {
    fechaInicio,
    fechaFin,
    categoria,
    usuarioFiltro,
    busqueda,
    pagina = 1,
  } = req.query;

  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const condiciones = ["al.centro_id = ?"];
    const params: any[] = [centroId];

    if (fechaInicio) {
      condiciones.push("al.created_at >= ?");
      params.push(`${fechaInicio} 00:00:00`);
    }
    if (fechaFin) {
      condiciones.push("al.created_at <= ?");
      params.push(`${fechaFin} 23:59:59`);
    }
    if (categoria && categoria !== "todos") {
      condiciones.push("al.categoria = ?");
      params.push(categoria);
    }
    if (usuarioFiltro && usuarioFiltro !== "todos") {
      condiciones.push("al.usuario_id = ?");
      params.push(usuarioFiltro);
    }
    if (busqueda) {
      condiciones.push("(al.titulo LIKE ? OR al.descripcion LIKE ?)");
      params.push(`%${busqueda}%`, `%${busqueda}%`);
    }

    const whereClause = condiciones.join(" AND ");
    const PAGE_SIZE = 20;
    const offset = (Number(pagina) - 1) * PAGE_SIZE;

    const [rows]: any = await db.query(
      `SELECT al.id, al.tipo, al.categoria, al.modulo, al.titulo, al.descripcion, al.ip, al.created_at,
              u.nombre, u.apellidos, u.foto_url, cu.rol_en_centro
       FROM actividad_log al
       LEFT JOIN usuarios u ON u.id = al.usuario_id
       LEFT JOIN centro_usuarios cu ON cu.user_id = al.usuario_id AND cu.centro_id = al.centro_id
       WHERE ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, PAGE_SIZE, offset],
    );

    const [totalRows]: any = await db.query(
      `SELECT COUNT(*) AS total FROM actividad_log al WHERE ${whereClause}`,
      params,
    );

    res.json({
      total: totalRows[0].total,
      pagina: Number(pagina),
      totalPaginas: Math.max(1, Math.ceil(totalRows[0].total / PAGE_SIZE)),
      actividades: rows.map((r: any) => ({
        id: r.id,
        tipo: r.tipo,
        categoria: r.categoria,
        modulo: r.modulo,
        titulo: r.titulo,
        descripcion: r.descripcion,
        ip: r.ip,
        createdAt: r.created_at,
        usuario: r.nombre
          ? `${r.nombre} ${r.apellidos ?? ""}`.trim()
          : "Sistema",
        fotoUrl: r.foto_url,
        rol: r.rol_en_centro,
      })),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener la actividad" });
  }
};

export const ObtenerUsuariosParaFiltro = async (req: any, res: any) => {
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
      `SELECT DISTINCT u.id, u.nombre, u.apellidos
       FROM actividad_log al
       JOIN usuarios u ON u.id = al.usuario_id
       WHERE al.centro_id = ?
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
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};
