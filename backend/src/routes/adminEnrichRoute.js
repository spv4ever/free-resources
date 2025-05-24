import express from 'express';
import enrichNextLaunch from '../scripts/enrichNextLaunch.js';

const router = express.Router();

router.post('/admin/enrich-one-launch', async (req, res) => {
  const { id } = req.body;

  try {
    await enrichNextLaunch(id);
    res.status(200).json({
      message: id
        ? `✅ Enriquecimiento del lanzamiento ${id} ejecutado correctamente`
        : '✅ Enriquecimiento automático ejecutado correctamente'
    });
  } catch (err) {
    res.status(500).json({
      message: `❌ Error al enriquecer${id ? ` el lanzamiento ${id}` : ''}`,
      error: err.message
    });
  }
});

export default router;

