// src/routes/telegram.routes.js
import express from 'express';
import { enviarDesdeMongoATelegram } from '../controllers/telegramController.js';

const router = express.Router();

router.post('/to-telegram-from-db', enviarDesdeMongoATelegram);

export default router;
