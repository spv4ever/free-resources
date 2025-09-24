import { postReelAccount2 } from '../jobs/postInstagramReel.account2.js';

export async function publishReelAccount2(req, res) {
  try {
    const limit       = Math.min(Math.max(parseInt(req.body?.limit ?? req.query?.limit ?? 6, 10), 2), 20);
    const perSlideSec = Math.max(2, parseInt(req.body?.perSlideSec ?? req.query?.perSlideSec ?? 4, 10));
    const titulo      = (req.body?.titulo ?? req.query?.titulo ?? 'Highlights del día').toString();
    const tagsExtra   = (req.body?.tagsExtra ?? req.query?.tagsExtra ?? '')
      .toString()
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const out = await postReelAccount2({ limit, perSlideSec, titulo, tagsExtra, dryRun: false });
    if (!out) return res.status(204).send(); // sin material suficiente
    return res.json(out);
  } catch (e) {
    console.error('[publish-reel-one] ERROR', e?.response?.data || e.message);
    return res.status(500).json({ error: 'No se pudo publicar el Reel' });
  }
}
