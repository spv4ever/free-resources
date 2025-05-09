import express from 'express';
import { getEmailEntries, markAsReviewed, approveForPost } from '../controllers/adminEmailEntryController.js';

const router = express.Router();

router.get('/', getEmailEntries);
router.patch('/:id/review', markAsReviewed);
router.patch('/:id/approve', approveForPost);

export default router;
