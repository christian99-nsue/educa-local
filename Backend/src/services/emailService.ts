import { Resend } from "resend";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Resend no configurado: falta RESEND_API_KEY");
  }

  const { data, error } = await resend.emails.send({
    from: "Educa Local <onboarding@resend.dev>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Error Resend al enviar correo:", error);
    throw new Error(error.message);
  }

  console.log("Correo enviado correctamente con Resend:", data?.id);
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
