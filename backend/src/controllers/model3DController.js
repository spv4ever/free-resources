import Model3D from '../models/Model3D.js';

const normalizeImages = (images = []) => {
  if (!Array.isArray(images)) return [];
  return images
    .map((image) => ({
      url: image?.url?.trim() || '',
      alt: image?.alt?.trim() || '',
      caption: image?.caption?.trim() || '',
    }))
    .filter((image) => image.url);
};

const normalizePayload = (payload = {}) => ({
  ...payload,
  colorsCount: payload.colorsCount === '' || payload.colorsCount == null ? undefined : Number(payload.colorsCount),
  weightGrams: payload.weightGrams === '' || payload.weightGrams == null ? undefined : Number(payload.weightGrams),
  isFeatured: payload.isFeatured === true || payload.isFeatured === 'true',
  isActive: payload.isActive === false || payload.isActive === 'false' ? false : Boolean(payload.isActive),
  tags: Array.isArray(payload.tags)
    ? payload.tags
    : String(payload.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
  secondaryImages: normalizeImages(payload.secondaryImages),
});

export const getPublicModels = async (req, res) => {
  try {
    const models = await Model3D.find({ isActive: true }).sort({ isFeatured: -1, createdAt: -1 });
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar los modelos', error: error.message });
  }
};

export const getAdminModels = async (req, res) => {
  try {
    const models = await Model3D.find().sort({ createdAt: -1 });
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar los modelos', error: error.message });
  }
};

export const getModelBySlug = async (req, res) => {
  try {
    const model = await Model3D.findOne({ slug: req.params.slug, isActive: true });
    if (!model) return res.status(404).json({ message: 'Modelo no encontrado' });
    res.json(model);
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar el modelo', error: error.message });
  }
};

export const createModel = async (req, res) => {
  try {
    const model = new Model3D(normalizePayload(req.body));
    const saved = await model.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el modelo', error: error.message });
  }
};

export const updateModel = async (req, res) => {
  try {
    const model = await Model3D.findById(req.params.id);
    if (!model) return res.status(404).json({ message: 'Modelo no encontrado' });

    Object.assign(model, normalizePayload(req.body));
    const saved = await model.save();
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el modelo', error: error.message });
  }
};

export const deleteModel = async (req, res) => {
  try {
    const model = await Model3D.findByIdAndDelete(req.params.id);
    if (!model) return res.status(404).json({ message: 'Modelo no encontrado' });
    res.json({ message: 'Modelo eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el modelo', error: error.message });
  }
};
