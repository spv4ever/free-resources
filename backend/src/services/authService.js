// services/authService.js
import axios from 'axios';
import GmailToken from '../models/GmailToken.js';

/**
 * Obtiene un accessToken de Gmail válido, refrescándolo automáticamente si es necesario.
 * @returns {Promise<string>} Una promesa que resuelve al accessToken válido.
 */
export async function getValidAccessToken() {
  const tokenDoc = await GmailToken.findOne({ identifier: 'primary_gmail_account' });

  if (!tokenDoc) {
    throw new Error('La aplicación no ha sido autorizada con Google. Por favor, usa la ruta de autorización primero.');
  }

  // Comprobamos si el token ha expirado o lo hará en los próximos 60 segundos (margen de seguridad).
  const isExpired = new Date() >= new Date(tokenDoc.tokenExpiry.getTime() - 60000);

  if (!isExpired) {
    console.log('👍 Token de Gmail válido encontrado en la base de datos.');
    return tokenDoc.accessToken;
  }

  // --- El token ha expirado, hay que refrescarlo ---
  console.log('♻️  El token de Gmail ha expirado. Refrescando automáticamente...');
  
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        client_id: process.env.GMAIL_CLIENT_ID,
        client_secret: process.env.GMAIL_CLIENT_SECRET,
        refresh_token: tokenDoc.refreshToken,
        grant_type: 'refresh_token',
      },
    });

    const newTokens = response.data;
    const newExpiryDate = new Date(Date.now() + (newTokens.expires_in * 1000));

    // Actualizamos el documento en la base de datos con el nuevo token y la nueva fecha de expiración.
    tokenDoc.accessToken = newTokens.access_token;
    tokenDoc.tokenExpiry = newExpiryDate;
    await tokenDoc.save();

    console.log('✅ Token refrescado y guardado en la base de datos.');
    return tokenDoc.accessToken;

  } catch (error) {
    console.error('❌ Error fatal al refrescar el token de Gmail:', error.response?.data || error.message);
    // Si esto falla, es probable que el refresh_token haya sido revocado por el usuario.
    // La única solución es una re-autorización manual.
    throw new Error('No se pudo refrescar el token. La aplicación podría necesitar ser autorizada de nuevo.');
  }
}