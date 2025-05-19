import Series from '../models/Series.js';
import TopSeriesHistory from '../models/TopSeriesHistory.js';

/**
 * Guarda un top diario (general o por plataforma)
 * @param {String} type - puede ser 'general', 'netflix', 'disney+', etc.
 * @param {Array} seriesList - lista de series con datos de la API externa
 */
export const saveTopList = async (type, seriesList) => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const historyDate = new Date(date);

  const seriesRankings = [];

  for (let i = 0; i < seriesList.length; i++) {
    const data = seriesList[i];
    const { externalId, imdbId, title } = data;

    let existing = await Series.findOne({ externalId });

    if (!existing) {
      existing = await Series.create({
        externalId,
        imdbId,
        title,
        year: data.year,
        synopsis: data.synopsis,
        image: data.image,
        platform: data.platform || type, // si no viene, usar el tipo como plataforma base
        genres: data.genres || [],
        totalSeasons: data.totalSeasons || null,
        episodes: data.episodes || []
      });
    }

    seriesRankings.push({
      seriesId: existing._id,
      rank: i + 1
    });
  }

  await TopSeriesHistory.findOneAndUpdate(
    { date: historyDate, type },
    { seriesRankings },
    { upsert: true }
  );
};

/**
 * Devuelve el top de un día específico
 * @route GET /api/tops?type=netflix&date=2025-05-18
 */
export const getTopByDate = async (req, res) => {
  try {
    const { type = 'general', date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0); // normalizar

    const result = await TopSeriesHistory.findOne({ type, date: targetDate })
      .populate('seriesRankings.seriesId');

    if (!result) return res.status(404).json({ message: 'No hay datos para ese día' });

    const response = result.seriesRankings.map(entry => ({
      rank: entry.rank,
      ...entry.seriesId.toObject()
    }));

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el top', error: err.message });
  }
};
