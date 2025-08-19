import express from 'express';
import {
  getPromptsByPack,
  createPrompt,
  updatePrompt,
  deletePrompt,
  countPromptsByPack,
  countPromptsForOnePack,
  obtenerUltimaImagenGenerada,
  getPromptsByPackPaginated,
  obtenerImagenesDePrompt,
  massDeletePrompts
} from '../controllers/promptController.js';

import { updateMultiplePlatforms } from '../controllers/promptController.js';

const router = express.Router();


// 👇 Primero las rutas más específicas
router.get('/by-pack-paginated/:packId', getPromptsByPackPaginated);

// Listar prompts de un pack
router.get('/by-pack/:packId', getPromptsByPack);

// 🔴 MASS DELETE antes que :id para evitar colisión
router.delete('/mass-delete', massDeletePrompts);

// Conteo de todos los packs
router.get('/count/by-pack', countPromptsByPack);

// Conteo de un pack concreto
router.get('/count/by-pack/:packId', countPromptsForOnePack);
router.put('/mass-update', updateMultiplePlatforms);
// CRUD de prompts
router.post('/', createPrompt);
router.put('/:id', updatePrompt);
router.delete('/:id', deletePrompt);

router.get('/by-pack-paginated/:packId', getPromptsByPackPaginated);

router.get('/ultima-imagen/:promptId', obtenerUltimaImagenGenerada);

router.get('/historial-imagenes/:promptId', obtenerImagenesDePrompt);

router.delete('/api/keiko/prompts/mass-delete', async (req, res) => {
  const { ids } = req.body; // asegúrate de tener body-parser para JSON
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'ids requeridos' });
  }
  await KeikoPrompt.deleteMany({ _id: { $in: ids } });
  res.json({ ok: true, deleted: ids.length });
});

export default router;
