import { importPromptPackFile } from '../services/promptImporter.js';

export const importPromptsFromJson = async (req, res) => {
  try {
    const packs = Array.isArray(req.body) ? req.body : [req.body];
    const result = await importPromptPackFile(packs);
    res.json({ message: 'Importación finalizada', result });
  } catch (err) {
    console.error('Error en importación:', err);
    res.status(500).json({ error: 'Error al importar los prompts' });
  }
};
