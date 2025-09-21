// services/captionService.js
export function buildCaption({ prompt, tematica = null }) {
  const body = (prompt || '').trim();

  // --- Hashtags base (IA + diseño; ES/EN) ---
  const BASE = [
    '#AIArt', '#AIGenerated', '#AIDesign', '#PromptArt', '#KeikoPrompts',
    '#DigitalArt', '#GraphicDesign', '#DisenoGrafico', '#ArteDigital',
    '#DesignInspiration', '#CreativeProcess', '#ArtOfTheDay', '#MadeWithAI'
  ];

  // --- Hashtags por temática detectada en el prompt ---
  const TOPIC_MAP = [
    { match: ['cyberpunk'], tags: ['#Cyberpunk', '#Futuristic', '#SciFiArt'] },
    { match: ['holographic', 'holo', 'iridescent'], tags: ['#Holographic', '#Iridescent'] },
    { match: ['neon', 'glow'], tags: ['#NeonArt', '#NeonGlow'] },
    { match: ['vector', 'svg'], tags: ['#VectorArt', '#Illustration'] },
    { match: ['drip', 'dripping', 'liquid'], tags: ['#DripArt', '#LiquidArt'] },
    { match: ['t-shirt', 'tshirt', 'tee', 'shirt'], tags: ['#TShirtDesign', '#Streetwear', '#MerchDesign', '#PrintOnDemand'] },
    { match: ['logo', 'branding', 'logotype', 'brand'], tags: ['#LogoDesign', '#Branding', '#Logotype'] },
    { match: ['poster'], tags: ['#PosterDesign', '#PrintDesign'] },
    { match: ['retro', 'vintage'], tags: ['#RetroDesign', '#VintageStyle'] },
    { match: ['anime', 'manga'], tags: ['#AnimeArt', '#MangaArt'] },
    { match: ['wallpaper', 'ultrawall', '8k'], tags: ['#Wallpaper', '#8K', '#UltraHD'] },
    { match: ['space', 'galaxy', 'nebula', 'astronomy'], tags: ['#SpaceArt', '#Cosmic', '#Nebula'] }
  ];

  // --- Hashtag de temática manual si llega (p. ej. "KeikoLover") ---
  const themeTag = tematica ? [`#${String(tematica).replace(/\s+/g, '')}`] : [];

  // Extrae tags por keywords del prompt
  const lower = body.toLowerCase();
  const topicTags = [];
  for (const { match, tags } of TOPIC_MAP) {
    if (match.some(k => lower.includes(k))) topicTags.push(...tags);
  }

  // Ensambla, deduplica (case-insensitive) y recorta a 28
  const MAX = 28;
  const all = [...themeTag, ...topicTags, ...BASE];
  const seen = new Set();
  const unique = [];
  for (const t of all) {
    const key = t.toLowerCase();
    if (!seen.has(key)) { seen.add(key); unique.push(t); }
    if (unique.length >= MAX) break;
  }

  return [
    `Prompt: ${body}`,
    '',
    unique.join(' ')
  ].join('\n');
}

