// routes/keikoImportRoutes.js
import express from 'express';
import { importKeikoFromJson, importKeikoPreviewFromJson } from '../controllers/keikoImportController.js';
import { admin, protect } from '../middlewares/authMiddleware.js';
import {
  exportPackById
} from '../controllers/keikoExportController.js';
import { exportAllPacks } from '../controllers/keikoExportController.js';

const router = express.Router();

router.post('/import-preview', protect, admin, importKeikoPreviewFromJson);
router.post('/import-confirmed', protect, admin, importKeikoFromJson); // renombrar si deseas

// Exportación
router.get('/export-pack/:packId', protect, admin, exportPackById);
router.get('/export-all', protect, admin, exportAllPacks);


export default router;
