// middlewares/enrichFixedOptions.js
import KeikoPromptOption from '../keikoprompts/models/KeikoPromptOption.js';
import KeikoPromptOptionGroup from '../keikoprompts//models/KeikoPromptOptionGroup.js';

export const enrichFixedOptions = async (prompts) => {
  const allOptionIds = new Set();

  // 1. Recoger solo los ObjectId o strings de 24 caracteres
  for (const prompt of prompts) {
    const fixed = prompt.fixedOptions;
    if (!fixed) continue;

    for (const values of Object.values(fixed)) {
      for (const v of values) {
        if (
          typeof v === 'string' && /^[a-f\d]{24}$/i.test(v)
        ) {
          allOptionIds.add(v);
        } else if (
          v instanceof Object && v._id && /^[a-f\d]{24}$/i.test(v._id.toString())
        ) {
          allOptionIds.add(v._id.toString());
        }
        // Si es objeto con `name`, ya está bien y lo ignoramos
      }
    }
  }

  const options = await KeikoPromptOption.find({
    _id: { $in: [...allOptionIds] }
  }).populate('group').lean();

  const optionMap = {};
  for (const opt of options) {
    optionMap[opt._id.toString()] = {
      name: opt.name,
      label: opt.label,
      group: {
        name: opt.group?.name,
        label: opt.group?.label,
        multiple: opt.group?.multiple
      }
    };
  }

  // 3. Reemplazar ObjectId por objeto
  for (const prompt of prompts) {
    const fixed = prompt.fixedOptions;
    if (!fixed) continue;

    for (const [group, values] of Object.entries(fixed)) {
      prompt.fixedOptions[group] = values.map(v => {
        if (
          typeof v === 'string' && optionMap[v]
        ) {
          return optionMap[v];
        } else if (
          typeof v === 'object' && v._id && optionMap[v._id.toString()]
        ) {
          return optionMap[v._id.toString()];
        } else if (
          typeof v === 'object' && v.name
        ) {
          return v; // ya está bien
        }
        return null;
      }).filter(Boolean);
    }
  }

  return prompts;
};
