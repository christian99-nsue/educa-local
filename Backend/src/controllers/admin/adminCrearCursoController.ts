import { db } from "../../config/db";
import { registrarActividad, getIpDeRequest } from "../../utils/actividadUtil";

const verificarAdmin = async (usuarioId: number, centroId: any) => {
  const [rows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'admin'`,
    [usuarioId, centroId],
  );
  return rows.length > 0;
};

export const ObtenerRamas = async (req: any, res: any) => {
  try {
    const [rows]: any = await db.query(
      `SELECT id, nombre FROM ramas ORDER BY nombre`,
    );
    res.json(rows.map((r: any) => ({ id: r.id, nombre: r.nombre })));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener las ramas" });
  }
};

export const CrearCurso = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { centroId, nivel, cursoBase, ramaId, grupo } = req.body;

  if (!centroId || !nivel || !cursoBase) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  if (nivel === "Bachillerato" && !ramaId) {
    return res
      .status(400)
      .json({ error: "Debes seleccionar una rama para Bachillerato" });
  }

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    let nombreCompleto = cursoBase;
    let ramaNombre: string | null = null;

    if (ramaId) {
      const [ramaRows]: any = await db.query(
        `SELECT nombre FROM ramas WHERE id = ?`,
        [ramaId],
      );
      ramaNombre = ramaRows[0]?.nombre ?? null;
      if (ramaNombre) nombreCompleto += ` - ${ramaNombre}`;
    }
    if (grupo) {
      nombreCompleto += ` - Grupo ${grupo}`;
    }

    const [existe]: any = await db.query(
      `SELECT id FROM centro_cursos WHERE centro_id = ? AND curso = ?`,
      [centroId, nombreCompleto],
    );
    if (existe.length > 0) {
      return res
        .status(409)
        .json({ error: "Ya existe un curso con ese mismo nombre" });
    }

    const [result]: any = await db.query(
      `INSERT INTO centro_cursos (centro_id, curso, curso_base, nivel, grupo, rama_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        centroId,
        nombreCompleto,
        cursoBase,
        nivel,
        grupo || null,
        ramaId || null,
      ],
    );

    await registrarActividad({
      centroId,
      usuarioId,
      tipo: "curso_creado",
      titulo: "Creo un nuevo curso",
      descripcion: nombreCompleto,
      ip: getIpDeRequest(req),
    });

    res.status(201).json({ id: result.insertId, curso: nombreCompleto });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear el curso" });
  }
};
