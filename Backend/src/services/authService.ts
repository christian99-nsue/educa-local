import { db } from "../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async (identifier: string, password: string) => {
  console.log("1. identifier:", identifier, "| password:", password);
  const sql = `
    SELECT * FROM usuarios 
    WHERE email = ? OR code = ?
  `;

  const [rows]: any = await db.query(sql, [identifier, identifier]);

  console.log("2. Usuarios encontrados:", rows.length);

  if (rows.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  const user = rows[0];
  console.log(
    "3. correo:",
    user.email,
    "| codigo:",
    user.code,
    "| hash en DB:",
    user.password,
  );
  console.log("4. password recibido:", password);

  const match = await bcrypt.compare(password, user.password);
  console.log("5. bcrypt match:", match);

  if (!match) {
    throw new Error("Contraseña incorrecta");
  }

  // 🔥 AQUÍ VIENE LO IMPORTANTE (ROL + CENTRO)

  const [centros]: any = await db.query(
    `
    SELECT cu.rol_en_centro, c.id as centro_id, c.nombre as centro_nombre
    FROM centro_usuarios cu
    JOIN centros c ON cu.centro_id = c.id
    WHERE cu.user_id = ?
    `,
    [user.id],
  );

  const token = jwt.sign(
    {
      id: user.id,
      centros,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" },
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      code: user.code,
    },
    centros,
    token,
  };
};
