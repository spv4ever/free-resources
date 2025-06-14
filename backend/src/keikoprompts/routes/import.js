// src/keikoprompts/routes/importRoutes.js
import express from 'express';
import multer from 'multer';
import {
  previewImport,
  executeImport,
  importPromptsFromJson
} from '../controllers/importController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 1) Endpoint legacy: carga inicial desde JSON
//    POST /admin/keiko/import/
router.post(
  '/',
  express.json(),
  importPromptsFromJson
);

// 2) Previsualización en memoria
//    POST /admin/keiko/import/preview
router.post(
  '/preview',
  upload.single('file'),
  previewImport
);

// 3) Importación definitiva de los prompts aceptados
//    POST /admin/keiko/import/import
router.post(
  '/import',
  express.json(),
  executeImport
);

export default router;
