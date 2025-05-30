import LinkAnalysis from '../models/LinkAnalysis.js';

export const getAllLinkAnalyses = async (req, res) => {
  const { nivel, resultado, page = 1, limit = 20 } = req.query;
  const query = {};

  if (nivel) query.nivel = nivel;
  if (resultado) query.resultado = resultado;

  const total = await LinkAnalysis.countDocuments(query);
  const analyses = await LinkAnalysis.find(query)
    .sort({ fecha: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('usuarioId', 'name email');

  res.json({
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    data: analyses
  });
};

export const deleteLinkAnalysis = async (req, res) => {
  try {
    const deleted = await LinkAnalysis.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Análisis no encontrado' });

    res.json({ message: 'Análisis eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar análisis' });
  }
};

export const deleteBulkLinkAnalyses = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ message: 'Lista de IDs no válida' });
    }

    const result = await LinkAnalysis.deleteMany({ _id: { $in: ids } });
    res.json({ message: `Se eliminaron ${result.deletedCount} análisis.` });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar en bloque' });
  }
};