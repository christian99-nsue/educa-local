import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { db } from "../config/db";
import { sendPasswordResetEmail } from "../services/emailService";

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email requerido" });
      return;
    }

    const [users]: any = await db.query(
      `SELECT * FROM usuarios WHERE email = ?`,
      [email],
    );

    if (users.length === 0) {
      // Por seguridad respondemos igual aunque no exista el usuario
      res.json({ message: "Si el correo existe recibirás un email" });
      return;
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Eliminar tokens anteriores del mismo email
    await db.query(`DELETE FROM password_resets WHERE email = ?`, [email]);

    // Guardar nuevo token
    await db.query(
      `INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)`,
      [email, token, expiresAt],
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetLink);

    res.json({ message: "Si el correo existe recibirás un email" });
  } catch (err: any) {
    console.error("Error forgotPassword:", err);
    res.status(500).json({ message: "Error al procesar la solicitud" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ message: "Token y contraseña requeridos" });
      return;
    }

    const [resets]: any = await db.query(
      `SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()`,
      [token],
    );

    if (resets.length === 0) {
      res.status(400).json({ message: "Token inválido o expirado" });
      return;
    }

    const { email } = resets[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(`UPDATE usuarios SET password = ? WHERE email = ?`, [
      hashedPassword,
      email,
    ]);

    await db.query(`DELETE FROM password_resets WHERE token = ?`, [token]);

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err: any) {
    console.error("Error resetPassword:", err);
    res.status(500).json({ message: "Error al actualizar la contraseña" });
  }
};
