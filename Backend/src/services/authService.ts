import { db } from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async (identifier: string, password: string) => {
  type CentroRaw = {
    centro_id: number;
    centro_nombre: string;
    rol_en_centro: string;
  };
  const cleanIdentifier = identifier?.trim();

  if (!cleanIdentifier || !password) {
    throw new Error("Correo/codigo y contrasena requeridos");
  }

  const sql = `
    SELECT * FROM usuarios 
    WHERE email = ? OR code = ?
  `;

  const [rows]: any = await db.query(sql, [cleanIdentifier, cleanIdentifier]);

  if (rows.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  const user = rows[0];

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new Error("Contraseña incorrecta");
  }

  const [centrosRaw] = (await db.query(
    `
  SELECT 
    c.id AS centro_id,
    c.nombre AS centro_nombre,
    cu.rol_en_centro
  FROM centro_usuarios cu
  JOIN centros c ON cu.centro_id = c.id
  WHERE cu.user_id = ?
  `,
    [user.id],
  )) as any;
  const centros = centrosRaw.map((c: CentroRaw) => ({
    id: c.centro_id,
    nombre: c.centro_nombre,
    rol: c.rol_en_centro,
  }));
  const centrosUnicos = Array.from(
    new Map(centros.map((c: { id: any }) => [c.id, c])).values(),
  );

  const token = jwt.sign(
    {
      id: user.id,
      centros: centrosUnicos,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" },
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      code: user.code,
      nombre: user.nombre,
      apellidos: user.apellidos,
    },
    centros: centrosUnicos,
    token,
  };
};
