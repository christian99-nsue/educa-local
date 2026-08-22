import { OAuth2Client } from "google-auth-library";
import { db } from "../config/db";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID as string);

export const googleLogin = async (token: string) => {
  type CentroRaw = {
    centro_id: number;
    centro_nombre: string;
    rol_en_centro: string;
    curso_nombre: string;
  };

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID as string,
  });
  const payload = ticket.getPayload();
  const email = payload?.email;

  const [users]: any = await db.query(
    `SELECT * FROM usuarios WHERE email = ?`,
    [email],
  );

  const user = users[0];

  if (!user) throw new Error("Usuario no encontrado");

  const [centrosRaw]: any = await db.query(
    `
    SELECT 
      c.id AS centro_id,
      c.nombre AS centro_nombre,
      cu.rol_en_centro,
      cc.curso AS curso_nombre
    FROM centro_usuarios cu
    JOIN centros c ON cu.centro_id = c.id
    LEFT JOIN centro_cursos cc ON cu.curso_id = cc.id
    WHERE cu.user_id = ?
    `,
    [user.id],
  );
  const centros = centrosRaw.map((c: CentroRaw) => ({
    id: c.centro_id,
    nombre: c.centro_nombre,
    rol: c.rol_en_centro,
    nombre_del_curso: c.curso_nombre,
  }));
  const centrosUnicos = Array.from(
    new Map(centros.map((c: { id: number }) => [c.id, c])).values(),
  );

  const token = jwt.sign(
    {
      id: user.id,
      centros: centrosUnicos,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" },
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      code: user.code,
      nombre: user.nombre,
      apellidos: user.apellidos,
      foto_url: user.foto_url,
    },
    centros: centrosUnicos,
    token,
  };
};
