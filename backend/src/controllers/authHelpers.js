import crypto from 'crypto';
import { sendEmail } from '../services/sendEmail.js';
import { logUserRegistrationAttempt } from '../services/userLogService.js';

export const sendVerificationForGoogleUser = async (user) => {
  try {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    // user.isVerified = false;

    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Confirma tu cuenta',
      html: `<p>Gracias por registrarte con Google. <a href="${process.env.FRONTEND_BASE_URL}/verify-email?token=${verificationToken}">Verifica tu correo aquí</a></p>`
    });

    logUserRegistrationAttempt({
      email: user.email,
      nickname: user.nickname,
      success: true,
      source: 'google'
    });
  } catch (error) {
    console.error('❌ Error en envío de verificación por Google:', error);
    logUserRegistrationAttempt({
      email: user.email,
      nickname: user.nickname,
      success: false,
      reason: 'Error al enviar email desde login con Google',
      error: error.message,
      source: 'google'
    });
  }
};
