import express from 'express';
import {
  getNextF1CircuitEvents,
  getEventsByCircuitSlug,
  getUpcomingF1Circuits,
  getFullF1Calendar
} from '../controllers/formula1Controller.js';

const router = express.Router();

router.get('/f1/next-race', getNextF1CircuitEvents);
router.get('/f1/circuit/:slug', getEventsByCircuitSlug);
router.get('/f1/upcoming-circuits', getUpcomingF1Circuits);
router.get('/f1/calendar', getFullF1Calendar);

export default router;
