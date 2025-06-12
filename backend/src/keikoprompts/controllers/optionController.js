import KeikoPromptOption from '../models/KeikoPromptOption.js';

export const getOptionsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const options = await KeikoPromptOption.find({ group: groupId }).sort({ label: 1 });
    res.json(options);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener opciones' });
  }
};

export const createOption = async (req, res) => {
  try {
    const { group, name, label } = req.body;
    const option = new KeikoPromptOption({ group, name, label });
    await option.save();
    res.status(201).json(option);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear opción' });
  }
};

export const updateOption = async (req, res) => {
  try {
    const updated = await KeikoPromptOption.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Opción no encontrada' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar opción' });
  }
};

export const deleteOption = async (req, res) => {
  try {
    const deleted = await KeikoPromptOption.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Opción no encontrada' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar opción' });
  }
};
