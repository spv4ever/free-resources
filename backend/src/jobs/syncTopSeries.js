import { fetchTopSeries } from '../services/fetchTopSeries.js';
import { saveTopList } from '../controllers/topSeriesController.js';

const PLATFORMS = {
  general: null,
  netflix: 203,
  disney: 372,
  hbo: 387,
  prime: 26
};

export const syncTopSeries = async () => {
  console.log('[TOP SYNC] Iniciando sincronización de series populares...');

  for (const [name, sourceId] of Object.entries(PLATFORMS)) {
    const seriesList = await fetchTopSeries({ sourceId });

    if (seriesList.length > 0) {
      await saveTopList(name, seriesList);
      console.log(`✅ Guardado top para: ${name}`);
    } else {
      console.warn(`⚠️ No se pudo obtener el top para: ${name}`);
    }
  }

  console.log('[TOP SYNC] Sincronización completa.');
};
