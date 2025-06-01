import YoutubeToken from '../models/youtubeTokenModel.js';

export const listYoutubeChannels = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Falta el parámetro userId' });
  }

  try {
    const tokens = await YoutubeToken.find({ userId }, 'channelId channelTitle').lean();
    res.json(tokens);
  } catch (err) {
    console.error('Error al obtener canales de YouTube:', err);
    res.status(500).json({ error: 'Error al obtener canales' });
  }
};
