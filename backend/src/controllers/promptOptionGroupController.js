// controllers/promptOptionGroupController.js
import PromptOptionGroup from '../models/PromptOptionGroup.js';

// ➕ Crear grupo de opciones
export const createOptionGroup = async (req, res) => {
  try {
    const group = new PromptOptionGroup(req.body);
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 📚 Obtener todos los grupos
export const getAllOptionGroups = async (req, res) => {
  try {
    const groups = await PromptOptionGroup.find().sort({ name: 1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Actualizar grupo
export const updateOptionGroup = async (req, res) => {
  try {
    const group = await PromptOptionGroup.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🗑️ Eliminar grupo
export const deleteOptionGroup = async (req, res) => {
  try {
    const group = await PromptOptionGroup.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json({ message: 'Grupo eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
