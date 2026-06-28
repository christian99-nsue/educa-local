import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (
  email: string,
  resetLink: string,
) => {
  await transporter.sendMail({
    from: `"Educa Local" <${process.env.EMAIL_USER}>`,
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
