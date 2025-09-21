import express from 'express';
import ImagenGenerada from '../models/ImagenGenerada.js'; // 👈 NUEVO
import { pickRandomCandidate, markAsPosted, tagCloudinaryPosted } from '../services/igQueueService.js';
import { createContainer, publishContainer } from '../services/instagramService.js';
import { buildCaption } from '../services/captionService.js';

const router = express.Router();

function optionalAdminKey(req, res, next) {
  const required = process.env.ADMIN_KEY;
  if (!required) return next();
  if (req.headers['x-admin-key'] !== required) return res.status(403).json({ error: 'Forbidden' });
  next();
}

async function handlePublishOne(req, res) {
  try {
    const isGET   = req.method === 'GET';
    const account = isGET ? req.query.account : req.body?.account;
    const theme   = isGET ? (req.query.theme ?? null) : (req.body?.theme ?? null);
    const dryRun  = isGET ? (req.query.dryRun === '1' || req.query.dryRun === 'true') : !!req.body?.dryRun;
    const id      = isGET ? req.query.id : req.body?.id;              // 👈 NUEVO

    if (!account) return res.status(400).json({ error: 'Falta account' });

    const igUserId    = process.env.IG_USER_ID_ACCOUNT2;
    const accessToken = process.env.IG_ACCESS_TOKEN_ACCOUNT2;
    if (!igUserId || !accessToken) {
      return res.status(500).json({ error: 'IG credentials no configuradas' });
    }

    let candidate;

    if (id) {
      // 👇 Busca esa imagen y valida que sea apta y no publicada aún en esa cuenta
      candidate = await ImagenGenerada.findOne({
        _id: id,
        status: 'completada',
        visible: true,
        publishable: true,
        $or: [
          { publications: { $exists: false } },
          { publications: { $size: 0 } },
          { publications: { $not: { $elemMatch: { platform: 'instagram', account } } } }
        ]
      })
      .select('_id prompt finalUrl url cloudinaryPublicId tematica publications')
      .lean();

      if (!candidate) {
        return res.status(404).json({ error: 'No apta o ya publicada para esta cuenta', id });
      }
    } else {
      // Aleatoria como antes
      candidate = await pickRandomCandidate({ account, platform: 'instagram', theme });
      if (!candidate) return res.status(204).send();
    }

    const imageUrl = candidate.finalUrl || candidate.url;
    if (!imageUrl) return res.status(422).json({ error: 'La imagen no tiene finalUrl/url', id: candidate._id });

    const caption = buildCaption({ prompt: candidate.prompt, tematica: candidate.tematica });

    if (dryRun) {
      return res.json({
        dryRun: true,
        candidateId: candidate._id,
        imageUrl,
        captionPreview: caption.slice(0, 300)
      });
    }

    const creationId  = await createContainer({ igUserId, accessToken, imageUrl, caption });
    const publishedId = await publishContainer({ igUserId, accessToken, creationId });

    await markAsPosted({ id: candidate._id, platform: 'instagram', account, postId: publishedId });
    await tagCloudinaryPosted({ publicId: candidate.cloudinaryPublicId, account });

    return res.json({ ok: true, candidateId: candidate._id, publishedId });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Error publicando' });
  }
}

router.post('/publish-one', handlePublishOne);
router.get('/publish-one',  handlePublishOne);

// --- NUEVO: diagnóstico de cola ---

router.get('/queue-stats', async (req, res) => {
  try {
    const account = req.query.account;
    const platform = 'instagram';
    const theme = req.query.theme ?? null;

    const base = {
      status: 'completada',
      visible: true,
      ...(theme ? { tematica: theme } : {})
    };

    const totalCompletadas = await ImagenGenerada.countDocuments(base);
    const withPublishable  = await ImagenGenerada.countDocuments({ ...base, publishable: true });
    const withFinalUrl     = await ImagenGenerada.countDocuments({
      ...base, publishable: true,
      finalUrl: { $exists: true, $ne: null, $ne: '' }
    });

    // filtro de "no publicada aún en esta cuenta"
    const notPostedFilter = {
      ...base, publishable: true,
      finalUrl: { $exists: true, $ne: null, $ne: '' },
      $or: [
        { publications: { $exists: false } },
        { publications: { $size: 0 } },
        { publications: { $not: { $elemMatch: { platform, account } } } }
      ]
    };
    const notPosted = await ImagenGenerada.countDocuments(notPostedFilter);
    const sample = await ImagenGenerada.findOne(notPostedFilter)
      .select('_id finalUrl url prompt publications publishable visible status')
      .lean();

    return res.json({
      account,
      theme,
      counts: { totalCompletadas, withPublishable, withFinalUrl, notPosted },
      sample // una candidata que sí pasaría todos los filtros (si existe)
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Error stats' });
  }
});



export default router;
