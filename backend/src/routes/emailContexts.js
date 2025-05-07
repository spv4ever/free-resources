import express from 'express';
import EmailImportContext from '../models/EmailImportContext.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const contexts = await EmailImportContext.find().sort({ context: 1 });
  res.json(contexts);
});

router.patch('/:id/toggle', async (req, res) => {
  const ctx = await EmailImportContext.findById(req.params.id);
  if (!ctx) return res.status(404).json({ error: 'No encontrado' });
  ctx.active = !ctx.active;
  await ctx.save();
  res.json(ctx);
});

export default router;

router.post('/', async (req, res) => {
    const { context, searchTerm, frequency } = req.body;
  
    if (!context || !searchTerm) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }
  
    try {
      const exists = await EmailImportContext.findOne({ context });
      if (exists) return res.status(409).json({ error: 'El contexto ya existe.' });
  
      const nuevo = await EmailImportContext.create({
        context,
        searchTerm,
        frequency: frequency || 'daily'
      });
  
      res.status(201).json(nuevo);
    } catch (err) {
      console.error('❌ Error al crear contexto:', err.message);
      res.status(500).json({ error: 'Error al crear contexto.' });
    }
  });

  router.patch('/:id', async (req, res) => {
    const { searchTerm, frequency } = req.body;
  
    try {
      const ctx = await EmailImportContext.findById(req.params.id);
      if (!ctx) return res.status(404).json({ error: 'Contexto no encontrado.' });
  
      if (searchTerm !== undefined) ctx.searchTerm = searchTerm;
      if (frequency !== undefined) ctx.frequency = frequency;
  
      await ctx.save();
      res.json(ctx);
    } catch (err) {
      console.error('❌ Error al editar contexto:', err.message);
      res.status(500).json({ error: 'Error al editar contexto.' });
    }
  });
  
  // Eliminar un contexto por ID
router.delete('/:id', async (req, res) => {
    try {
      const deleted = await EmailImportContext.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Contexto no encontrado' });
      res.json({ message: 'Contexto eliminado correctamente' });
    } catch (err) {
      console.error('❌ Error al eliminar contexto:', err.message);
      res.status(500).json({ error: 'Error al eliminar contexto' });
    }
  });