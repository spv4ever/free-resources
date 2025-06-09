import PromptItem from '../models/PromptItem.js';
import PromptOption from '../models/PromptOption.js';
import PromptOptionGroup from '../models/PromptOptionGroup.js';

export const exportPackById = async (req, res) => {
  const { packId } = req.params;

  try {
    const items = await PromptItem.find({ pack: packId }).populate('pack').lean();
    if (!items.length) return res.status(404).json({ error: 'No se encontraron prompts para este pack' });

    // recolectar todos los names por grupo
    const groupToNames = {};
    for (const item of items) {
      for (const [groupName, names] of Object.entries(item.fixedOptions || {})) {
        if (!Array.isArray(names)) continue;
        if (!groupToNames[groupName]) groupToNames[groupName] = new Set();
        names.forEach(name => groupToNames[groupName].add(name));
      }
    }

    // obtener todas las opciones referenciadas
    const allNames = [...new Set(Object.values(groupToNames).flatMap(set => [...set]))];
    const options = await PromptOption.find({ name: { $in: allNames } }).populate('group').lean();

    // construir mapa groupName:name → fullObject
    const optionMap = {};
    for (const opt of options) {
      const g = opt.group;
      if (!optionMap[g.name]) optionMap[g.name] = {};
      optionMap[g.name][opt.name] = {
        name: opt.name,
        label: opt.label,
        group: {
          name: g.name,
          label: g.label,
          multiple: g.multiple
        }
      };
    }

    const prompts = items.map(item => {
      const fixedOptions = {};
      for (const [groupName, names] of Object.entries(item.fixedOptions || {})) {
        fixedOptions[groupName] = names
          .map(name => optionMap[groupName]?.[name])
          .filter(Boolean); // solo si existe la opción
      }

      return {
        pack: {
          title: item.pack.title,
          description: item.pack.description,
          platform: item.pack.platform,
          category: item.pack.category,
          access: item.pack.access
        },
        number: item.number,
        scene: item.scene,
        prompt: item.prompt,
        nsfw: item.nsfw,
        fixedOptions
      };
    });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(prompts);
  } catch (err) {
    console.error('❌ Error en exportación:', err);
    res.status(500).json({ error: 'Error interno al exportar' });
  }
};

export const exportAllPacks = async (req, res) => {
  try {
    const items = await PromptItem.find().populate('pack').lean();
    if (!items.length) return res.status(404).json({ error: 'No hay prompts registrados' });

    // recolectar todos los nombres por grupo
    const groupToNames = {};
    for (const item of items) {
      for (const [groupName, names] of Object.entries(item.fixedOptions || {})) {
        if (!Array.isArray(names)) continue;
        if (!groupToNames[groupName]) groupToNames[groupName] = new Set();
        names.forEach(name => groupToNames[groupName].add(name));
      }
    }

    // buscar todas las opciones usadas y sus grupos
    const allNames = [...new Set(Object.values(groupToNames).flatMap(set => [...set]))];
    const options = await PromptOption.find({ name: { $in: allNames } }).populate('group').lean();

    const optionMap = {};
    for (const opt of options) {
      const g = opt.group;
      if (!optionMap[g.name]) optionMap[g.name] = {};
      optionMap[g.name][opt.name] = {
        name: opt.name,
        label: opt.label,
        group: {
          name: g.name,
          label: g.label,
          multiple: g.multiple
        }
      };
    }

    // armar prompts en formato compatible con importación
    const prompts = items.map(item => {
      const fixedOptions = {};
      for (const [groupName, names] of Object.entries(item.fixedOptions || {})) {
        fixedOptions[groupName] = names
          .map(name => optionMap[groupName]?.[name])
          .filter(Boolean);
      }

      return {
        pack: {
          title: item.pack.title,
          description: item.pack.description,
          platform: item.pack.platform,
          category: item.pack.category,
          access: item.pack.access
        },
        number: item.number,
        scene: item.scene,
        prompt: item.prompt,
        nsfw: item.nsfw,
        fixedOptions
      };
    });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(prompts);
  } catch (err) {
    console.error('❌ Error al exportar todos los packs:', err);
    res.status(500).json({ error: 'Error interno al exportar' });
  }
};