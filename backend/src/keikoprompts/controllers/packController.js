// src/controllers/packController.js

import KeikoPromptPack from '../models/KeikoPromptPack.js';
import KeikoPrompt     from '../models/KeikoPrompt.js';

export const getAllPacks = async (req, res) => {
  try {
    const packs = await KeikoPromptPack.find().sort({ createdAt: -1 });
    res.json(packs);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los packs' });
  }
};

export const getPackById = async (req, res) => {
  try {
    const pack = await KeikoPromptPack.findById(req.params.id);
    if (!pack) return res.status(404).json({ error: 'Pack no encontrado' });
    res.json(pack);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el pack' });
  }
};

export const createPack = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const newPack = new KeikoPromptPack({ title, description, category });
    await newPack.save();
    res.status(201).json(newPack);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear el pack' });
  }
};

export const updatePack = async (req, res) => {
  try {
    const updated = await KeikoPromptPack.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Pack no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el pack' });
  }
};

export const deletePack = async (req, res) => {
  try {
    const packId = req.params.id;
    // Eliminar prompts asociados
    await KeikoPrompt.deleteMany({ packId });
    // Eliminar el pack
    await KeikoPromptPack.findByIdAndDelete(packId);
    res.status(204).end();
  } catch (err) {
    console.error('❌ Error al eliminar pack y prompts:', err);
    res.status(500).json({ error: 'Error al eliminar el pack y sus prompts' });
  }
};
