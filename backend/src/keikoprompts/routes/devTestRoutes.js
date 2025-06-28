import express from 'express';
import KeikoPrompt from '../models/KeikoPrompt.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/test/prompts-by-tematica', async (req, res) => {
  const { packId, tematicaId } = req.query;

  if (!packId || !tematicaId) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    const prompts = await KeikoPrompt.find({
      packId,
      'fixedOptions.tematica': {
        $in: [new mongoose.Types.ObjectId(tematicaId)]
      }
    });

    res.json({ count: prompts.length, prompts });
  } catch (err) {
    console.error('🛑 Error en test:', err);
    res.status(500).json({ error: 'Error en test' });
  }
});

export default router;
