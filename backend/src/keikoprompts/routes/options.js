import express from 'express';
import {
  getOptionsByGroup,
  createOption,
  updateOption,
  deleteOption
} from '../controllers/optionController.js';

import {
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup
} from '../controllers/optionGroupController.js';

const router = express.Router();

// Opciones individuales
router.get('/group/:groupId', getOptionsByGroup);
router.post('/option', createOption);
router.put('/option/:id', updateOption);
router.delete('/option/:id', deleteOption);

// Grupos de opciones
router.get('/groups', getAllGroups);
router.post('/group', createGroup);
router.put('/group/:id', updateGroup);
router.delete('/group/:id', deleteGroup);

export default router;
