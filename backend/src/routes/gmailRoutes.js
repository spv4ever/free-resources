// Tu archivo de rutas (ej: routes/gmail.js)

import express from 'express';
import axios from 'axios';
import { importEmails } from '../services/gmailService.js'; // Asumo que este servicio existe
import EmailImportContext from '../models/EmailImportContext.js'; // Tu modelo, sin cambios
import GmailToken from '../models/GmailToken.js'; // El nuevo modelo de tokens
import { getValidAccessToken } from '../services/authService.js'; // El nuevo servicio de autenticación

const router = express.Router();

// ---- RUTAS DE AUTORIZACIÓN (Se usan solo una vez o si se revoca el permiso) ----

// 1. Ruta para obtener la URL de autorización de Google
router.get('/auth-url', (req, res) => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GMAIL_CLIENT_ID}&redirect_uri=${process.env.GMAIL_REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/gmail.readonly&access_type=offline&prompt=consent`;
  res.json({ authUrl });
});

// 2. Ruta de callback que Google llama después de la autorización
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Falta el parámetro "code"');

  try {
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: process.env.GMAIL_CLIENT_ID,
        client_secret: process.env.GMAIL_CLIENT_SECRET,
        redirect_uri: process.env.GMAIL_REDIRECT_URI,
        grant_type: 'authorization_code',
      },
    });

    const tokens = tokenResponse.data;
    if (!tokens.refresh_token) {
      return res.status(400).send('Error crítico: No se recibió el refresh_token de Google. Inténtalo de nuevo y asegúrate de dar tu consentimiento.');
    }

    const expiryDate = new Date(Date.now() + (tokens.expires_in * 1000));

    // Guardamos los tokens en nuestro modelo dedicado.
    // 'upsert: true' crea el documento si no existe, o lo actualiza si ya existe.
    await GmailToken.findOneAndUpdate(
      { identifier: 'primary_gmail_account' },
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: expiryDate,
      },
      { upsert: true, new: true }
    );

    res.send('✅ ¡Autorización completada y tokens guardados! Ya puedes cerrar esta ventana.');
  } catch (err) {
    console.error('❌ Error al intercambiar el code por tokens:', err.response?.data || err.message);
    res.status(500).send('Error al obtener y guardar los tokens.');
  }
});


// ---- RUTA DE OPERACIÓN PRINCIPAL ----

// 3. Ruta para importar emails. Esta es la que usarás regularmente.
router.post('/import/:context', async (req, res) => {
  const { context } = req.params;

  try {
    // PASO A: Obtener un token de acceso válido. ¡La magia ocurre aquí!
    const accessToken = await getValidAccessToken();

    // PASO B: Obtener la configuración del contexto (el 'searchTerm').
    const contextDoc = await EmailImportContext.findOne({ context, active: true });
    if (!contextDoc) {
      return res.status(404).json({ error: 'Contexto no encontrado o inactivo' });
    }

    // PASO C: Ejecutar la importación pasando el token válido.
    const result = await importEmails({
      searchTerm: contextDoc.searchTerm,
      context: contextDoc.context,
      accessToken: accessToken, // Pasamos el token fresco al servicio
    });

    // Actualizamos la fecha de última importación en el contexto.
    contextDoc.lastImportedAt = new Date();
    await contextDoc.save();

    res.json({ context, ...result });

  } catch (err) {
    console.error(`❌ Error en la importación para el contexto [${context}]:`, err.message);
    res.status(500).json({ error: err.message || 'Error al importar correos' });
  }
});

router.get('/token-status', async (req, res) => {
  try {
    const tokenDoc = await GmailToken.findOne({ identifier: 'primary_gmail_account' });

    if (!tokenDoc) {
      return res.status(404).json({ 
        status: 'No Autorizado',
        message: 'No se encontraron tokens. Por favor, completa el flujo de autorización.' 
      });
    }

    const now = new Date();
    const expiryDate = new Date(tokenDoc.tokenExpiry);
    const timeLeftMs = expiryDate.getTime() - now.getTime();
    const minutesLeft = Math.floor(timeLeftMs / (1000 * 60));
    const isExpired = timeLeftMs <= 0;

    res.json({
      status: isExpired ? 'Expirado' : 'Válido',
      expiresAt: expiryDate.toLocaleString('es-ES'), // Muestra la fecha en formato local
      minutesRemaining: minutesLeft,
      lastUpdated: tokenDoc.updatedAt.toLocaleString('es-ES'),
    });

  } catch (error) {
    res.status(500).json({ error: 'Error al consultar el estado del token.' });
  }
});

export default router;