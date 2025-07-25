import express from 'express';
import { recibirPostbackCpx } from '../controllers/cpxController.js';

const router = express.Router();

router.get('/cpx', recibirPostbackCpx);

export default router;
