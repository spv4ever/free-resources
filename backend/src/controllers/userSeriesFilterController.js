import UserFavoriteSeries from '../models/UserFavoriteSeries.js';

export const getUserSeriesByStatus = async (req, res) => {
  const { userId, status } = req.query;

  try {
    const all = await UserFavoriteSeries.find({ userId }).populate('seriesId');

    let filtered;
    switch (status) {
      case 'favorites':
        filtered = all;
        break;
      case 'completed':
        filtered = all.filter(s => s.markedComplete);
        break;
      case 'watching':
        filtered = all.filter(s => !s.markedComplete && s.seenEpisodes?.length > 0);
        break;
      case 'to-start':
        filtered = all.filter(s => !s.markedComplete && (!s.seenEpisodes || s.seenEpisodes.length === 0));
        break;
      default:
        filtered = [];
    }

    res.json(filtered);
  } catch (err) {
    console.error('Error en getUserSeriesByStatus:', err);
    res.status(500).json({ error: 'Error al filtrar series del usuario' });
  }
};
