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
        const lastFav = await UserFavoriteSeries.findOne({
          seriesId: entry._id,
          createdAt: entry.lastAddedAt
        }).populate('userId', 'nickname');
        const followers = await UserFavoriteSeries.find({ seriesId: entry._id })
            .populate('userId', 'nickname');

        const followerNicknames = followers.map(f => f.userId.nickname);
        const serie = await Series.findById(entry._id);

        return {
          tmdbId: serie.tmdbId,
          title: serie.title,
          image: serie.image,
          availability: serie.availability || [],
          addedBy: lastFav?.userId?.nickname || 'Anónimo',
          addedAt: entry.lastAddedAt,
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
