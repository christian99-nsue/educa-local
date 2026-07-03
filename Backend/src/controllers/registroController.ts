import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import { db } from "../config/db";

interface CentroPayload {
  nombre_del_centro: string;
  tipo_de_centro: string;
  pais: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  email: string;
}

interface AdminPayload {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  password: string;
}

interface EstructuraPayload {
  niveles: Record<string, boolean>;
  cursos: Record<string, string[]>;
}

interface ConfiguracionPayload {
  anoAcademico: string;
  idiomaSistema: string;
  zonaHoraria: string;
  sistemaCalificacion: string;
  inicioAnoAcademico: string;
}

interface RegistrarCentroBody {
  centro: CentroPayload;
  admin: AdminPayload;
  estructura: EstructuraPayload;
  configuracion: ConfiguracionPayload;
}

//COnvierte cualquier fecha Iso a "YYYY_MM_DD"
function formatearFechaSQL(fechaISO: string): string {
  return fechaISO.split("T")[0];
}

//Genera codigo del centro
function generarCodigoCentro(): string {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letraAleatoria = letras[Math.floor(Math.random() * letras.length)];
  const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
  return `${letraAleatoria}${numeroAleatorio}`;
}

async function generarCodigoCentroUnico(
  connection: PoolConnection,
): Promise<string> {
  let codigo: string;
  let existe = true;

  do {
    codigo = generarCodigoCentro();
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT id FROM usuarios WHERE code = ? LIMIT 1`,
      [codigo],
    );
    existe = rows.length > 0;
  } while (existe);
  return codigo;
}

//COdigo de usuario (alumno/profesor/admin)
function generarInicialesCentro(nombreCentro: string, maxLetras = 3): string {
  const palabras = nombreCentro
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 2);

  const iniciales = palabras
    .map((p) => p[0].toUpperCase())
    .slice(0, maxLetras)
    .join("");

  return iniciales || "CTR";
}

function generarCodigoUsuario(inicilaesCentro: string): string {
  const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
  return `${inicilaesCentro}${numeroAleatorio}`;
}

async function generarCodigoUsuarioUnico(
  connection: PoolConnection,
  inicialesCentro: string,
): Promise<string> {
  let codigo: string;
  let existe = true;

  do {
    codigo = generarCodigoUsuario(inicialesCentro);
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT id FROM usuarios WHERE code = ? LIMIT 1`,
      [codigo],
    );
    existe = rows.length > 0;
  } while (existe);
  return codigo;
}

export const registrarCentro = async (
  req: Request<{}, {}, RegistrarCentroBody>,
  res: Response,
): Promise<void> => {
  const { centro, admin, estructura, configuracion } = req.body;
  const connection: PoolConnection = await db.getConnection();

  try {
    await connection.beginTransaction();

    //1. Generar codigo unico del centro y Crear el centro
    const codigoCentro = await generarCodigoCentroUnico(connection);
    const [centroResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO centros (codigo, nombre, tipo_de_centro, pais, ciudad, direccion, telefono, email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigoCentro,
        centro.nombre_del_centro,
        centro.tipo_de_centro,
        centro.pais,
        centro.ciudad,
        centro.direccion,
        centro.telefono,
        centro.email,
      ],
    );
    const centroId = centroResult.insertId;

    //2. Crear el usuario administrador
    const inicialesCentro = generarInicialesCentro(centro.nombre_del_centro);
    const codigoUsuario = await generarCodigoUsuarioUnico(
      connection,
      inicialesCentro,
    );
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const [usuarioResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO usuarios (code, nombre, apellidos, email, telefono, password)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [
        codigoUsuario,
        admin.nombre,
        admin.apellidos,
        admin.correo,
        admin.telefono,
        hashedPassword,
      ],
    );
    const usuarioId = usuarioResult.insertId;

    //3. Vincular usuario-centro con rol admin
    await connection.query(
      `INSERT INTO centro_usuarios (centro_id, user_id, rol_en_centro)
            VALUES (?, ?, 'admin')`,
      [centroId, usuarioId],
    );

    //4. Guardar configuracion del centro
    await connection.query(
      `INSERT INTO centro_configuracion (centro_id, ano_academico, idioma_sistema, zona_horaria, sistema_calificacion, inicio_ano_academico)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [
        centroId,
        configuracion.anoAcademico,
        configuracion.idiomaSistema,
        configuracion.zonaHoraria,
        configuracion.sistemaCalificacion,
        formatearFechaSQL(configuracion.inicioAnoAcademico),
      ],
    );

    //5. Guardar niveles y cursos
    for (const [nivel, activo] of Object.entries(estructura.niveles)) {
      if (!activo) continue;
      const cursosDelNivel = estructura.cursos[nivel] ?? [];
      for (const curso of cursosDelNivel) {
        await connection.query(
          `INSERT INTO centro_cursos (centro_id, nivel, curso) VALUES (?, ?, ?)`,
          [centroId, nivel, curso],
        );
      }
    }

    await connection.commit();
    res.status(201).json({ centroId, usuarioId, codigoCentro, codigoUsuario });
  } catch (error) {
    await connection.rollback();
    console.error("Error al registrar el centro:", error);
    res.status(500).json({ error: "No se pudo completar el registro" });
  } finally {
    connection.release();
  }
};
