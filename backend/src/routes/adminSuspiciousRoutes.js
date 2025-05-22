import express from 'express';
import { getSuspiciousAccesses } from '../controllers/suspiciousAccessController.js';

const router = express.Router();

router.get('/', getSuspiciousAccesses);

export default router;
