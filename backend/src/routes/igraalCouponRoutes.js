import express from 'express';
import multer from 'multer';
import { uploadAndAnalyzeCoupon, acceptCoupon, getPendingCoupons, rejectCoupon, getAcceptedCoupons } from '../controllers/igraalCouponController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('image'), uploadAndAnalyzeCoupon);
router.get('/pending', getPendingCoupons);
router.post('/:id/accept', acceptCoupon);
router.post('/:id/reject', rejectCoupon);

// Ruta pública para frontend
router.get('/', getAcceptedCoupons);

export default router;
