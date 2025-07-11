import express from 'express';
import { enviarResumenDiario } from '../services/motogp-notifier.js';

const router = express.Router();

router.get('/force-summary', async (req, res) => {
  try {
    await enviarResumenDiario();
    res.status(200).json({ ok: true, message: 'Resumen diario enviado manualmente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al enviar el resumen diario.' });
  }
});

export default router;