import cron from 'node-cron';
import { fetchTopFemaleCharacters } from '../services/anilistService.js';
import AnimeCharacter from '../models/AnimeCharacter.js';

cron.schedule('0 3 1 * *', async () => {
  console.log('[CRON] Actualizando Top 50 personajes femeninos (AniList)...');
  try {
    const characters = await fetchTopFemaleCharacters();
    await AnimeCharacter.deleteMany();
    await AnimeCharacter.insertMany(characters);
    console.log(`[CRON] Actualización completada: ${characters.length} personajes guardados.`);
  } catch (err) {
    console.error('[CRON] Error al actualizar personajes:', err.message);
  }
});
