import express from 'express';
import axios from 'axios';
import { importEmails } from '../services/gmailService.js';
import EmailImportContext from '../models/EmailImportContext.js';

const router = express.Router();

// Ruta para iniciar la autorización
router.get('/auth-url', (req, res) => {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const redirectUri = process.env.GMAIL_REDIRECT_URI;

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/gmail.readonly&access_type=offline&prompt=consent`;

  res.json({ authUrl });
});

// Ruta para manejar el callback con el "code"
router.get('/callback', async (req, res) => {
  const code = req.query.code;
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
    console.log('🔐 Tokens recibidos:', tokens);

    res.json(tokens); // puedes guardarlos si quieres
  } catch (err) {
    console.error('❌ Error al intercambiar el code por tokens:', err.response?.data || err.message);
    res.status(500).send('Error al obtener tokens');
  }
});

// Ruta para importar emails con contexto
router.post('/import/:context', async (req, res) => {
  const { context } = req.params;

  try {
    const contextDoc = await EmailImportContext.findOne({ context, active: true });
    if (!contextDoc) {
      return res.status(404).json({ error: 'Contexto no encontrado o inactivo' });
    }

    const result = await importEmails({
      searchTerm: contextDoc.searchTerm,
      context: contextDoc.context
    });

    res.json({ context, ...result });
  } catch (err) {
    console.error('❌ Error en importación manual:', err.message);
    res.status(500).json({ error: 'Error al importar correos' });
  }
});

export default router;
