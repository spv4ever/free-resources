import express from 'express';
import { renderShareSerie } from '../controllers/shareController.js';

const router = express.Router();

router.get('/series/:id', renderShareSerie);

export default router;
