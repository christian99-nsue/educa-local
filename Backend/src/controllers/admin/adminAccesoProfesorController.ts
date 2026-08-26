import { db } from "../../config/db";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const verificarAdmin = async (usuarioId: number, centroId: any) => {
  const [rows]: any = await db.query(
    `SELECT id FROM centro_usuarios WHERE user_id = ? AND centro_id = ? AND rol_en_centro = 'admin'`,
    [usuarioId, centroId],
  );
  return rows.length > 0;
};

const generarPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 8; i++)
    pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
};

export const RestablecerPasswordProfesor = async (req: any, res: any) => {
  const usuarioId = req.user.id;
  const { profesorId } = req.params;
  const { centroId, enviarPorCorreo } = req.body;

  if (!centroId)
    return res.status(400).json({ error: "centroId es requerido" });

  try {
    if (!(await verificarAdmin(usuarioId, centroId))) {
      return res
        .status(403)
        .json({ error: "No tienes permiso de administrador" });
    }

    const [userRows]: any = await db.query(
      `SELECT nombre, email FROM usuarios WHERE id = ?`,
      [profesorId],
    );
    if (userRows.length === 0) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }

    const passwordNueva = generarPassword();
    const passwordHash = await bcrypt.hash(passwordNueva, 10);

    await db.query(`UPDATE usuarios SET password = ? WHERE id = ?`, [
      passwordHash,
      profesorId,
    ]);

    if (enviarPorCorreo) {
      await transporter.sendMail({
        from: `"Educa Local" <${process.env.EMAIL_USER}>`,
        to: userRows[0].email,
        subject: "Tu contraseña ha sido restablecida",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px;">
            <h2 style="color: #2563eb;">Contraseña restablecida</h2>
            <p>Hola ${userRows[0].nombre},</p>
            <p>Tu contraseña temporal es: <strong style="font-size: 18px;">${passwordNueva}</strong></p>
            <p>Te recomendamos cambiarla en tu proximo acceso.</p>
          </div>
        `,
      });
    }

    res.json({
      passwordTemporal: passwordNueva,
      correoEnviado: !!enviarPorCorreo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al restablecer la contraseña" });
  }
};
