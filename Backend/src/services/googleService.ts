import { OAuth2Client } from "google-auth-library";
import { db } from "../config/db";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (token: string) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  const email = payload?.email;
  const name = payload?.name;

  const [users]: any = await db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
  );

  let user = users[0];

  const tokenJWT = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  return { token: tokenJWT };
};
