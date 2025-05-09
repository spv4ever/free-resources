import express from 'express';
import { getResources, createResource, deleteResource, updateResource, getResourceStatsPerCategory  } from '../controllers/resourceLibraryController.js';
import { protect, admin } from '../middlewares/authMiddleware.js'; // Importamos los middlewares

const router = express.Router();

// Ruta para listar todos los recursos
router.get('/', getResources);

// Ruta para crear un recurso
router.post('/', protect, admin, createResource);

// Ruta para eliminar un recurso
router.delete('/:id', protect, admin, deleteResource);

router.put('/:id', protect, admin, updateResource);

// 👇 nueva ruta para estadísticas
router.get('/stats/per-category', getResourceStatsPerCategory);


export default router;
