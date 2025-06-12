import mongoose from 'mongoose';
import KeikoPrompt from '../models/KeikoPrompt.js';

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
    const prompts = await KeikoPrompt.find(query);
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
