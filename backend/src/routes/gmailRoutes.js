import express from 'express';
import { importEmails } from '../services/gmailService.js';

const router = express.Router();

// Mapear contextos a consultas de Gmail
const contextMap = {
  ciberestafas: 'subject:"Alerta de Google: ciberestafas"',
  netflix: 'from:(netflix.com)', 
  // Otros contextos futuros se añaden aquí
};

router.post('/import/:context', async (req, res) => {
  const { context } = req.params;
  const searchTerm = contextMap[context];

  if (!searchTerm) {
    return res.status(400).json({ error: 'Contexto inválido' });
  }

  try {
    const result = await importEmails({ searchTerm, context });
    res.json({ context, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al importar correos' });
  }
});

export default router;
