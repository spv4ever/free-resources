// controllers/promptItemController.js
import PromptItem from '../models/PromptItem.js';

// 🎯 Crear nuevo prompt
export const createPromptItem = async (req, res) => {
  try {
    const prompt = new PromptItem(req.body);
    await prompt.save();
    res.status(201).json(prompt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 📚 Obtener todos los prompts de un pack
export const getPromptItemsByPack = async (req, res) => {
  try {
    const prompts = await PromptItem.find({ pack: req.params.packId }).sort({ number: 1 });
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Obtener prompt por ID
export const getPromptItemById = async (req, res) => {
  try {
    const prompt = await PromptItem.findById(req.params.id);
    if (!prompt) return res.status(404).json({ error: 'Prompt no encontrado' });
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Actualizar prompt
export const updatePromptItem = async (req, res) => {
  try {
    const prompt = await PromptItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!prompt) return res.status(404).json({ error: 'Prompt no encontrado' });
    res.json(prompt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🗑️ Eliminar prompt
export const deletePromptItem = async (req, res) => {
  try {
    const prompt = await PromptItem.findByIdAndDelete(req.params.id);
    if (!prompt) return res.status(404).json({ error: 'Prompt no encontrado' });
    res.json({ message: 'Prompt eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
