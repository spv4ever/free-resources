// routes/zipRoutes.js
import express from 'express';
import { servirArchivoTemporal } from '../controllers/zipController.js';

const router = express.Router();

router.get('/:filename', servirArchivoTemporal);

export default router;
