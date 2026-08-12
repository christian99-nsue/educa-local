import { db } from "../config/db";
import bcrypt from "bcrypt";

const generarPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 8; i++)
    pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
};

const generarCodigo = async (centroId: number) => {
  const [centroRows]: any = await db.query(
    `SELECT codigo FROM centros WHERE id = ?`,
    [centroId],
  );
  const prefijo = (centroRows[0]?.codigo || "EDU")
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase();

  const [countRows]: any = await db.query(
    `SELECT COUNT(*) AS total FROM centro_usuarios WHERE centro_id = ? AND rol_en_centro = 'profesor'`,
    [centroId],
  );

  let intento = countRows[0].total + 1;
  let codigo = `${prefijo}${String(intento).padStart(3, "0")}`;

  while (true) {
    const [existe]: any = await db.query(
      `SELECT id FROM usuarios WHERE code = ?`,
      [codigo],
    );
    if (existe.length === 0) break;
    intento++;
    codigo = `${prefijo}${String(intento).padStart(3, "0")}`;
  }

  return codigo;
};

const verificarAdmin = async (usuarioId: number, centroId: any) => {
  const [rows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'admin'`,
    [usuarioId, centroId],
  );
  return rows.length > 0;
};

export const BuscarUsuarioPorEmailProfesor = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { centroId, email } = req.query;

  if (!centroId || !email)
    return res.status(400).json({ error: "Faltan datos requeridos" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [rows]: any = await db.query(
      `SELECT id, nombre, apellidos, email, code FROM usuarios WHERE email = ?`,
      [email],
    );

    if (rows.length === 0) {
      return res.json({ existe: false });
    }

    const [yaEnCentro]: any = await db.query(
      `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ?`,
      [rows[0].id, centroId],
    );

    res.json({
      existe: true,
      yaPerteneceAlCentro: yaEnCentro.length > 0,
      usuario: {
        id: rows[0].id,
        nombre: rows[0].nombre,
        apellidos: rows[0].apellidos,
        email: rows[0].email,
        codigo: rows[0].code,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al buscar el usuario" });
  }
};

export const ObtenerAsignaturasParaFormulario = async (req: any, res: any) => {
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
      `SELECT ca.id AS curso_asignatura_id, a.nombre AS asignatura, cc.curso, r.nombre AS rama
       FROM curso_asignaturas ca
       JOIN asignaturas a ON a.id = ca.asignatura_id
       JOIN centro_cursos cc ON cc.id = ca.curso_id
       LEFT JOIN ramas r ON r.id = ca.rama_id
       WHERE cc.centro_id = ?
       ORDER BY cc.curso, a.nombre`,
      [centroId],
    );

    res.json(
      rows.map((r: any) => ({
        cursoAsignaturaId: r.curso_asignatura_id,
        etiqueta: r.rama
          ? `${r.asignatura} - ${r.curso} - ${r.rama}`
          : `${r.asignatura} - ${r.curso}`,
      })),
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener las asignaturas" });
  }
};

export const CrearProfesorNuevo = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { centroId, nombre, apellidos, email, cursoAsignaturaIds } = req.body;

  if (
    !centroId ||
    !nombre ||
    !email ||
    !Array.isArray(cursoAsignaturaIds) ||
    cursoAsignaturaIds.length === 0
  ) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [existeEmail]: any = await db.query(
      `SELECT id FROM usuarios WHERE email = ?`,
      [email],
    );
    if (existeEmail.length > 0) {
      return res.status(409).json({
        error:
          "Ya existe una cuenta con ese correo. Usa la opcion de buscar profesor existente.",
      });
    }

    const codigo = await generarCodigo(centroId);
    const passwordPlano = generarPassword();
    const passwordHash = await bcrypt.hash(passwordPlano, 10);

    const [result]: any = await db.query(
      `INSERT INTO usuarios (nombre, apellidos, email, code, password) VALUES (?, ?, ?, ?, ?)`,
      [nombre, apellidos || null, email, codigo, passwordHash],
    );

    const [cuResult]: any = await db.query(
      `INSERT INTO centro_usuarios (user_id, centro_id, rol_en_centro) VALUES (?, ?, 'profesor')`,
      [result.insertId, centroId],
    );

    for (const caId of cursoAsignaturaIds) {
      await db.query(
        `INSERT INTO profesor_asignaturas (centro_usuario_id, curso_asignatura_id) VALUES (?, ?)`,
        [cuResult.insertId, caId],
      );
    }

    const [asigRows]: any = await db.query(
      `SELECT a.nombre AS asignatura, cc.curso
       FROM curso_asignaturas ca
       JOIN asignaturas a ON a.id = ca.asignatura_id
       JOIN centro_cursos cc ON cc.id = ca.curso_id
       WHERE ca.id IN (?)`,
      [cursoAsignaturaIds],
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      apellidos,
      email,
      codigo,
      asignaturas: asigRows
        .map((a: any) => `${a.asignatura} (${a.curso})`)
        .join(", "),
      password: passwordPlano,
      esNuevo: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear el profesor" });
  }
};

export const AnadirProfesorExistente = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { centroId, profesorId, cursoAsignaturaIds } = req.body;

  if (
    !centroId ||
    !profesorId ||
    !Array.isArray(cursoAsignaturaIds) ||
    cursoAsignaturaIds.length === 0
  ) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [yaEnCentro]: any = await db.query(
      `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ?`,
      [profesorId, centroId],
    );
    if (yaEnCentro.length > 0) {
      return res
        .status(409)
        .json({ error: "Este profesor ya pertenece a este centro" });
    }

    const [cuResult]: any = await db.query(
      `INSERT INTO centro_usuarios (user_id, centro_id, rol_en_centro) VALUES (?, ?, 'profesor')`,
      [profesorId, centroId],
    );

    for (const caId of cursoAsignaturaIds) {
      await db.query(
        `INSERT INTO profesor_asignaturas (centro_usuario_id, curso_asignatura_id) VALUES (?, ?)`,
        [cuResult.insertId, caId],
      );
    }

    const [userRows]: any = await db.query(
      `SELECT nombre, apellidos, email, code FROM usuarios WHERE id = ?`,
      [profesorId],
    );
    const [asigRows]: any = await db.query(
      `SELECT a.nombre AS asignatura, cc.curso
       FROM curso_asignaturas ca
       JOIN asignaturas a ON a.id = ca.asignatura_id
       JOIN centro_cursos cc ON cc.id = ca.curso_id
       WHERE ca.id IN (?)`,
      [cursoAsignaturaIds],
    );

    res.status(201).json({
      id: profesorId,
      nombre: userRows[0].nombre,
      apellidos: userRows[0].apellidos,
      email: userRows[0].email,
      codigo: userRows[0].code,
      asignaturas: asigRows
        .map((a: any) => `${a.asignatura} (${a.curso})`)
        .join(", "),
      password: null,
      esNuevo: false,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al añadir el profesor" });
  }
};
