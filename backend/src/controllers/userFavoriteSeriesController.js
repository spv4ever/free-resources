import UserFavoriteSeries from '../models/UserFavoriteSeries.js';


export const addFavoriteSeries = async (req, res) => {
  const { seriesId } = req.params;
  const userId = req.user.id;

  try {
    const exists = await UserFavoriteSeries.findOne({ userId, seriesId });
    if (exists) return res.status(400).json({ message: 'Ya está en favoritos' });

    const newEntry = new UserFavoriteSeries({ userId, seriesId });
    await newEntry.save();

    res.json({ message: 'Añadida a favoritos' });
  } catch (err) {
    res.status(500).json({ error: 'Error al añadir a favoritos' });
  }
};

export const removeFavoriteSeries = async (req, res) => {
  const { seriesId } = req.params;
  const userId = req.user.id;

  try {
    await UserFavoriteSeries.deleteOne({ userId, seriesId });
    res.json({ message: 'Eliminada de favoritos' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar de favoritos' });
  }
};

export const getUserFavorites = async (req, res) => {
  const userId = req.user.id;

  try {
    const favorites = await UserFavoriteSeries.find({ userId }).populate('seriesId');
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
};

export const markEpisodeSeen = async (req, res) => {
  const { seriesId } = req.params;
  const { seasonNumber, episodeNumber } = req.body;
  const userId = req.user.id;

  try {
    const favorito = await UserFavoriteSeries.findOne({ userId, seriesId });
    if (!favorito) return res.status(404).json({ error: 'No está en favoritos' });

    const key = `${seasonNumber}-${episodeNumber}`;
    const existe = favorito.seenEpisodes.some(
      e => `${e.seasonNumber}-${e.episodeNumber}` === key
    );

    if (existe) {
      favorito.seenEpisodes = favorito.seenEpisodes.filter(
        e => `${e.seasonNumber}-${e.episodeNumber}` !== key
      );
    } else {
      favorito.seenEpisodes.push({ seasonNumber, episodeNumber });
    }

    await favorito.save();
    res.json({ message: existe ? 'Episodio desmarcado' : 'Episodio marcado como visto' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar episodio' });
  }
};


export const markSeasonSeen = async (req, res) => {
  const { seriesId, seasonNumber } = req.params;
  const { episodes } = req.body;
  const userId = req.user.id;

  try {
    const favorito = await UserFavoriteSeries.findOne({ userId, seriesId });
    if (!favorito) return res.status(404).json({ error: 'No está en favoritos' });

    const keys = new Set(episodes.map(ep => `${seasonNumber}-${ep}`));
    const yaMarcados = favorito.seenEpisodes.filter(e =>
      keys.has(`${e.seasonNumber}-${e.episodeNumber}`)
    );

    if (yaMarcados.length === episodes.length) {
      // Todos vistos => desmarcar
      favorito.seenEpisodes = favorito.seenEpisodes.filter(
        e => !keys.has(`${e.seasonNumber}-${e.episodeNumber}`)
      );
    } else {
      // Marcar solo los que faltan
      const existentes = new Set(
        favorito.seenEpisodes.map(e => `${e.seasonNumber}-${e.episodeNumber}`)
      );
      episodes.forEach(ep => {
        const key = `${seasonNumber}-${ep}`;
        if (!existentes.has(key)) {
          favorito.seenEpisodes.push({ seasonNumber: +seasonNumber, episodeNumber: ep });
        }
      });
    }

    await favorito.save();
    res.json({ message: 'Temporada actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar temporada' });
  }
};


export const markSeriesComplete = async (req, res) => {
  const { seriesId } = req.params;
  const userId = req.user.id;

  try {
    const favorito = await UserFavoriteSeries.findOne({ userId, seriesId });
    if (!favorito) return res.status(404).json({ error: 'No está en favoritos' });

    favorito.markedComplete = !favorito.markedComplete;

    if (!favorito.markedComplete) {
      // Desmarcar también episodios vistos
      favorito.seenEpisodes = [];
    }

    await favorito.save();
    res.json({ message: favorito.markedComplete ? 'Serie marcada completa' : 'Serie desmarcada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar serie completa' });
  }
};


export const checkIfFavorite = async (req, res) => {
  const { seriesId } = req.params;
  const userId = req.user.id;

  try {
    const exists = await UserFavoriteSeries.exists({ userId, seriesId });
    res.json({ isFavorite: Boolean(exists) });
  } catch (err) {
    res.status(500).json({ error: 'Error al comprobar favorito' });
  }
};

export const getFavoriteSeriesDetails = async (req, res) => {
  const { seriesId } = req.params;
  const userId = req.user.id;

  try {
    const favorito = await UserFavoriteSeries.findOne({ userId, seriesId });

    if (!favorito) {
      return res.json({
        isFavorite: false,
        seenEpisodes: [],
        markedComplete: false
      });
    }

    res.json({
      isFavorite: true,
      seenEpisodes: favorito.seenEpisodes || [],
      markedComplete: favorito.markedComplete || false
    });
  } catch (err) {
    console.error('Error al consultar estado favorito:', err);
    res.status(500).json({ error: 'Error al consultar estado favorito' });
  }
};

export const unmarkEpisodeSeen = async (req, res) => {
  const userId = req.user.id;
  const seriesId = req.params.id;
  const { seasonNumber, episodeNumber } = req.body;

  if (seasonNumber === undefined || episodeNumber === undefined) {
    return res.status(400).json({ error: 'Faltan datos del episodio' });
  }

  try {
    const favorite = await UserFavoriteSeries.findOneAndUpdate(
      { userId, seriesId },
      {
        $pull: {
          seenEpisodes: {
            seasonNumber: parseInt(seasonNumber),
            episodeNumber: parseInt(episodeNumber),
          }
        },
        $set: { markedComplete: false }
      },
      { new: true }
    );

    if (!favorite) {
      return res.status(404).json({ error: 'No se encontró la serie en favoritos' });
    }

    res.json({ success: true, updated: favorite });
  } catch (err) {
    console.error('❌ Error al desmarcar episodio:', err);
    res.status(500).json({ error: 'Error interno al desmarcar episodio' });
  }
};



export const unmarkSeriesComplete = async (req, res) => {
  const userId = req.user.id;
  const seriesId = req.params.id;

  try {
    const favorite = await UserFavoriteSeries.findOneAndUpdate(
      { userId, seriesId },
      {
        $set: {
          markedComplete: false,
          seenEpisodes: []
        }
      },
      { new: true }
    );

    if (!favorite) {
      return res.status(404).json({ error: 'No se encontró la serie en favoritos' });
    }

    res.json({ success: true, updated: favorite });
  } catch (err) {
    res.status(500).json({ error: 'Error al desmarcar serie completa' });
  }
};


export const unmarkSeasonSeen = async (req, res) => {
  const userId = req.user.id;
  const seriesId = req.params.id;
  const season = parseInt(req.params.season);

  try {
    const favorite = await UserFavoriteSeries.findOneAndUpdate(
      { userId, seriesId },
      {
        $pull: {
          seenEpisodes: { seasonNumber: season }
        },
        $set: { markedComplete: false }
      },
      { new: true }
    );

    if (!favorite) {
      return res.status(404).json({ error: 'No se encontró la serie en favoritos' });
    }

    res.json({ success: true, updated: favorite });
  } catch (err) {
    res.status(500).json({ error: 'Error al desmarcar temporada' });
  }
};


