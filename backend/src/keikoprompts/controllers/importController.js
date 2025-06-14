// src/keikoprompts/controllers/importController.js
import Ajv from 'ajv';
import mongoose from 'mongoose';
import { importPromptPackFile } from '../services/promptImporter.js';
import KeikoPrompt from '../models/KeikoPrompt.js';
import KeikoPromptOptionGroup from '../models/KeikoPromptOptionGroup.js';
import KeikoPromptOption from '../models/KeikoPromptOption.js';

const ajv = new Ajv();

// JSON-schema definitivo
const promptImportSchema = {
  type: 'array',
  items: {
    type: 'object',
    required: ['scene','prompt','platform','access','nsfw','fixedOptions'],
    properties: {
      scene:    { type: 'string' },
      prompt:   { type: 'string' },
      platform: { type: 'string' },
      access:   { type: 'string', enum: ['free','pro'] },
      nsfw:     { type: 'boolean' },
      fixedOptions: {
        type: 'object',
        additionalProperties: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name','label','group'],
            properties: {
              name:  { type: 'string' },
              label: { type: 'string' },
              group: {
                type: 'object',
                required: ['name','label','multiple'],
                properties: {
                  name:     { type: 'string' },
                  label:    { type: 'string' },
                  multiple: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }
  }
};
const validateImport = ajv.compile(promptImportSchema);


/**
 * POST /api/keiko/import/preview
 * Recibe file + packId; valida y devuelve preview (array de objetos con _idx).
 */
export async function previewImport(req, res, next) {
  try {
    const { packId } = req.body;
    if (!packId) {
      return res.status(400).json({ error: 'packId requerido' });
    }

    const json = JSON.parse(req.file.buffer.toString('utf8'));
    if (!validateImport(json)) {
      return res.status(400).json({ errors: validateImport.errors });
    }

    const preview = json.map((p, i) => ({ _idx: i, packId, ...p }));
    res.json({ preview });
  } catch (err) {
    next(err);
  }
}


/**
 * POST /api/keiko/import
 * Recibe body JSON: { packId, prompts: [...], acceptedIndexes: [...] }
 * Construye los docs y los inserta con insertMany({ ordered: false }),
 * omitiendo silenciosamente los duplicados gracias al índice único.
 */
export async function executeImport(req, res, next) {
  try {
    const { packId, prompts, acceptedIndexes } = req.body;
    if (!packId || !Array.isArray(prompts) || !Array.isArray(acceptedIndexes)) {
      return res.status(400).json({ error: 'Datos de entrada inválidos' });
    }

    // Sólo los prompts marcados
    const toInsert = prompts.filter((_, i) => acceptedIndexes.includes(i));
    const docs = [];

    for (const p of toInsert) {
      const optMap = {};
      for (const [groupKey, options] of Object.entries(p.fixedOptions)) {
        let grp = await KeikoPromptOptionGroup.findOne({ name: options[0].group.name });
        if (!grp) {
          grp = await KeikoPromptOptionGroup.create({
            name:     options[0].group.name,
            label:    options[0].group.label,
            multiple: options[0].group.multiple
          });
        }
        const optIds = [];
        for (const opt of options) {
          let dbOpt = await KeikoPromptOption.findOne({
            group: grp._id,
            name:  opt.name
          });
          if (!dbOpt) {
            dbOpt = await KeikoPromptOption.create({
              group: grp._id,
              name:  opt.name,
              label: opt.label
            });
          }
          optIds.push(dbOpt._id);
        }
        optMap[groupKey] = optIds;
      }

      docs.push({
        packId:       new mongoose.Types.ObjectId(packId),
        scene:        p.scene,
        prompt:       p.prompt,
        platform:     p.platform,
        access:       p.access,
        nsfw:         p.nsfw,
        fixedOptions: optMap
      });
    }

    // InsertMany con ordered:false para omitir duplicados
    try {
      const inserted = await KeikoPrompt.insertMany(docs, { ordered: false });
      const insertedCount = inserted.length;
      const skippedCount  = docs.length - insertedCount;
      return res.json({
        insertedCount,
        skippedCount,
        message: `${insertedCount} prompts importados. ${skippedCount} duplicados omitidos.`
      });
    } catch (err) {
      // Capturamos errores de duplicado
      const isDupError =
        err.name === 'BulkWriteError' ||
        err.name === 'MongoBulkWriteError' ||
        err.code === 11000;
      if (isDupError) {
        const insertedCount = err.result?.nInserted ?? err.insertedCount ?? 0;
        const skippedCount  = docs.length - insertedCount;
        return res.json({
          insertedCount,
          skippedCount,
          message: `${insertedCount} prompts importados. ${skippedCount} duplicados omitidos.`
        });
      }
      throw err;
    }

  } catch (err) {
    next(err);
  }
}


/**
 * POST /api/keiko/import/json
 * Legacy: importa con tu servicio importPromptPackFile.
 */
export async function importPromptsFromJson(req, res) {
  try {
    const packs = Array.isArray(req.body) ? req.body : [req.body];
    const result = await importPromptPackFile(packs);
    res.json({ message: 'Importación finalizada', result });
  } catch (err) {
    console.error('Error en importación:', err);
    res.status(500).json({ error: 'Error al importar los prompts' });
  }
}
