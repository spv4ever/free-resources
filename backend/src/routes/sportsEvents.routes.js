import express from 'express';
import * as sportsEventsController from '../controllers/sportsEventsController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, sportsEventsController.getAllEvents);            // acceso para usuarios autenticados
router.get('/:id', protect, sportsEventsController.getEventById);        // idem
router.post('/', protect, admin, sportsEventsController.createEvent);    // solo admin
router.put('/:id', protect, admin, sportsEventsController.updateEvent);  // solo admin
router.delete('/:id', protect, admin, sportsEventsController.deleteEvent); // solo admin
router.post('/import', protect, admin, sportsEventsController.importEvents); // solo admin

export default router;
