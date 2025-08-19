// src/keikoprompts/controllers/promptController.js
import mongoose from 'mongoose';
import KeikoPrompt from '../models/KeikoPrompt.js';
import KeikoPromptOption from '../models/KeikoPromptOption.js';
import KeikoPromptOptionGroup from '../models/KeikoPromptOptionGroup.js';
import { enrichFixedOptions } from '../../middlewares/enrichFixedOptions.js';
import ImagenGenerada from '../../models/ImagenGenerada.js';

const { isValidObjectId } = mongoose;

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
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'id inválido' });
    }
    const deleted = await KeikoPrompt.findByIdAndDelete(id);
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
export const countPromptsByPack = async (req, res) => {
  try {
    const counts = await KeikoPrompt.aggregate([
      { $group: { _id: '$packId', count: { $sum: 1 } } },
      { $project: { packId: { $toString: '$_id' }, count: 1, _id: 0 } }
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
    if (!isValidObjectId(packId)) {
      return res.json({ packId, count: 0 });
    }

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
  };

  // Parseo de filtros estilo filters[tematica]=halloween
  let filters = {};
  Object.keys(req.query).forEach(key => {
    const match = key.match(/^filters\[(.+)\]$/);
    if (match) {
      filters[match[1]] = req.query[key];
    }
  });

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

  // Filtros por fixedOptions
  for (const [groupKey, optionName] of Object.entries(filters)) {
    const realGroupKey = groupKeyMap[groupKey] || groupKey;

    const option = await KeikoPromptOption.findOne({ name: optionName }).lean();
    query.$and = query.$and || [];

    const matchById = option ? { [`fixedOptions.${realGroupKey}`]: option._id } : null;
    const matchByName = { [`fixedOptions.${realGroupKey}.name`]: optionName };

    if (matchById) {
      query.$and.push({ $or: [matchById, matchByName] });
    } else {
      query.$and.push(matchByName);
    }
  }

  const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const allFiltered = await KeikoPrompt.find(query).sort(sort).lean();
    const total = allFiltered.length;

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

export const obtenerUltimaImagenGenerada = async (req, res) => {
  const { promptId } = req.params;

  try {
    const imagen = await ImagenGenerada.findOne({
      promptRef: promptId,
      status: { $in: ['completada', 'enviada_telegram'] }
    }).sort({ createdAt: -1 });

    if (!imagen) return res.json(null);
    res.json({ url: imagen.finalUrl || imagen.url });
  } catch (error) {
    console.error('Error al buscar imagen generada:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const obtenerImagenesDePrompt = async (req, res) => {
  const { promptId } = req.params;

  try {
    const imagenes = await ImagenGenerada.find({
      promptRef: promptId,
      status: { $in: ['completada', 'enviada_telegram'] }
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'promptRef',
        populate: { path: 'packId' }
      })
      .populate('user', 'nickname');

    res.json(imagenes);
  } catch (error) {
    console.error('Error al buscar imágenes del prompt:', error);
    res.status(500).json({ error: 'Error al obtener imágenes' });
  }
};

/**
 * DELETE /api/keiko/prompts/mass-delete
 * Borra múltiples prompts por ids
 */
export const massDeletePrompts = async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Debes proporcionar un array de ids' });
    }

    const validIds = ids.filter(isValidObjectId);
    if (validIds.length === 0) {
      return res.status(400).json({ error: 'Ningún id es válido' });
    }

    const result = await KeikoPrompt.deleteMany({ _id: { $in: validIds } });
    return res.json({
      ok: true,
      requested: ids.length,
      valid: validIds.length,
      deleted: result.deletedCount || 0
    });
  } catch (err) {
    console.error('Error en massDeletePrompts:', err);
    return res.status(500).json({ error: 'Error al borrar prompts' });
  }
};
