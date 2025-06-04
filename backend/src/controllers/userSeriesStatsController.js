import UserFavoriteSeries from '../models/UserFavoriteSeries.js';

export const getUserSeriesStats = async (req, res) => {
  const { userId } = req.params;

  try {
    const favorites = await UserFavoriteSeries.find({ userId });
    const totalFavorites = favorites.length;

    let completed = 0;
    let watching = 0;
    let toStart = 0;

    favorites.forEach((fav) => {
      if (fav.markedComplete) {
        completed++;
      } else if (fav.seenEpisodes?.length > 0) {
        watching++;
      } else {
        toStart++;
      }
    });

    res.json({
      favorites: totalFavorites,
      completed,
      watching,
      toStart,
    });
  } catch (error) {
    console.error('Error en getUserSeriesStats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del usuario' });
  }
};

export const getGlobalSeriesStats = async (req, res) => {
  try {
    const allFavorites = await UserFavoriteSeries.find();
    const totalFavorites = allFavorites.length;

    let completed = 0;
    let watching = 0;
    let toStart = 0;
    let addedToday = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    allFavorites.forEach((fav) => {
      if (fav.createdAt >= today) addedToday++;

      if (fav.markedComplete) {
        completed++;
      } else if (fav.seenEpisodes?.length > 0) {
        watching++;
      } else {
        toStart++;
      }
    });

    res.json({
      topFollowed: totalFavorites,
      mostCompleted: completed,
      mostWatching: watching,
      addedToday
    });
  } catch (err) {
    console.error('❌ Error en estadísticas globales de series:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas globales' });
  }
};
