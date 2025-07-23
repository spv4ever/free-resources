import mongoose from 'mongoose';
import KeikoPrompt from '../models/KeikoPrompt.js';
import KeikoPromptOption from '../models/KeikoPromptOption.js';
import KeikoPromptOptionGroup from '../models/KeikoPromptOptionGroup.js';
import { enrichFixedOptions } from '../../middlewares/enrichFixedOptions.js';
/**
 * GET  /api/keiko/prompts/by-pack/:packId
 * Obtiene todos los prompts del pack indicado
 */
export const getPromptsByPack = async (req, res) => {
  const { packId } = req.params;
  const { platform, access, nsfw } = req.query;

  const query = { packId };
  if (platform) query.platform = platform;
  if (access)   query.access   = access;
  if (nsfw !== undefined) query.nsfw = nsfw === 'true';

  try {
    const rawPrompts = await KeikoPrompt.find(query).lean();
    const prompts = await enrichFixedOptions(rawPrompts);
    res.json(prompts);
  } catch (err) {
    console.error('Error al obtener prompts:', err);
    res.status(500).json({ error: 'Error al obtener prompts' });
  }
};

/**
 * POST /api/keiko/prompts
 * Crea un nuevo prompt
 */
export const createPrompt = async (req, res) => {
  try {
    const newPrompt = new KeikoPrompt(req.body);
    const saved = await newPrompt.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error al crear prompt:', err);
    res.status(400).json({ error: 'Error al crear el prompt' });
  }
};

/**
 * PUT /api/keiko/prompts/:id
 * Actualiza un prompt existente
 */
export const updatePrompt = async (req, res) => {
  try {
    const updated = await KeikoPrompt.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Prompt no encontrado' });
    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar prompt:', err);
    res.status(400).json({ error: 'Error al actualizar el prompt' });
  }
};

/**
 * DELETE /api/keiko/prompts/:id
 * Elimina un prompt
 */
export const deletePrompt = async (req, res) => {
  try {
    const deleted = await KeikoPrompt.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Prompt no encontrado' });
    res.status(204).end();
  } catch (err) {
    console.error('Error al eliminar prompt:', err);
    res.status(500).json({ error: 'Error al eliminar el prompt' });
  }
};

/**
 * GET /api/keiko/prompts/count/by-pack
 * Devuelve conteo de prompts por cada pack (packId → count)
 */
// src/keikoprompts/controllers/promptController.js
// src/keikoprompts/controllers/promptController.js

export const countPromptsByPack = async (req, res) => {
  try {
    const counts = await KeikoPrompt.aggregate([
      {
        $group: {
          _id: '$packId',        // <--- usar packId
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          packId: { $toString: '$_id' },  // convierte ObjectId a string
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json(counts);
  } catch (err) {
    console.error('Error contando prompts por packId:', err);
    res.status(500).json({ message: 'Error interno al contar los prompts' });
  }
};

export const updateMultiplePlatforms = async (req, res) => {
  const { ids, platform } = req.body;

  if (!Array.isArray(ids) || ids.length === 0 || !platform) {
    return res.status(400).json({ error: 'Debes proporcionar IDs y un nuevo platform' });
  }

  try {
    const result = await KeikoPrompt.updateMany(
      { _id: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) } },
      { $set: { platform } }
    );

    res.json({ message: 'Actualización masiva completada', modified: result.modifiedCount });
  } catch (err) {
    console.error('Error en actualización masiva de platforms:', err);
    res.status(500).json({ error: 'Error interno al actualizar platforms' });
  }
};


/**
 * GET /api/keiko/prompts/count/by-pack/:packId
 * Devuelve conteo de prompts para un único pack
 */
export const countPromptsForOnePack = async (req, res) => {
  const { packId } = req.params;
  
  try {
    const result = await KeikoPrompt.aggregate([
      { $match: { packId: mongoose.Types.ObjectId(packId) } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    const count = result[0]?.count || 0;
    res.json({ packId, count });
  } catch (err) {
    console.error('Error contando prompts para pack:', err);
    res.status(500).json({ message: 'Error interno al contar los prompts' });
  }
};


/**
 * GET /api/keiko/prompts/by-pack-paginated/:packId
 * Obtiene los prompts paginados con filtros y orden
 */
export const getPromptsByPackPaginated = async (req, res) => {
  const { packId } = req.params;
  const {
    search = '',
    platform,
    access,
    nsfw,
    sortField = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = req.query;

  const groupKeyMap = {
    tematica: 'temática',
    estilo: 'estilo',
    // añade más si tienes otros nombres especiales
  };

  // 🔍 Parseo de filtros estilo filters[tematica]=halloween
  let filters = {};
  Object.keys(req.query).forEach(key => {
    const match = key.match(/^filters\[(.+)\]$/);
    if (match) {
      filters[match[1]] = req.query[key];
    }
  });

  // console.log('🧪 DEBUG QUERY - filters parsed:', filters);

  const query = {
    packId,
    $or: [
      { scene: { $regex: search, $options: 'i' } },
      { prompt: { $regex: search, $options: 'i' } }
    ]
  };

  if (platform) query.platform = platform;
  if (access) query.access = access;
  if (nsfw !== undefined) query.nsfw = nsfw === 'true';

  // 🎯 Aplicar filtros por opciones fijas (tematica, estilo, etc.)
  for (const [groupKey, optionName] of Object.entries(filters)) {
    const realGroupKey = groupKeyMap[groupKey] || groupKey;

    // Intentar usar _id si la opción existe en la colección
    const option = await KeikoPromptOption.findOne({ name: optionName }).lean();
    if (option) {
      query[`fixedOptions.${realGroupKey}`] = option._id;
    } else {
      // Filtrar por name si no se encuentra en la colección
      query[`fixedOptions.${realGroupKey}.name`] = optionName;
    }
  }
  const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    // console.log('🧪 Query Mongo FINAL aplicado en .find():', query);

    // Sin limit ni skip para contar total filtrado
    const allFiltered = await KeikoPrompt.find(query).sort(sort).lean();
    const total = allFiltered.length;

    // Aplicamos paginación después
    const paginated = allFiltered.slice(skip, skip + parseInt(limit));
    const prompts = await enrichFixedOptions(paginated);

    res.json({
      prompts,
      page: parseInt(page),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error('❌ Error al obtener prompts paginados:', err);
    res.status(500).json({ error: 'Error al obtener prompts paginados' });
  }
};
// const enrichFixedOptions = async prompts => {
//   const allOptionIds = new Set();

//   // 1. Recoger todos los ObjectId usados en los prompts
//   for (const prompt of prompts) {
//     const fixed = prompt.fixedOptions;
//     if (!fixed) continue;
//     for (const ids of Object.values(fixed)) {
//       ids.forEach(id => allOptionIds.add(id));
//     }
//   }

//   // 2. Obtener todos los objetos de opciones y sus grupos
//   const options = await KeikoPromptOption.find({ _id: { $in: [...allOptionIds] } }).populate('group').lean();

//   const optionMap = {};
//   for (const opt of options) {
//     optionMap[opt._id.toString()] = opt;
//   }

//   // 3. Reemplazar en cada prompt los IDs por los objetos
//   for (const prompt of prompts) {
//     const fixed = prompt.fixedOptions;
//     if (!fixed) continue;
//     for (const [group, ids] of Object.entries(fixed)) {
//       prompt.fixedOptions[group] = ids
//         .map(id => optionMap[id.toString()])
//         .filter(Boolean);
//     }
//   }

//   return prompts;
// };