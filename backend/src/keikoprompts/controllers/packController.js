import KeikoPromptPack from '../models/KeikoPromptPack.js';
import KeikoPrompt     from '../models/KeikoPrompt.js';

// Obtener todos los packs
export const getAllPacks = async (req, res) => {
  try {
    const packs = await KeikoPromptPack.find().sort({ createdAt: -1 });
    res.json(packs);
  } catch (err) {
    console.error('❌ Error al obtener packs:', err);
    res.status(500).json({ error: 'Error al obtener los packs' });
  }
};

// Obtener pack por ID
export const getPackById = async (req, res) => {
  try {
    const pack = await KeikoPromptPack.findById(req.params.id);
    if (!pack) return res.status(404).json({ error: 'Pack no encontrado' });
    res.json(pack);
  } catch (err) {
    console.error('❌ Error al obtener pack:', err);
    res.status(500).json({ error: 'Error al obtener el pack' });
  }
};

// Crear nuevo pack
export const createPack = async (req, res) => {
  try {
    const { title, description, category, image } = req.body;

    if (!title) return res.status(400).json({ error: 'El título es obligatorio' });

    const newPack = new KeikoPromptPack({
      title,
      description,
      category,
      image
    });

    await newPack.save();
    res.status(201).json(newPack);
  } catch (err) {
    console.error('❌ Error al crear pack:', err);
    res.status(400).json({ error: 'Error al crear el pack' });
  }
};

// Actualizar pack
export const updatePack = async (req, res) => {
  try {
    const updated = await KeikoPromptPack.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        image: req.body.image
      },
      { new: true }
    );
    console.log('PUT /packs/:id', req.params.id);
    console.log('Body:', req.body);
    if (!updated) return res.status(404).json({ error: 'Pack no encontrado' });

    res.json(updated);
  } catch (err) {
    console.error('❌ Error al actualizar pack:', err);
    res.status(400).json({ error: 'Error al actualizar el pack' });
  }
};

// Eliminar pack y sus prompts asociados
export const deletePack = async (req, res) => {
  try {
    const packId = req.params.id;

    await KeikoPrompt.deleteMany({ packId });
    await KeikoPromptPack.findByIdAndDelete(packId);

    res.status(204).end();
  } catch (err) {
    console.error('❌ Error al eliminar pack y prompts:', err);
    res.status(500).json({ error: 'Error al eliminar el pack y sus prompts' });
  }
};

// Obtener resumen de prompts por categoría
export const getPromptCountsByCategory = async (req, res) => {
  try {
    const packCollectionName = KeikoPromptPack.collection.name;

    const counts = await KeikoPrompt.aggregate([
      {
        $lookup: {
          from: packCollectionName,
          localField: 'packId',
          foreignField: '_id',
          as: 'packInfo'
        }
      },
      { $unwind: '$packInfo' },
      {
        $group: {
          _id: '$packInfo.category',
          promptCount: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          promptCount: 1,
          _id: 0
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.json(counts);
  } catch (err) {
    console.error('❌ Error al obtener resumen por categoría:', err);
    res.status(500).json({ error: 'Error al obtener el resumen por categoría' });
  }
};
