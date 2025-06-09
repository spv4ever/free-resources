import PromptPack from '../models/PromptPack.js';
import PromptItem from '../models/PromptItem.js';
import PromptOptionGroup from '../models/PromptOptionGroup.js';
import PromptOption from '../models/PromptOption.js';

export const importKeikoFromJson = async (req, res) => {
  try {
    const prompts = req.body; // debe ser un array

    if (!Array.isArray(prompts)) {
      return res.status(400).json({ error: 'El JSON debe ser un array de prompts.' });
    }

    const groupCache = {};
    const optionCache = {};
    const packCache = {};

    for (const entry of prompts) {
      const { pack, scene, prompt, fixedOptions = {}, nsfw = false } = entry;


      // 1. PACK
      let packId;
      if (packCache[pack.title]) {
        packId = packCache[pack.title];
      } else {
        const existingPack = await PromptPack.findOne({ title: pack.title });
        if (existingPack) {
          packId = existingPack._id;
        } else {
          const newPack = await PromptPack.create(pack);
          packId = newPack._id;
        }
        packCache[pack.title] = packId;
      }

      // 2. OPCIONES Y GRUPOS
      const fixedOptionRefs = {};

      for (const category in fixedOptions) {
        const values = fixedOptions[category];
        fixedOptionRefs[category] = [];

        for (const opt of values) {
          const groupKey = opt.group.name;
          let groupId;

          if (groupCache[groupKey]) {
            groupId = groupCache[groupKey];
          } else {
            const existingGroup = await PromptOptionGroup.findOne({ name: groupKey });
            if (existingGroup) {
              groupId = existingGroup._id;
            } else {
              const newGroup = await PromptOptionGroup.create(opt.group);
              groupId = newGroup._id;
            }
            groupCache[groupKey] = groupId;
          }

          const optionKey = `${groupKey}:${opt.name}`;
          if (!optionCache[optionKey]) {
            const existingOption = await PromptOption.findOne({ name: opt.name, group: groupId });
            if (existingOption) {
              optionCache[optionKey] = existingOption._id;
            } else {
              const newOption = await PromptOption.create({ ...opt, group: groupId });
              optionCache[optionKey] = newOption._id;
            }
          }

          // guardamos solo los `name` para vincularlos desde frontend fácilmente
          fixedOptionRefs[category].push(opt.name);
        }
      }

      // 3. GUARDAR PROMPT
      const lastPrompt = await PromptItem.findOne().sort({ number: -1 });
      let nextNumber = lastPrompt ? lastPrompt.number + 1 : 1;

      await PromptItem.create({
        pack: packId,
        number: nextNumber++,
        scene,
        prompt,
        fixedOptions: fixedOptionRefs,
        nsfw
      });
    }

    res.json({ message: `✅ Importación completada. Total: ${prompts.length} prompts` });
  } catch (error) {
    console.error('❌ Error en importación KeikoPrompts:', error);
    res.status(500).json({ error: 'Error interno al importar los datos' });
  }
};

export const importKeikoPreviewFromJson = async (req, res) => {
  try {
    const prompts = req.body;

    if (!Array.isArray(prompts)) {
      return res.status(400).json({ error: 'El JSON debe ser un array de prompts.' });
    }

    const preview = prompts.map((entry, index) => {
      const hasCore = entry.prompt && entry.scene && entry.pack?.title && entry.pack?.platform;
      return {
        tempId: index + 1,
        scene: entry.scene || '',
        prompt: entry.prompt || '',
        platform: entry.pack?.platform || '',
        packTitle: entry.pack?.title || '',
        category: entry.pack?.category || '',
        access: entry.pack?.access || '',
        nsfw: entry.nsfw || false,
        valid: hasCore
      };
    });

    res.json({ prompts: preview });
  } catch (error) {
    console.error('❌ Error en previewKeikoPrompts:', error);
    res.status(500).json({ error: 'Error interno al previsualizar los prompts' });
  }
};