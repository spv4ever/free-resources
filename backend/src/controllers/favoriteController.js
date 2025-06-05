import UserFavoriteSeries from '../models/UserFavoriteSeries.js';
import Series from '../models/Series.js';
import User from '../models/User.js';

export const getLatestFavorites = async (req, res) => {
  try {
    const latest = await UserFavoriteSeries.aggregate([
      {
        $group: {
          _id: '$seriesId',
          lastAddedAt: { $max: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { lastAddedAt: -1 } },
      { $limit: 20 }
    ]);

    const enriched = await Promise.all(
      latest.map(async (entry) => {
        const firstFav = await UserFavoriteSeries.findOne({
            seriesId: entry._id
            }).sort({ createdAt: 1 }).populate('userId', 'nickname');
        const followers = await UserFavoriteSeries.find({ seriesId: entry._id })
            .populate('userId', 'nickname');

        const followerNicknames = followers.map(f => f.userId.nickname);
        const serie = await Series.findById(entry._id);

        return {
          _id: serie._id, // ✅ Este campo es necesario para toggleFavorite
          tmdbId: serie.tmdbId,
          title: serie.title,
          image: serie.image,
          availability: serie.availability || [],
          addedBy: firstFav?.userId?.nickname || 'Anónimo', // <-- primer usuario
          addedAt: entry.lastAddedAt,                       // <-- último añadido (para orden)
          totalFavorites: entry.count,
          followerNicknames
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error('❌ Error en favoritos agrupados:', err);
    res.status(500).json({ error: 'Error al obtener favoritos únicos' });
  }
};
