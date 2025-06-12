import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import PromptItem from '../models/PromptItem.js';
import PromptOptionGroup from '../models/PromptOptionGroup.js';
import PromptOption from '../models/PromptOption.js';

const MONGO_URI = process.env.MONGO_URI;

async function migrateFixedOptionsToObjectIds() {
  await mongoose.connect(MONGO_URI);
  console.log('Conectado a MongoDB');

  const prompts = await PromptItem.find({});
  const groupCache = {};
  const optionCache = {};

  // Paso 1: recorrer todos los prompts
  for (const prompt of prompts) {
    const originalOptions = prompt.fixedOptions;
    if (!originalOptions || typeof originalOptions !== 'object') continue;

    const newFixedOptions = {};
    const backupOriginal = {};

    // Paso 2: para cada grupo (style, angle, etc.)
    for (const groupName of Object.keys(originalOptions)) {
      const values = originalOptions[groupName];
      if (!Array.isArray(values)) continue;

      backupOriginal[groupName] = [...values];
      newFixedOptions[groupName] = [];

      // Crear o usar el grupo
      let groupId;
      if (groupCache[groupName]) {
        groupId = groupCache[groupName];
      } else {
        let group = await PromptOptionGroup.findOne({ name: groupName });
        if (!group) {
          group = await PromptOptionGroup.create({
            name: groupName,
            label: groupName.charAt(0).toUpperCase() + groupName.slice(1),
            multiple: true
          });
        }
        groupId = group._id;
        groupCache[groupName] = groupId;
      }

      // Paso 3: para cada opción dentro del grupo
      for (const val of values) {
        const key = `${groupName}::${val}`;

        let optionId;
        if (optionCache[key]) {
          optionId = optionCache[key];
        } else {
          let opt = await PromptOption.findOne({ name: val, group: groupId });
          if (!opt) {
            opt = await PromptOption.create({
              name: val,
              label: val.charAt(0).toUpperCase() + val.slice(1),
              group: groupId
            });
          }
          optionId = opt._id;
          optionCache[key] = optionId;
        }

        newFixedOptions[groupName].push(optionId);
      }
    }

    // Paso 4: actualizar el prompt
    prompt.fixedOptions = newFixedOptions;
    prompt._doc.fixedOptions_backup = backupOriginal;

    await prompt.save();
    console.log(`✅ Actualizado prompt ${prompt._id}`);
  }

  console.log('🎉 Migración completa');
  await mongoose.disconnect();
}

migrateFixedOptionsToObjectIds().catch(console.error);
