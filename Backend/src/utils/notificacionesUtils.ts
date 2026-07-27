import { db } from "../config/db";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface CrearNotificacionParams {
  usuarioId: number;
  tipo:
    | "tarea_publicada"
    | "tarea_calificada"
    | "material_publicado"
    | "tarea_entregada";
  titulo: string;
  mensaje: string;
  enlace?: string;
}

export const crearNotificacion = async ({
  usuarioId,
  tipo,
  titulo,
  mensaje,
  enlace,
}: CrearNotificacionParams) => {
  try {
    await db.query(
      `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, enlace)
       VALUES (?, ?, ?, ?, ?)`,
      [usuarioId, tipo, titulo, mensaje, enlace || null],
    );

    const [userRows]: any = await db.query(
      `SELECT email, nombre FROM usuarios WHERE id = ?`,
      [usuarioId],
    );

    if (userRows.length > 0) {
      const { email, nombre } = userRows[0];
      await transporter.sendMail({
        from: `"Educa Local" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: titulo,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px;">
            <h2 style="color: #2563eb;">${titulo}</h2>
            <p>Hola ${nombre},</p>
            <p>${mensaje}</p>
            ${enlace ? `<p><a href="${enlace}" style="color: #2563eb;">Ver en Educa Local</a></p>` : ""}
            <p style="color: #999; font-size: 12px; margin-top: 20px;">Este es un correo automatico de Educa Local.</p>
          </div>
        `,
      });
    }
  } catch (error) {
    console.log("Error al crear notificacion:", error);
  }
};

export const crearNotificacionesMasivas = async (
  usuarioIds: number[],
  datos: Omit<CrearNotificacionParams, "usuarioId">,
) => {
  await Promise.all(
    usuarioIds.map((usuarioId) => crearNotificacion({ usuarioId, ...datos })),
  );
};
