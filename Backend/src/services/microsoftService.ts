import { db } from "../config/db";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const microsoftTenantId = process.env.MICROSOFT_TENANT_ID;
const microsoftClientId = process.env.MICROSOFT_CLIENT_ID;

const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${microsoftTenantId}/discovery/v2.0/keys`,
});

const getSigningKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
  if (!header.kid) {
    callback(new Error("Token Microsoft sin key id"));
    return;
  }

  client.getSigningKey(header.kid, (error, key) => {
    if (error || !key) {
      callback(error || new Error("No se pudo obtener la clave Microsoft"));
      return;
    }

    callback(null, key.getPublicKey());
  });
};

const verifyMicrosoftIdToken = (idToken: string) => {
  if (!microsoftTenantId || !microsoftClientId) {
    throw new Error("Microsoft Auth no está configurado en el backend");
  }

  return new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(
      idToken,
      getSigningKey,
      {
        algorithms: ["RS256"],
        audience: microsoftClientId,
        issuer: `https://login.microsoftonline.com/${microsoftTenantId}/v2.0`,
      },
      (error, decoded) => {
        if (error) {
          reject(error);
          return;
        }

        if (!decoded || typeof decoded === "string") {
          reject(new Error("Token Microsoft inválido"));
          return;
        }

        resolve(decoded);
      },
    );
  });
};

export const microsoftLogin = async (idToken: string) => {
  const payload = await verifyMicrosoftIdToken(idToken);
  const email = payload.email || payload.preferred_username || payload.upn;

  if (!email || typeof email !== "string") {
    throw new Error("El token Microsoft no contiene correo electrónico");
  }

  const [users]: any = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);

  if (users.length === 0) {
    throw new Error("No existe un usuario registrado con ese correo Microsoft");
  }

  const user = users[0];

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
