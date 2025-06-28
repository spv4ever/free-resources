// middlewares/enrichFixedOptions.js
import KeikoPromptOption from '../keikoprompts/models/KeikoPromptOption.js';
import KeikoPromptOptionGroup from '../keikoprompts//models/KeikoPromptOptionGroup.js';

export const enrichFixedOptions = async prompts => {
  if (!Array.isArray(prompts)) return prompts;

  const allOptionIds = new Set();

  for (const prompt of prompts) {
    const fixed = prompt.fixedOptions;
    if (!fixed) continue;
    for (const ids of Object.values(fixed)) {
      ids.forEach(id => allOptionIds.add(id));
    }
  }

  const options = await KeikoPromptOption.find({
    _id: { $in: [...allOptionIds] }
  }).populate('group').lean();

  const optionMap = {};
  for (const opt of options) {
    optionMap[opt._id.toString()] = opt;
  }

  for (const prompt of prompts) {
    const fixed = prompt.fixedOptions;
    if (!fixed) continue;
    for (const [group, ids] of Object.entries(fixed)) {
      prompt.fixedOptions[group] = ids
        .map(id => optionMap[id.toString()])
        .filter(Boolean);
    }
  }

  return prompts;
};
