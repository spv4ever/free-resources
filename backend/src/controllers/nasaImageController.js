import NasaImage from '../models/NasaImage.js';

export const getNasaImages = async (req, res) => {
  try {
    const images = await NasaImage.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener imágenes de la NASA' });
  }
};

export const getLatestNasaImage = async (req, res) => {
  try {
    const image = await NasaImage.findOne({ media_type: 'image' }).sort({ fecha: -1 });

    if (!image) return res.status(404).json({ message: 'No hay imágenes disponibles' });

    res.json(image);
  } catch (err) {
    console.error('Error al obtener la última imagen:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createNasaImage = async (req, res) => {
  try {
    const nueva = new NasaImage(req.body);
    const saved = await nueva.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear imagen', error });
  }
};

export const updateNasaImage = async (req, res) => {
  try {
    const updated = await NasaImage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: 'No encontrada' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar imagen' });
  }
};

export const deleteNasaImage = async (req, res) => {
  try {
    const deleted = await NasaImage.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'No encontrada' });
    res.json({ message: 'Imagen eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar imagen' });
  }
};
