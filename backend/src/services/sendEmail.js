import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html }) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465, // o 465 si usas SSL
        secure: true, // true para 465
        auth: {
          user: process.env.EMAIL_SENDER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

  const mailOptions = {
    from: `"Keiko Soporte" <no-reply@keikodev.es>`,
    to,
    subject,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${to}`);
  } catch (error) {
    console.error(`❌ Error al enviar email:`, error);
    throw new Error('No se pudo enviar el email');
  }
}
