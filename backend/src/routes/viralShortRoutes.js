import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import {
  getAllViralShorts,
  createViralShort,
  deleteViralShort,
  getShortsBySubcategoria
} from '../controllers/viralShortController.js';
import { syncViralShorts, syncSingleCategory, } from '../jobs/syncViralShorts.js';

const router = express.Router();

router.get('/', getAllViralShorts);
router.post('/', protect, admin, createViralShort);
router.delete('/:id', protect, admin, deleteViralShort);

// Ruta protegida para forzar sincronización manual
router.post('/admin/sync-viral-shorts', protect, admin, async (req, res) => {
    await syncViralShorts();
    res.json({ message: 'Sincronización completa' });
  });

  router.post('/admin/sync-viral-shorts/:id', protect, admin, async (req, res) => {
    try {
      await syncSingleCategory(req.params.id);
      res.json({ message: '✅ Categoría sincronizada correctamente' });
    } catch (err) {
      res.status(500).json({ message: '❌ Error al sincronizar la categoría', error: err.message });
    }
  });

router.get('/subcategoria/:subcat', getShortsBySubcategoria);

export default router;
