import { google } from 'googleapis';
import dotenv from 'dotenv';
import YoutubeToken from '../models/youtubeTokenModel.js';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.YT_CLIENT_ID,
  process.env.YT_CLIENT_SECRET,
  process.env.YT_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube'
];

export const getYoutubeAuthUrl = (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'select_account consent'
  });
  res.redirect(authUrl);
};

export const handleYoutubeCallback = async (req, res) => {
  const { code, userId } = req.query;

  if (!code || !userId) return res.status(400).send('Faltan parámetros: code o userId');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const me = await youtube.channels.list({ mine: true, part: 'snippet' });

    const channel = me.data.items?.[0];
    if (!channel) return res.status(404).send('❌ No se encontró canal');

    const channelId = channel.id;
    const channelTitle = channel.snippet?.title || 'Sin nombre';

    await YoutubeToken.findOneAndUpdate(
      { channelId }, // clave única
      {
        userId, // ✅ se guarda el usuario que autorizó el canal
        userEmail: channel.snippet?.customUrl || 'desconocido',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        expiry_date: new Date(tokens.expiry_date),
        channelId,
        channelTitle
      },
      { upsert: true, new: true }
    );

    res.send(`✅ Canal autorizado correctamente: ${channelTitle}`);
  } catch (err) {
    console.error('Error en callback OAuth:', err.response?.data || err.message || err);
    res.status(500).send('Error al procesar el callback de Google');
  }
};

