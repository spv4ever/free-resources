// controllers/promptOptionController.js
import PromptOption from '../models/PromptOption.js';

// ➕ Crear nueva opción dentro de un grupo
export const createPromptOption = async (req, res) => {
  try {
    const option = new PromptOption(req.body);
    await option.save();
    res.status(201).json(option);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 📚 Obtener todas las opciones (puede filtrarse por grupo)
export const getAllPromptOptions = async (req, res) => {
  try {
    const filter = req.query.group ? { group: req.query.group } : {};
    const options = await PromptOption.find(filter).sort({ label: 1 }).populate('group');
    res.json(options);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Actualizar opción
export const updatePromptOption = async (req, res) => {
  try {
    const option = await PromptOption.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!option) return res.status(404).json({ error: 'Opción no encontrada' });
    res.json(option);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🗑️ Eliminar opción
export const deletePromptOption = async (req, res) => {
  try {
    const option = await PromptOption.findByIdAndDelete(req.params.id);
    if (!option) return res.status(404).json({ error: 'Opción no encontrada' });
    res.json({ message: 'Opción eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
