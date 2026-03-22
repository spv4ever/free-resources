import Filament from '../models/Filament.js';

const normalizePayload = (payload = {}) => ({
  ...payload,
  diameter: payload.diameter === '' || payload.diameter == null ? undefined : Number(payload.diameter),
  spoolWeightKg: payload.spoolWeightKg === '' || payload.spoolWeightKg == null ? undefined : Number(payload.spoolWeightKg),
  nozzleTempMin: payload.nozzleTempMin === '' || payload.nozzleTempMin == null ? undefined : Number(payload.nozzleTempMin),
  nozzleTempMax: payload.nozzleTempMax === '' || payload.nozzleTempMax == null ? undefined : Number(payload.nozzleTempMax),
  bedTempMin: payload.bedTempMin === '' || payload.bedTempMin == null ? undefined : Number(payload.bedTempMin),
  bedTempMax: payload.bedTempMax === '' || payload.bedTempMax == null ? undefined : Number(payload.bedTempMax),
  isActive: payload.isActive === false || payload.isActive === 'false' ? false : Boolean(payload.isActive),
});

export const getPublicFilaments = async (req, res) => {
  try {
    const filaments = await Filament.find({ isActive: true }).sort({ brand: 1, name: 1, colorName: 1 });
    res.json(filaments);
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar los filamentos', error: error.message });
  }
};

export const getAdminFilaments = async (req, res) => {
  try {
    const filaments = await Filament.find().sort({ createdAt: -1 });
    res.json(filaments);
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar los filamentos', error: error.message });
  }
};

export const getFilamentBySlug = async (req, res) => {
  try {
    const filament = await Filament.findOne({ slug: req.params.slug, isActive: true });
    if (!filament) return res.status(404).json({ message: 'Filamento no encontrado' });
    res.json(filament);
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar el filamento', error: error.message });
  }
};

export const createFilament = async (req, res) => {
  try {
    const filament = new Filament(normalizePayload(req.body));
    const saved = await filament.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el filamento', error: error.message });
  }
};

export const updateFilament = async (req, res) => {
  try {
    const filament = await Filament.findById(req.params.id);
    if (!filament) return res.status(404).json({ message: 'Filamento no encontrado' });

    Object.assign(filament, normalizePayload(req.body));
    const saved = await filament.save();
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el filamento', error: error.message });
  }
};

export const deleteFilament = async (req, res) => {
  try {
    const filament = await Filament.findByIdAndDelete(req.params.id);
    if (!filament) return res.status(404).json({ message: 'Filamento no encontrado' });
    res.json({ message: 'Filamento eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el filamento', error: error.message });
  }
};
