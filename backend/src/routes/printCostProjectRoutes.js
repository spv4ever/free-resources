import express from 'express';
import {
  createPrintCostProject,
  deletePrintCostProject,
  getPrintCostProject,
  listPrintCostProjects,
  updatePrintCostProject,
} from '../controllers/printCostProjectController.js';
import { isProOrAdmin, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, isProOrAdmin);

router.get('/', listPrintCostProjects);
router.get('/:id', getPrintCostProject);
router.post('/', createPrintCostProject);
router.put('/:id', updatePrintCostProject);
router.delete('/:id', deletePrintCostProject);

export default router;
