import { OAuth2Client } from "google-auth-library";
import { db } from "../config/db";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (token: string) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const email = payload?.email;

  const [users]: any = await db.query(
    `SELECT * FROM usuarios WHERE email = ?`,
    [email],
  );

  const user = users[0];

  if (!user) throw new Error("Usuario no encontrado");

  const [centros]: any = await db.query(
    `SELECT c.*, cu.rol_en_centro 
     FROM centros c
     JOIN centro_usuarios cu ON cu.centro_id = c.id
     WHERE cu.user_id = ?`,
    [user.id],
  );

  const tokenJWT = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  return {
    token: tokenJWT,
    user: {
      id: user.id,
      email: user.email,
      code: user.code,
      nombre: user.nombre,
      apellidos: user.apellidos,
    },
    centros,
  };
};
