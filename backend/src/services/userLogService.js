// src/services/userLogService.js
import RegistroUsuarioLog from '../models/RegistroUsuarioLog.js';
import { sendEmail } from './sendEmail.js';

export const logUserRegistrationAttempt = async ({ email, nickname, success, reason, details }) => {
  try {
    await RegistroUsuarioLog.create({ email, nickname, success, reason, details });

    // Enviar email si fallo
    if (!success) {
      const html = `
        <h3>Intento fallido de registro</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Nickname:</strong> ${nickname}</p>
        <p><strong>Motivo:</strong> ${reason}</p>
        <pre>${JSON.stringify(details, null, 2)}</pre>
      `;

      await sendEmail({
        to: 'info@keikodev.es',
        subject: '🔔 Intento fallido de registro en KeikoDev',
        html
      });
    }
  } catch (err) {
    console.error('❌ Error al registrar intento de usuario:', err);
  }
};
