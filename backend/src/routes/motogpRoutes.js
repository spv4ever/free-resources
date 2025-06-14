// src/routes/motogpRoutes.js
import express from 'express';
import { getNextMotoGPCircuitEvents, getEventsByCircuitSlug, getUpcomingMotoGPCircuits } from '../controllers/motogpController.js';


const router = express.Router();

router.get('/next', getNextMotoGPCircuitEvents);
router.get('/upcoming-circuits', getUpcomingMotoGPCircuits); // nuevo
router.get('/:slug', getEventsByCircuitSlug);  // nuevo endpoint

export default router;
