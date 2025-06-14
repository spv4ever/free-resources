// src/keikoprompts/routes/duplicateRoutes.js
import express from 'express';
import { listDuplicates, getDuplicateDetails, deleteDuplicates } from '../controllers/duplicateController.js';

const router = express.Router();

router.get('/', listDuplicates);
router.get('/:packId/details', getDuplicateDetails);
router.post('/delete', express.json(), deleteDuplicates);

export default router;
