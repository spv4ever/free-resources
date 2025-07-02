import ImagenGenerada from '../models/ImagenGenerada.js';
import { v2 as cloudinary } from 'cloudinary';

export const eliminarImagen = async (req, res) => {
  try {
    const imagen = await ImagenGenerada.findById(req.params.id);
    if (!imagen) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (imagen.filename && imagen.filename.includes('/')) {
      try {
        const resultadoCloudinary = await cloudinary.uploader.destroy(imagen.filename);
        console.log(`☁️ Eliminada en Cloudinary:`, resultadoCloudinary);
      } catch (e) {
        console.warn(`⚠️ Error al eliminar en Cloudinary:`, e.message);
      }
    }

    await imagen.deleteOne();

    return res.json({ message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
