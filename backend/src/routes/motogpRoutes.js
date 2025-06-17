// src/routes/motogpRoutes.js
import express from 'express';
import { getNextMotoGPCircuitEvents, getEventsByCircuitSlug, getUpcomingMotoGPCircuits, getFullMotoGPCalendar } from '../controllers/motogpController.js';


const router = express.Router();

router.get('/calendar', getFullMotoGPCalendar);
router.get('/next', getNextMotoGPCircuitEvents);
router.get('/upcoming-circuits', getUpcomingMotoGPCircuits); // nuevo
router.get('/by-circuit/:slug', getEventsByCircuitSlug);
router.get('/:slug', getEventsByCircuitSlug);  // nuevo endpoint


export default router;
