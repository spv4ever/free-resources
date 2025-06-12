import KeikoPromptOptionGroup from '../models/KeikoPromptOptionGroup.js';

export const getAllGroups = async (req, res) => {
  try {
    const groups = await KeikoPromptOptionGroup.find().sort({ name: 1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los grupos' });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { name, label, multiple } = req.body;
    const group = new KeikoPromptOptionGroup({ name, label, multiple });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear el grupo' });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const updated = await KeikoPromptOptionGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el grupo' });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const deleted = await KeikoPromptOptionGroup.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Grupo no encontrado' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el grupo' });
  }
};
