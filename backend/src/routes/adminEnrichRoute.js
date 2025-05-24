import express from 'express';
import enrichNextLaunch from '../scripts/enrichNextLaunch.js';

const router = express.Router();

router.post('/admin/enrich-one-launch', async (req, res) => {
  try {
    await enrichNextLaunch(false); // ❗ NO cerramos conexión desde aquí
    res.status(200).json({ message: '✅ Enriquecimiento ejecutado correctamente' });
  } catch (err) {
    res.status(500).json({ message: '❌ Error al enriquecer el lanzamiento', error: err.message });
  }
});

export default router;

