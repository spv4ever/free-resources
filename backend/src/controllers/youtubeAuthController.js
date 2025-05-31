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
  const code = req.query.code;
  if (!code) return res.status(400).send('Código no proporcionado');

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
      { channelId }, // usamos channelId como clave única
      {
        ...tokens,
        channelId,
        channelTitle,
        expiry_date: new Date(tokens.expiry_date)
      },
      { upsert: true, new: true }
    );

    res.send(`✅ Canal autorizado correctamente: ${channelTitle}`);
  } catch (err) {
    console.error('Error en callback OAuth:', err.response?.data || err.message || err);
    res.status(500).send('Error al procesar el callback de Google');
  }
};
