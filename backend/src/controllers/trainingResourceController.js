import TrainingResource from '../models/TrainingResource.js';

export const getAllTrainingResources = async (req, res) => {
  try {
    const resources = await TrainingResource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener recursos' });
  }
};

export const createTrainingResource = async (req, res) => {
  try {
    const nuevo = new TrainingResource(req.body);
    const saved = await nuevo.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Error al crear recurso', error: err });
  }
};

export const updateTrainingResource = async (req, res) => {
  try {
    const updated = await TrainingResource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: 'No encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar' });
  }
};

export const deleteTrainingResource = async (req, res) => {
  try {
    const deleted = await TrainingResource.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Recurso eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar' });
  }
};
