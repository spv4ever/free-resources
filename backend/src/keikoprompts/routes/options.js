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

import { getAllGroupsWithOptions  } from '../controllers/optionController.js';
import { getUsedOptionsByPack } from '../controllers/optionController.js';

const router = express.Router();
router.get('/by-group', getAllGroupsWithOptions );
// Opciones individuales
router.get('/group/:groupId', getOptionsByGroup);
router.post('/option', createOption);
router.put('/option/:id', updateOption);
router.delete('/option/:id', deleteOption);
router.get('/used-in-pack/:packId', getUsedOptionsByPack);

// Grupos de opciones
router.get('/groups', getAllGroups);
router.post('/group', createGroup);
router.put('/group/:id', updateGroup);
router.delete('/group/:id', deleteGroup);

export default router;
