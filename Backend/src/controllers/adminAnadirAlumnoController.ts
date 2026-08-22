import { db } from "../config/db";
import bcrypt from "bcrypt";
import { registrarActividad } from "../utils/actividadUtil";

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
    `SELECT COUNT(*) AS total FROM centro_usuarios WHERE centro_id = ? AND rol_en_centro = 'alumno'`,
    [centroId],
  );
  const siguiente = (countRows[0].total + 1).toString().padStart(3, "0");

  let codigo = `${prefijo}${siguiente}`;
  let intento = countRows[0].total + 1;

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

export const BuscarUsuarioPorEmail = async (req: any, res: any) => {
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

export const CrearAlumnoNuevo = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { centroId, nombre, apellidos, email, cursoId, ramaId } = req.body;

  if (!centroId || !nombre || !email || !cursoId) {
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
          "Ya existe una cuenta con ese correo. Usa la opcion de buscar alumno existente.",
      });
    }

    const codigo = await generarCodigo(centroId);
    const passwordPlano = generarPassword();
    const passwordHash = await bcrypt.hash(passwordPlano, 10);

    const [result]: any = await db.query(
      `INSERT INTO usuarios (nombre, apellidos, email, code, password) VALUES (?, ?, ?, ?, ?)`,
      [nombre, apellidos || null, email, codigo, passwordHash],
    );

    await db.query(
      `INSERT INTO centro_usuarios (user_id, centro_id, rol_en_centro, curso_id, rama_id)
       VALUES (?, ?, 'alumno', ?, ?)`,
      [result.insertId, centroId, cursoId, ramaId || null],
    );

    const [cursoRows]: any = await db.query(
      `SELECT curso FROM centro_cursos WHERE id = ?`,
      [cursoId],
    );

    await registrarActividad(
      centroId,
      "alumno_registrado",
      "Nuevo alumno registrado",
      `${nombre} ${apellidos ?? ""} ha sido registrado como alumno`.trim(),
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      apellidos,
      email,
      codigo,
      curso: cursoRows[0]?.curso ?? "",
      password: passwordPlano,
      esNuevo: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear el alumno" });
  }
};

export const AnadirAlumnoExistente = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { centroId, alumnoId, cursoId, ramaId } = req.body;

  if (!centroId || !alumnoId || !cursoId) {
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
      [alumnoId, centroId],
    );
    if (yaEnCentro.length > 0) {
      return res
        .status(409)
        .json({ error: "Este alumno ya pertenece a este centro" });
    }

    await db.query(
      `INSERT INTO centro_usuarios (user_id, centro_id, rol_en_centro, curso_id, rama_id)
       VALUES (?, ?, 'alumno', ?, ?)`,
      [alumnoId, centroId, cursoId, ramaId || null],
    );

    const [userRows]: any = await db.query(
      `SELECT nombre, apellidos, email, code FROM usuarios WHERE id = ?`,
      [alumnoId],
    );
    const [cursoRows]: any = await db.query(
      `SELECT curso FROM centro_cursos WHERE id = ?`,
      [cursoId],
    );

    await registrarActividad(
      centroId,
      "alumno_registrado",
      "Alumno añadido al centro",
      `${userRows[0].nombre} ${userRows[0].apellidos ?? ""} se ha unido al centro como alumno`.trim(),
    );

    res.status(201).json({
      id: alumnoId,
      nombre: userRows[0].nombre,
      apellidos: userRows[0].apellidos,
      email: userRows[0].email,
      codigo: userRows[0].code,
      curso: cursoRows[0]?.curso ?? "",
      password: null,
      esNuevo: false,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al añadir el alumno" });
  }
};

export const ObtenerCursosParaFormulario = async (req: any, res: any) => {
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
      `SELECT DISTINCT cc.id AS curso_id, cc.curso, cc.nivel, r.id AS rama_id, r.nombre AS rama
       FROM centro_cursos cc
       LEFT JOIN curso_asignaturas ca ON ca.curso_id = cc.id
       LEFT JOIN ramas r ON r.id = ca.rama_id
       WHERE cc.centro_id = ?
       ORDER BY cc.nivel, cc.curso, r.nombre`,
      [centroId],
    );

    const grupos = new Map<string, any>();
    for (const c of cursos) {
      const key = `${c.curso_id}-${c.rama_id ?? "sin-rama"}`;
      if (!grupos.has(key)) {
        grupos.set(key, {
          cursoId: c.curso_id,
          ramaId: c.rama_id,
          etiqueta: c.rama ? `${c.curso} - ${c.rama}` : c.curso,
        });
      }
    }

    res.json(Array.from(grupos.values()));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener los cursos" });
  }
};
