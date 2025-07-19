import { GifFavorito } from '../models/GifFavorito.js';

export const addFavorito = async (req, res) => {
  try {
    const { gifId, url } = req.body;
    const userId = req.user._id;

    const existe = await GifFavorito.findOne({ user: userId, gifId });
    if (existe) return res.status(400).json({ message: 'Ya está en favoritos.' });

    const favorito = new GifFavorito({ user: userId, gifId, url });
    await favorito.save();

    res.status(201).json(favorito);
  } catch (err) {
    res.status(500).json({ message: 'Error al guardar favorito' });
  }
};

export const removeFavorito = async (req, res) => {
  try {
    const { gifId } = req.params;
    const userId = req.user._id;

    await GifFavorito.findOneAndDelete({ user: userId, gifId });

    res.status(200).json({ message: 'Eliminado de favoritos' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar favorito' });
  }
};

export const getFavoritos = async (req, res) => {
  try {
    const userId = req.user._id;
    const favoritos = await GifFavorito.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(favoritos);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener favoritos' });
  }
};
