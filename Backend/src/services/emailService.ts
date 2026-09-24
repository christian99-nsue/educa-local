import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("SMTP no configurado: faltan EMAIL_USER o EMAIL_PASS");
  }

  const smtpOptions: import("nodemailer/lib/smtp-transport").Options & {
    family: 4;
  } = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
  const transporter = nodemailer.createTransport(smtpOptions);

  try {
    await transporter.sendMail({
      from: `"Educa Local" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error: any) {
    console.error("Error SMTP al enviar correo:", {
      code: error?.code,
      responseCode: error?.responseCode,
      command: error?.command,
      message: error?.message,
    });
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetLink: string,
) => {
  await sendEmail({
    to: email,
    subject: "Recuperación de contraseña",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Recuperar contraseña</h2>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el botón para continuar:</p>
        <a href="${resetLink}" style="
          background-color: #7c3aed;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          display: inline-block;
          margin: 16px 0;
        ">Restablecer contraseña</a>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
        <p>El enlace expira en <strong>1 hora</strong>.</p>
      </div>
    `,
  });
};
