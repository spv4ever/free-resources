import express from 'express';
import { getIgraalDeals } from '../controllers/igraalDealController.js';
import { fetchIgraalDeals } from '../scripts/fetchIgraalDeals.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getIgraalDeals);

router.get('/fetch', protect, admin, async (req, res) => {
  try {
    await fetchIgraalDeals();
    res.status(200).json({ message: 'Chollos actualizados correctamente.' });
  } catch (err) {
    console.error('Error en fetch manual:', err);
    res.status(500).json({ error: 'Error al actualizar chollos' });
  }
});

export default router;
