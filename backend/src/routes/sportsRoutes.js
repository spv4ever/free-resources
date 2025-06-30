import express from 'express';
import { getTodayEvents } from '../controllers/sportsController.js';

const router = express.Router();

router.get('/events/today', getTodayEvents);

export default router;
