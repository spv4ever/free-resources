import mongoose from 'mongoose';
delete mongoose.connection.models['AnimeCharacter']; // 👈 Limpia el modelo cacheado
import AnimeCharacter from '../models/AnimeCharacter.js';

import { fetchTopFemaleCharacters } from '../services/anilistService.js';

export async function updateTopFemaleCharacters(req, res) {
  try {
    const characters = await fetchTopFemaleCharacters();

    await AnimeCharacter.deleteMany(); // limpia tabla antes de guardar
    await AnimeCharacter.insertMany(characters);

    res.status(200).json({ success: true, count: characters.length });
  } catch (err) {
    console.error('Error actualizando personajes:', err.message);
    res.status(500).json({ error: 'Error al actualizar personajes' });
  }
}

export const getAllCharacters = async (req, res) => {
  try {
    const characters = await AnimeCharacter.find({})
      .sort({ favourites: -1 }) // opcional: ordenar por popularidad
      .limit(500); // puedes ajustar o quitar este límite

    res.json(characters);
  } catch (err) {
    console.error('[ERROR GET CHARACTERS]', err);
    res.status(500).json({ error: 'No se pudieron cargar los personajes' });
  }
};