import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import KeikoPrompt from '../keikoprompts/models/KeikoPrompt.js';
import KeikoPromptOption from '../keikoprompts/models/KeikoPromptOption.js';
import KeikoPromptOptionGroup from '../keikoprompts/models/KeikoPromptOptionGroup.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/keiko';

async function fixFixedOptions() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Conectado a MongoDB');

  const prompts = await KeikoPrompt.find().lean();

  for (const prompt of prompts) {
    let modified = false;
    const fixed = prompt.fixedOptions || {};

    for (const [key, values] of Object.entries(fixed)) {
      const newValues = [];

      for (const val of values) {
        if (typeof val === 'object' && val.name) {
          newValues.push(val);
          continue;
        }

        try {
          const opt = await KeikoPromptOption.findById(val).populate('group').lean();
          if (opt && opt.group) {
            newValues.push({
              name: opt.name,
              label: opt.label,
              group: {
                name: opt.group.name,
                label: opt.group.label,
                multiple: opt.group.multiple
              }
            });
            modified = true;
          }
        } catch (err) {
          console.warn(`⚠️ Opción inválida en prompt ${prompt._id}, key ${key}`);
        }
      }

      fixed[key] = newValues;
    }

    if (modified) {
      await KeikoPrompt.updateOne({ _id: prompt._id }, { $set: { fixedOptions: fixed } });
      console.log(`✅ Prompt actualizado: ${prompt._id}`);
    }
  }

  await mongoose.disconnect();
  console.log('🔚 Script completado');
}

fixFixedOptions().catch(err => {
  console.error('❌ Error en el script:', err);
  process.exit(1);
});
