import mongoose from 'mongoose';
import KeikoPromptOption from '../models/KeikoPromptOption.js';
import KeikoPromptOptionGroup from '../models/KeikoPromptOptionGroup.js';
import KeikoPrompt from '../models/KeikoPrompt.js';

export const getOptionsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const options = await KeikoPromptOption.find({ group: groupId }).sort({ label: 1 });
    res.json(options);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener opciones' });
  }
};

export const createOption = async (req, res) => {
  try {
    const { group, name, label } = req.body;
    const option = new KeikoPromptOption({ group, name, label });
    await option.save();
    res.status(201).json(option);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear opción' });
  }
};

export const updateOption = async (req, res) => {
  try {
    const updated = await KeikoPromptOption.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Opción no encontrada' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar opción' });
  }
};

export const deleteOption = async (req, res) => {
  try {
    const deleted = await KeikoPromptOption.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Opción no encontrada' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar opción' });
  }
};

export const getAllGroupsWithOptions  = async (req, res) => {
  try {
    const groups = await KeikoPromptOptionGroup.find().lean();
    const options = await KeikoPromptOption.find().lean();

    const result = {};

    for (const group of groups) {
      result[group.name] = options
        .filter(opt => String(opt.group) === String(group._id))
        .map(opt => ({
          name: opt.name,
          label: opt.label
        }));
    }

    res.json(result);
  } catch (err) {
    console.error('Error cargando grupos de opciones:', err);
    res.status(500).json({ error: 'Error al obtener grupos de opciones' });
  }
};

export const getUsedOptionsByPack = async (req, res) => {
  const { packId } = req.params;

  try {
    const prompts = await KeikoPrompt.find({ packId }).lean();

    if (prompts.length === 0) {
      console.warn('⚠️ No hay prompts en el pack:', packId);
      return res.json({});
    }

    const usedOptionIds = new Set();
    for (const prompt of prompts) {
      const fixed = prompt.fixedOptions || {};
      for (const values of Object.values(fixed)) {
        for (const opt of values) {
          if (typeof opt === 'string' || opt instanceof mongoose.Types.ObjectId) {
            usedOptionIds.add(opt.toString());
          } else if (opt && opt._id) {
            usedOptionIds.add(opt._id.toString());
          }
        }
      }
    }

    // console.log('IDs recolectados:', [...usedOptionIds]);

    const options = await KeikoPromptOption.find({
      _id: { $in: [...usedOptionIds] }
    }).populate('group').lean();

    const result = {};
    for (const opt of options) {
      const groupName = opt.group?.name;
      if (!groupName) continue;
      if (!result[groupName]) result[groupName] = [];
      result[groupName].push({
        name: opt.name,
        label: opt.label
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Error obteniendo opciones por pack:', err);
    res.status(500).json({ error: 'Error al obtener opciones del pack' });
  }
};

