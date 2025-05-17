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
    const count = Math.max(1, Math.min(20, parseInt(req.query.n) || 1));
    let nsfwOnly = req.query.nsfwOnly === 'true';
    const flat = req.query.flat === 'true';
    const format = req.query.format;
    const characterId = req.query.characterId || null;

    let fixedCharacter = null;
    let isCharacterUnderage = false;

    if (characterId) {
      fixedCharacter = await AnimeCharacter.findById(characterId);

      if (!fixedCharacter) {
        return res.status(400).json({ error: 'Personaje no encontrado.' });
      }

      isCharacterUnderage = isUnderage(fixedCharacter.age);

      if (nsfwOnly && isCharacterUnderage) {
        nsfwOnly = false;
        console.log(`[NSFW desactivado] Personaje "${fixedCharacter.name}" no apto para contenido NSFW.`);
      }
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
      const [style] = await IllustrationStyle.aggregate([{ $sample: { size: 1 } }]);
      const [view] = await ViewAngle.aggregate([{ $sample: { size: 1 } }]);
      const [outfit] = await Outfit.aggregate([{ $sample: { size: 1 } }]);
      const [location] = await Location.aggregate([{ $sample: { size: 1 } }]);
      const [pose] = await Pose.aggregate([{ $sample: { size: 1 } }]);
      let tags = await Tag.aggregate([{ $sample: { size: 3 } }]);

      if (!style || !view || !outfit || !location || !pose) break;

      let character = fixedCharacter;

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

      // 🧼 Aplicar reglas NSFW según personaje
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

    // 📤 Texto plano con pipes
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

    // 📤 CSV
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

    // 🧾 JSON por defecto
    return res.json({ total: prompts.length, prompts });

  } catch (err) {
    console.error('[ERROR PROMPT]', err);
    return res.status(500).json({ error: 'Error generando prompts aleatorios' });
  }
};
