import { postCarouselAccount2 } from '../jobs/postInstagramCarousel.account2.js';

export async function publishCarouselAccount2(req, res) {
  try {
    const limit = Math.min(parseInt(req.body?.limit ?? req.query?.limit ?? 5, 10), 10);
    const titulo = (req.body?.titulo ?? req.query?.titulo ?? 'Selección del día').toString();
    const tagsExtra = (req.body?.tagsExtra ?? req.query?.tagsExtra ?? '')
      .toString()
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const out = await postCarouselAccount2({ limit, titulo, tagsExtra, dryRun: false });
    if (!out) return res.status(204).send(); // sin imágenes publicables
    return res.json(out);
  } catch (e) {
    console.error('[publish-carousel-one] ERROR', e?.response?.data || e.message);
    return res.status(500).json({ error: 'No se pudo publicar el carrusel' });
  }
}
