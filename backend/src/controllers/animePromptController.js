import IllustrationStyle from '../models/IllustrationStyle.js';
import ViewAngle from '../models/ViewAngle.js';
import Outfit from '../models/Outfit.js';
import Location from '../models/Location.js';
import Pose from '../models/Pose.js';
import Tag from '../models/Tag.js';
import AnimeCharacter from '../models/AnimeCharacter.js';

function isUnderage(ageStr) {
  if (!ageStr) return false;
  const clean = ageStr.trim().toLowerCase();
  if (clean === 'desconocida' || clean === 'unknown') return false;
  const match = clean.match(/^(\d+)\s*-\s*(\d+)$/);
  if (match) return parseInt(match[1]) < 18;
  const num = parseInt(clean);
  return !isNaN(num) && num < 18;
}

export const generateRandomPrompt = async (req, res) => {
  try {
    const count = Math.max(1, Math.min(100, parseInt(req.query.n) || 1));
    const characterNameParam = req.query.characterName?.trim();
    const characterFromParam = req.query.characterFrom?.trim();
    let nsfwOnly = req.query.nsfwOnly === 'true';
    const flat = req.query.flat === 'true';
    const format = req.query.format;
    const characterId = req.query.characterId || null;

    // Opciones fijadas por el usuario (como arrays)
    const selectedStyles = req.query.style?.split(',').map(x => x.trim());
    const selectedViews = req.query.view?.split(',').map(x => x.trim());
    const selectedOutfits = req.query.outfit?.split(',').map(x => x.trim());
    const selectedLocations = req.query.location?.split(',').map(x => x.trim());
    const selectedPoses = req.query.pose?.split(',').map(x => x.trim());
    const selectedTags = req.query.tags?.split(',').map(x => x.trim());

    let character = null;
    let isCharacterUnderage = false;

    if (characterId) {
      character = await AnimeCharacter.findById(characterId);
      isCharacterUnderage = isUnderage(character?.age);

      if (isCharacterUnderage && nsfwOnly) {
        nsfwOnly = false;
        console.log(`[NSFW AUTO-FALLBACK] Personaje ${character?.name || 'desconocido'} no apto para NSFW`);
      }

      if (!character || (isCharacterUnderage && req.query.nsfwOnly === 'true')) {
        return res.status(400).json({ error: 'Personaje no válido para NSFW' });
      }
    } else if (characterNameParam && characterFromParam) {
      character = {
        name: characterNameParam,
        age: null,
        image: null,
        mainWork: { title: characterFromParam }
      };
      nsfwOnly = false;
    }

    let nsfwTag = null;
    if (nsfwOnly) {
      nsfwTag = await Tag.findOne({ value: 'nsfw' });
      if (!nsfwTag) {
        return res.status(400).json({ error: 'Etiqueta NSFW no encontrada en base de datos.' });
      }
    }

    const prompts = [];

    while (prompts.length < count) {
      const [style] = selectedStyles?.length
        ? await IllustrationStyle.aggregate([{ $match: { style: { $in: selectedStyles } } }, { $sample: { size: 1 } }])
        : await IllustrationStyle.aggregate([{ $sample: { size: 1 } }]);

      const [view] = selectedViews?.length
        ? await ViewAngle.aggregate([{ $match: { view: { $in: selectedViews } } }, { $sample: { size: 1 } }])
        : await ViewAngle.aggregate([{ $sample: { size: 1 } }]);

      const [outfit] = selectedOutfits?.length
        ? await Outfit.aggregate([{ $match: { description: { $in: selectedOutfits } } }, { $sample: { size: 1 } }])
        : await Outfit.aggregate([{ $sample: { size: 1 } }]);

      const [location] = selectedLocations?.length
        ? await Location.aggregate([{ $match: { place: { $in: selectedLocations } } }, { $sample: { size: 1 } }])
        : await Location.aggregate([{ $sample: { size: 1 } }]);

      const [pose] = selectedPoses?.length
        ? await Pose.aggregate([{ $match: { pose: { $in: selectedPoses } } }, { $sample: { size: 1 } }])
        : await Pose.aggregate([{ $sample: { size: 1 } }]);

      let tags = selectedTags?.length
        ? await Tag.aggregate([{ $match: { value: { $in: selectedTags } } }, { $sample: { size: 3 } }])
        : await Tag.aggregate([{ $sample: { size: 3 } }]);

      if (!style || !view || !outfit || !location || !pose) break;

      if (!character) {
        for (let i = 0; i < 10; i++) {
          const [candidate] = await AnimeCharacter.aggregate([{ $sample: { size: 1 } }]);
          if (!candidate || isUnderage(candidate.age)) continue;
          character = candidate;
          isCharacterUnderage = isUnderage(candidate.age);
          break;
        }

        if (!character) continue;
      }

      if (nsfwOnly && !isCharacterUnderage) {
        if (!tags.some(t => t.value === 'nsfw')) {
          tags = [nsfwTag, ...tags.filter(t => t.value !== 'nsfw')].slice(0, 3);
        }
      } else {
        tags = tags.filter(t => t.value !== 'nsfw');
      }

      const tagList = tags.map(t => t.value).join(', ');
      const prompt = `${style.style}, ${character.name} from ${character.mainWork?.title || 'Anime'}, ${view.view}, ${outfit.description}, ${location.place}, ${pose.pose}${tagList ? `, ${tagList}` : ''}`;

      prompts.push({
        prompt,
        character: {
          name: character.name,
          age: character.age,
          image: character.image,
          mainWork: character.mainWork?.title || null
        }
      });
    }

    if (prompts.length === 0) {
      return res.status(500).json({ error: 'No se pudo generar ningún prompt válido.' });
    }

    if (flat) {
      const lines = prompts.map(p => {
        const parts = p.prompt.split(', ');
        const tags = parts.slice(6).join(', ');
        const [style, characterLine, view, outfit, location, pose] = parts;
        const [characterName, mainWorkTitle] = characterLine.split(' from ');
        return `${style} | ${characterName} | ${mainWorkTitle} | ${view} | ${outfit} | ${location} | ${pose} | ${tags}`;
      });

      return res
        .type('text/plain')
        .send(['Estilo | Personaje | Obra | Vista | Ropa | Ubicación | Pose | Etiquetas', ...lines].join('\n'));
    }

    if (format === 'csv') {
      const header = 'Estilo,Personaje,Obra,Vista,Ropa,Ubicación,Pose,Etiquetas';

      const rows = prompts.map(p => {
        const parts = p.prompt.split(', ');
        const tags = parts.slice(6).join(', ');
        const [style, characterLine, view, outfit, location, pose] = parts;
        const [characterName, mainWorkTitle] = characterLine.split(' from ');
        return `${style},${characterName},${mainWorkTitle},${view},${outfit},${location},${pose},${tags}`;
      });

      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const fileName = `prompts_${dd}-${mm}-${yyyy}.csv`;

      return res
        .type('text/csv')
        .attachment(fileName)
        .send([header, ...rows].join('\n'));
    }

    return res.json({ total: prompts.length, prompts });

  } catch (err) {
    console.error('[ERROR PROMPT]', err);
    return res.status(500).json({ error: 'Error generando prompts aleatorios' });
  }
};
