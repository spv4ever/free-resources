// src/controllers/imagenesPublicasController.js
import ImagenGenerada from '../models/ImagenGenerada.js';

export const obtenerImagenesPublicas = async (req, res) => {
  try {
    const imagenes = await ImagenGenerada.find({
      public: true,
      status: 'completada'
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'promptRef',
        populate: { path: 'packId' }
      })
      .populate('user', 'nickname');

    const agrupadasPorPack = {};

    for (const img of imagenes) {
      const packTitle = img.promptRef?.packId?.title || 'Pack desconocido';

      if (!agrupadasPorPack[packTitle]) {
        agrupadasPorPack[packTitle] = [];
      }

      if (agrupadasPorPack[packTitle].length < 50) {
        agrupadasPorPack[packTitle].push({
          _id: img._id,
          prompt: img.prompt,
          finalUrl: img.finalUrl,
          createdAt: img.createdAt,
          promptScene: img.promptRef?.scene || 'Sin título',
          packTitle,
          nickname: img.user?.nickname || 'Anónimo'
        });
      }
    }

    res.json(agrupadasPorPack);
  } catch (error) {
    console.error('❌ Error al obtener imágenes públicas:', error.message);
    res.status(500).json({ error: 'No se pudieron obtener las imágenes públicas' });
  }
};
