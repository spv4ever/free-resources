// src/controllers/imagenesPublicasController.js
import ImagenGenerada from '../models/ImagenGenerada.js';

export const obtenerImagenesPublicas = async (req, res) => {
  try {
    const imagenes = await ImagenGenerada.find({
      public: true,
      status: { $in: ['completada', 'entregada_telegram'] }
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

      if (agrupadasPorPack[packTitle].length < 20) {
        agrupadasPorPack[packTitle].push({
          _id: img._id,
          prompt: img.prompt,
          finalUrl: img.finalUrl,
          createdAt: img.createdAt,
          promptScene: img.promptRef?.scene || 'Sin título',
          packTitle,
          packId: img.promptRef?.packId?._id, // ← añadimos esto
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


// src/controllers/imagenesPublicasController.js

export const obtenerImagenesPorPack = async (req, res) => {
  try {
    const { packId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const imagenes = await ImagenGenerada.find({
      public: true,
      status: { $in: ['completada', 'entregada_telegram'] }
    })
      .populate({
        path: 'promptRef',
        match: { packId },
        populate: { path: 'packId' }
      })
      .populate('user', 'nickname')
      .sort({ createdAt: -1 });

    // Filtrar imágenes que realmente tienen promptRef con el pack deseado
    const filtradas = imagenes.filter(img => img.promptRef && img.promptRef.packId && img.promptRef.packId._id.toString() === packId);

    const paginadas = filtradas.slice(skip, skip + limit);

    res.json({
      total: filtradas.length,
      page,
      totalPages: Math.ceil(filtradas.length / limit),
      images: paginadas.map(img => ({
        _id: img._id,
        prompt: img.prompt,
        finalUrl: img.finalUrl,
        createdAt: img.createdAt,
        promptScene: img.promptRef?.scene || 'Sin título',
        packTitle: img.promptRef?.packId?.title || 'Pack desconocido',
        nickname: img.user?.nickname || 'Anónimo'
      }))
    });
  } catch (error) {
    console.error('❌ Error al obtener imágenes del pack:', error.message);
    res.status(500).json({ error: 'No se pudieron obtener las imágenes del pack' });
  }
};
