import express from 'express';
import { getTokenBalance, getUserTokenHistory } from '../controllers/tokenController.js';
import { updateUserBalance, getUserBalanceById } from '../controllers/tokenController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/balance', protect, getTokenBalance);
router.get('/history', protect, getUserTokenHistory);
router.get('/balance/:userId', protect, admin, getUserBalanceById);
router.put('/balance/:userId', protect, admin, updateUserBalance);

export default router;
