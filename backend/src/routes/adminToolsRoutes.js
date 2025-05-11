import express from 'express';
import { fetchTodayImage } from '../jobs/fetchNasaImage.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { getAllUsers } from '../controllers/authController.js'; // o donde tengas getAllUsers
import { updateUserByAdmin } from '../controllers/authController.js';

const router = express.Router();

// Ejecutar manualmente la descarga de la imagen del día
router.post('/trigger-nasa', protect, admin, async (req, res) => {
  try {
    await fetchTodayImage();
    res.status(200).json({ message: '🛰️ Job ejecutado manualmente' });
  } catch (error) {
    console.error('Error forzando job NASA:', error);
    res.status(500).json({ message: '❌ Error al ejecutar el job' });
  }
});

import { fetchMissingImagesForMonth } from '../jobs/fetchMissingImagesForMonth.js';

router.post('/fetch-nasa-month', protect, admin, async (req, res) => {
  const { year, month } = req.body;

  if (!year || !month) {
    return res.status(400).json({ message: 'Se requiere año y mes' });
  }

  try {
    const resultado = await fetchMissingImagesForMonth(year, month);
    res.json(resultado);
  } catch (err) {
    console.error('Error en fetch mensual:', err);
    res.status(500).json({ message: 'Error al buscar imágenes del mes' });
  }
});

router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id', protect, admin, updateUserByAdmin);

export default router;
