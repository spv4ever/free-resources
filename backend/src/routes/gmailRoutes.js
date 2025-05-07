import express from 'express';
import { importEmails } from '../services/gmailService.js';
import EmailImportContext from '../models/EmailImportContext.js';

const router = express.Router();

router.post('/import/:context', async (req, res) => {
  const { context } = req.params;

  try {
    const contextDoc = await EmailImportContext.findOne({ context, active: true });
    if (!contextDoc) {
      return res.status(404).json({ error: 'Contexto no encontrado o inactivo' });
    }

    const result = await importEmails({
      searchTerm: contextDoc.searchTerm,
      context: contextDoc.context
    });

    res.json({ context, ...result });
  } catch (err) {
    console.error('❌ Error en importación manual:', err.message);
    res.status(500).json({ error: 'Error al importar correos' });
  }
});

export default router;


