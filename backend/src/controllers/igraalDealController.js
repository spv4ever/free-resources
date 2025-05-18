import IgraalDeal from '../models/IgraalDeal.js';

export const getIgraalDeals = async (req, res) => {
  try {
    const deals = await IgraalDeal.find().sort({ createdAt: -1 });
    res.json(deals);
  } catch (err) {
    console.error('Error al obtener los chollos iGraal:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
