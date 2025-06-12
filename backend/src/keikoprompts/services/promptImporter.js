import KeikoPromptPack from '../models/KeikoPromptPack.js';
import KeikoPrompt from '../models/KeikoPrompt.js';

const normalizeTitle = (title) => {
  return title
    .toLowerCase()
    .replace(/\b(gratuitos?|free|pro)\b/g, '')
    .replace(/\bpara (midjourney|pixai|leonardo\.ai|flux)\b/g, '')
    .replace(/\b(realistic 3d|flat vector|pixar 3d|chibi cute)\b/g, '')
    .replace(/\([^)]*\)/g, '')     // elimina paréntesis
    .replace(/[-–—]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const titleCase = (str) =>
  str.replace(/\b\w/g, (l) => l.toUpperCase());

export const importPromptPackFile = async (flatPromptsArray) => {
  const result = {
    totalPacks: 0,
    totalPrompts: 0,
    insertedPackTitles: [],
    groupedPrompts: {}
  };

  await KeikoPrompt.deleteMany({});
  await KeikoPromptPack.deleteMany({});
  console.log('🧹 Tablas KeikoPrompt y KeikoPromptPack eliminadas');

  for (const entry of flatPromptsArray) {
    const { pack, prompt, scene } = entry;
    if (!pack || !pack.title || !prompt || !pack.platform) continue;

    const cleanTitle = titleCase(normalizeTitle(pack.title));

    if (!result.groupedPrompts[cleanTitle]) {
      result.groupedPrompts[cleanTitle] = {
        prompts: [],
        description: pack.description || '',
        category: pack.category || 'General'
      };
    }

    result.groupedPrompts[cleanTitle].prompts.push(entry);
  }

  console.log('\n🧩 Agrupación de prompts por título de pack:');
  for (const [title, data] of Object.entries(result.groupedPrompts)) {
    console.log(` → ${title}: ${data.prompts.length} prompts`);
  }

  for (const [title, data] of Object.entries(result.groupedPrompts)) {
    const newPack = await KeikoPromptPack.create({
      title,
      description: data.description,
      category: data.category
    });

    result.totalPacks++;
    result.insertedPackTitles.push(title);

    const promptsToInsert = data.prompts.map(p => ({
      packId: newPack._id,
      scene: p.scene || '',
      prompt: p.prompt,
      platform: p.pack.platform,
      access: p.pack.access || 'free',
      nsfw: p.nsfw === true,
      fixedOptions: p.fixedOptions || {}
    }));

    await KeikoPrompt.insertMany(promptsToInsert);
    result.totalPrompts += promptsToInsert.length;

    console.log(`📦 Pack insertado: "${title}" (${promptsToInsert.length} prompts)`);
  }

  console.log('\n✅ Importación finalizada con éxito');
  return result;
};
