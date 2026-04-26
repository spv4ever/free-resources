import Articulo from '../models/Articulo.js';

const normalizePayload = (payload = {}) => ({
  ...payload,
  precioCoste: Number(payload.precioCoste),
  precioCosteMayorista: Number(payload.precioCosteMayorista),
  pvp: Number(payload.pvp),
  pvpMayorista: Number(payload.pvpMayorista),
  costeProtectora: Number(payload.costeProtectora),
  pvpProtectora: Number(payload.pvpProtectora),
});

export const getArticulosAdmin = async (req, res) => {
  try {
    const articulos = await Articulo.find().sort({ codigo: -1, createdAt: -1 });
    res.json(articulos);
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar los artículos', error: error.message });
  }
};

export const createArticulo = async (req, res) => {
  try {
    const articulo = new Articulo(normalizePayload(req.body));
    const saved = await articulo.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el artículo', error: error.message });
  }
};

export const updateArticulo = async (req, res) => {
  try {
    const articulo = await Articulo.findById(req.params.id);
    if (!articulo) return res.status(404).json({ message: 'Artículo no encontrado' });

    Object.assign(articulo, normalizePayload(req.body));
    const saved = await articulo.save();
    res.json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el artículo', error: error.message });
  }
};

export const deleteArticulo = async (req, res) => {
  try {
    const articulo = await Articulo.findByIdAndDelete(req.params.id);
    if (!articulo) return res.status(404).json({ message: 'Artículo no encontrado' });
    res.json({ message: 'Artículo eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el artículo', error: error.message });
  }
};
