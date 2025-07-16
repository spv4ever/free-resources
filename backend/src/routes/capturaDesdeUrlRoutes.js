import express from 'express';
import { capturarDesdeUrl } from '../controllers/capturaDesdeUrlController.js';

const router = express.Router();

router.post('/', capturarDesdeUrl);

export default router;
