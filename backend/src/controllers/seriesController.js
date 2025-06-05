import Series from '../models/Series.js';
import {
  searchSeriesInTMDb,
  getSeriesDetailsFromTMDb
} from '../services/fetchFromTMDb.js';
import { getAvailabilityFromWatchmode } from '../services/fetchFromWatchmode.js';
import WeeklyTopSeries from '../models/WeeklyTopSeries.js';
import syncWeeklyTop from '../services/syncWeeklyTop.js';
import { ensureCategoryExists } from '../services/ensureCategoryExists.js';

// 🔍 Buscar series en TMDb
export const searchSeries = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Parámetro de búsqueda requerido' });

  try {
    const results = await searchSeriesInTMDb(q);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Error al buscar series', error: err.message });
  }
};

// ⬇️ Importar una serie y guardarla en MongoDB
export const importSeries = async (req, res) => {
  const { tmdbId } = req.params;

  try {
    // Evitar duplicados
    const exists = await Series.findOne({ tmdbId: parseInt(tmdbId) });
    if (exists) return res.status(200).json({ message: 'Serie ya importada', series: exists });

    // Obtener datos de TMDb
    const seriesData = await getSeriesDetailsFromTMDb(tmdbId);

    // Obtener disponibilidad desde Watchmode
    if (seriesData.imdbId) {
      const availability = await getAvailabilityFromWatchmode(seriesData.imdbId);
      seriesData.availability = availability;
    }

    if (seriesData.genres?.length > 0) {
        const categoryId = await ensureCategoryExists(seriesData.genres[0]);
        seriesData.category = categoryId;
        }

    const newSeries = await Series.create(seriesData);
    res.status(201).json(newSeries);
  } catch (err) {
    res.status(500).json({ message: 'Error al importar serie', error: err.message });
  }
};

// 📦 Obtener los detalles de una serie ya guardada
export const getSeriesDetails = async (req, res) => {
  const { tmdbId } = req.params;

  try {
    const series = await Series.findOne({ tmdbId: parseInt(tmdbId) });
    if (!series) return res.status(404).json({ message: 'Serie no encontrada' });

    res.json(series);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener serie', error: err.message });
  }
};

// 📊 Obtener el top semanal más reciente (ajustado automáticamente a Madrid)
export const getWeeklyTop = async (req, res) => {
  try {
    const { week } = req.query;

    let query = {};

    if (week) {
      // Convertimos la fecha seleccionada como lunes local en Madrid
      const madridStart = new Date(
        new Date(`${week}T00:00:00`).toLocaleString('en-US', { timeZone: 'Europe/Madrid' })
      );

      madridStart.setHours(0, 0, 0, 0);

      const utcStart = new Date(madridStart.toISOString());
      const utcEnd = new Date(utcStart);
      utcEnd.setUTCDate(utcEnd.getUTCDate() + 1);

      query.week = { $gte: utcStart, $lte: utcEnd };

      console.log('🕵️‍♂️ Buscando entre:', utcStart.toISOString(), 'y', utcEnd.toISOString());
    }

    const results = await WeeklyTopSeries
      .find(query)
      .sort({ week: -1 })
      .limit(1)
      .populate('seriesRankings.seriesId');

    const ranking = results[0];

    if (!ranking) {
      return res.status(404).json({ message: 'No se encontró ranking para esa semana' });
    }

    const result = ranking.seriesRankings.map(entry => ({
      rank: entry.rank,
      ...entry.seriesId.toObject()
    }));

    // const result = ranking.seriesRankings.map(entry => {
    //   const serie = entry.seriesId.toObject();
    //   return {
    //     _id: serie._id, // <- asegúralo
    //     rank: entry.rank,
    //     tmdbId: serie.tmdbId,
    //     title: serie.title,
    //     image: serie.image,
    //     availability: serie.availability || []
    //   };
    // });

    res.json({
      week: ranking.week,
      top: result
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el ranking semanal', error: err.message });
  }
};



// 📅 Listar todas las semanas para las que hay ranking semanal
export const getAvailableWeeks = async (req, res) => {
  try {
    const weeks = await WeeklyTopSeries
      .find({}, { week: 1, _id: 0 })
      .sort({ week: -1 });

    const formatted = weeks.map(entry =>
      entry.week.toISOString().split('T')[0] // "YYYY-MM-DD"
    );

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las semanas disponibles', error: err.message });
  }
};

// 📈 Histórico de posiciones semanales de una serie
export const getSeriesWeeklyHistory = async (req, res) => {
  const { tmdbId } = req.params;

  try {
    const series = await Series.findOne({ tmdbId: parseInt(tmdbId) });
    if (!series) return res.status(404).json({ message: 'Serie no encontrada' });

    const history = await WeeklyTopSeries.find({
      'seriesRankings.seriesId': series._id
    }).sort({ week: -1 });

    const result = history.map(entry => {
      const found = entry.seriesRankings.find(r => r.seriesId.equals(series._id));
      return {
        week: entry.week.toISOString().split('T')[0],
        rank: found?.rank || null
      };
    });

    res.json({
      tmdbId: series.tmdbId,
      title: series.title,
      appearances: result.length,
      history: result
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al consultar historial', error: err.message });
  }
};

// 📊 Series con más apariciones en el top semanal
export const getTopHistoricalSeries = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const top = await Series.find({ topAppearances: { $gt: 0 } })
      .sort({ topAppearances: -1, voteAverage: -1 })
      .limit(limit);

    res.json(top);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el top histórico', error: err.message });
  }
};



export const triggerWeeklyTopSync = async (req, res) => {
  try {
    await syncWeeklyTop();
    res.status(200).json({ message: 'Sincronización semanal completada con éxito' });
  } catch (err) {
    res.status(500).json({ message: 'Error al ejecutar sincronización', error: err.message });
  }
};

// 🔄 Actualizar una serie manualmente desde TMDb y Watchmode
export const updateSeries = async (req, res) => {
  const { tmdbId } = req.params;

  try {
    const seriesData = await getSeriesDetailsFromTMDb(tmdbId);

    // Volver a obtener disponibilidad (si tiene imdbId)
    if (seriesData.imdbId) {
      const availability = await getAvailabilityFromWatchmode(seriesData.imdbId);
      seriesData.availability = availability;
    }

    // Asignar categoría si aún no tiene y hay géneros
    if (seriesData.genres?.length > 0) {
    const categoryId = await ensureCategoryExists(seriesData.genres[0]);
    seriesData.category = categoryId;
    }

    const updated = await Series.findOneAndUpdate(
    { tmdbId: parseInt(tmdbId) },
    seriesData,
    { new: true, upsert: false }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Serie no encontrada para actualizar' });
    }

    res.json({ message: 'Serie actualizada correctamente', updated });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar la serie', error: err.message });
  }
};
