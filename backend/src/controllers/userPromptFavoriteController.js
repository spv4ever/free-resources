// controllers/userPromptFavoriteController.js
import UserPromptFavorite from '../models/UserPromptFavorite.js';

// ➕ Añadir prompt a favoritos
export const addFavorite = async (req, res) => {
  try {
    const { userId, promptId } = req.body;

    const exists = await UserPromptFavorite.findOne({ user: userId, prompt: promptId });
    if (exists) return res.status(400).json({ error: 'Ya está en favoritos' });

    const favorite = new UserPromptFavorite({ user: userId, prompt: promptId });
    await favorite.save();

    res.status(201).json(favorite);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ❌ Quitar de favoritos
export const removeFavorite = async (req, res) => {
  try {
    const { userId, promptId } = req.body;

    const deleted = await UserPromptFavorite.findOneAndDelete({ user: userId, prompt: promptId });
    if (!deleted) return res.status(404).json({ error: 'No estaba en favoritos' });

    res.json({ message: 'Eliminado de favoritos' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📚 Obtener todos los favoritos de un usuario
export const getUserFavorites = async (req, res) => {
  try {
    const { userId } = req.params;
    const favorites = await UserPromptFavorite.find({ user: userId }).populate('prompt');
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
