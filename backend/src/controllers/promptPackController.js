// controllers/promptPackController.js
import PromptPack from '../models/PromptPack.js';
import PromptItem from '../models/PromptItem.js';

// 📦 Crear nuevo pack
export const createPromptPack = async (req, res) => {
  try {
    const pack = new PromptPack(req.body);
    await pack.save();
    res.status(201).json(pack);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 📚 Obtener todos los packs
export const getAllPromptPacks = async (req, res) => {
  try {
    const packs = await PromptPack.find().lean();
    const packsWithCounts = await Promise.all(
      packs.map(async (pack) => {
        const count = await PromptItem.countDocuments({ pack: pack._id });
        return { ...pack, promptCount: count };
      })
    );
    res.json(packsWithCounts);
  } catch (error) {
    console.error('❌ Error al obtener packs:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};



export const getPromptPackById = async (req, res) => {
  try {
    const pack = await PromptPack.findById(req.params.id);
    if (!pack) return res.status(404).json({ error: 'Pack no encontrado' });

    const prompts = await PromptItem.find({ pack: pack._id }).sort({ number: 1 });

    res.json({ pack, prompts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Actualizar pack
export const updatePromptPack = async (req, res) => {
  try {
    const pack = await PromptPack.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!pack) return res.status(404).json({ error: 'Pack no encontrado' });
    res.json(pack);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🗑️ Eliminar pack
export const deletePromptPack = async (req, res) => {
  try {
    const pack = await PromptPack.findByIdAndDelete(req.params.id);
    if (!pack) return res.status(404).json({ error: 'Pack no encontrado' });
    res.json({ message: 'Pack eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
