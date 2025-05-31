import YoutubeToken from '../models/youtubeTokenModel.js';

export const listYoutubeChannels = async (req, res) => {
  try {
    const tokens = await YoutubeToken.find({}, 'channelId channelTitle').lean();
    res.json(tokens);
  } catch (err) {
    console.error('Error al obtener canales de YouTube:', err);
    res.status(500).json({ error: 'Error al obtener canales' });
  }
};
