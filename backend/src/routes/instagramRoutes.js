import express from 'express';
import ImagenGenerada from '../models/ImagenGenerada.js';
import { pickRandomCandidate, markAsPosted, tagCloudinaryPosted } from '../services/igQueueService.js';
import { createContainer, publishContainer } from '../services/instagramService.js';
import { buildCaption } from '../services/captionService.js';
import { publishCarouselAccount2 } from '../controllers/instagramCarousel.controller.js';
import { publishReelAccount2 } from '../controllers/instagramReel.controller.js';
import { getIGMonitorSummary, getIGRecent, getIGEligible } from '../controllers/instagramMonitor.controller.js';
import { publishContainerWithWait } from '../services/instagramService.js';

// ⬅️ NUEVO: para HEAD preflight
import fetch from 'node-fetch';

const router = express.Router();

/* ⬅️ NUEVO: helpers de saneo/validación */
function forceCloudinaryJpeg(url, { width = 1080, quality = 'auto:good' } = {}) {
  try {
    const u = new URL(url);
    if (!/res\.cloudinary\.com$/i.test(u.hostname)) return url;

    // Inserta transformaciones tras /image/upload/
    const trans = ['f_jpg', quality ? `q_${quality}` : null, width ? `w_${width}` : null]
      .filter(Boolean).join(',');

    u.pathname = u.pathname.replace(/\/image\/upload\/(?!.*\/f_jpg)/, `/image/upload/${trans}/`);
    // Fuerza extensión .jpg si venía .png/.webp/.avif
    u.pathname = u.pathname.replace(/\.(png|webp|avif)(?=$)/i, '.jpg');
    return u.toString();
  } catch {
    return url;
  }
}

async function headContentType(url) {
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    const cl = r.headers.get('content-length');
    return { ok: r.ok, status: r.status, ct, cl };
  } catch (e) {
    return { ok: false, status: 0, ct: 'HEAD_FAIL', cl: null, err: e.message };
  }
}
/* FIN helpers nuevos */

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
    const id      = isGET ? req.query.id : req.body?.id; // NUEVO ya en tu código

    if (!account) return res.status(400).json({ error: 'Falta account' });

    const igUserId    = process.env.IG_USER_ID_ACCOUNT2;
    const accessToken = process.env.IG_ACCESS_TOKEN_ACCOUNT2;
    if (!igUserId || !accessToken) {
      return res.status(500).json({ error: 'IG credentials no configuradas' });
    }

    let candidate;

    if (id) {
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
      candidate = await pickRandomCandidate({ account, platform: 'instagram', theme });
      if (!candidate) return res.status(204).send();
    }

    const originalUrl = candidate.finalUrl || candidate.url;
    if (!originalUrl) return res.status(422).json({ error: 'La imagen no tiene finalUrl/url', id: candidate._id });

    // ⬅️ NUEVO: saneo y preflight (evita 9004/2207052 en prod)
    const fixedUrl = forceCloudinaryJpeg(originalUrl);
    const pre = await headContentType(fixedUrl);
    console.log('[IG POST][preflight]', { originalUrl, fixedUrl, status: pre.status, ct: pre.ct, len: pre.cl });

    if (!pre.ok || !/^image\/jpeg/.test(pre.ct || '')) {
      return res.status(422).json({
        error: 'La URL no es válida para IG (se requiere image/jpeg accesible)',
        details: { status: pre.status, contentType: pre.ct, testedUrl: fixedUrl },
      });
    }

    const caption = buildCaption({ prompt: candidate.prompt, tematica: candidate.tematica });

    if (dryRun) {
      return res.json({
        dryRun: true,
        candidateId: candidate._id,
        imageUrlOriginal: originalUrl,
        imageUrlUsed: fixedUrl,
        head: { status: pre.status, contentType: pre.ct, length: pre.cl },
        captionPreview: caption.slice(0, 300)
      });
    }

    // ⬅️ CAMBIO: usamos fixedUrl en lugar de originalUrl
    const creationId  = await createContainer({ igUserId, accessToken, imageUrl: fixedUrl, caption });
    const publishedId = await publishContainerWithWait({
        igUserId,
        accessToken,
        creationId,
        isVideoLike: false, // foto en este endpoint
        log: console
      });

    await markAsPosted({ id: candidate._id, platform: 'instagram', account, postId: publishedId });
    await tagCloudinaryPosted({ publicId: candidate.cloudinaryPublicId, account });

    return res.json({ ok: true, candidateId: candidate._id, publishedId, usedUrl: fixedUrl });
  } catch (e) {
    // ⬅️ NUEVO: mejora el mensaje cuando es 9004/2207052
    const body = e?.body || e; // por si tu createContainer lanza con .body
    const code = body?.error?.code;
    const sub  = body?.error?.error_subcode;

    console.error('[IG POST][error]', e);
    return res.status(500).json({
      error: e.message || 'Error publicando',
      hint: (code === 9004 || sub === 2207052)
        ? 'Fuerza JPEG (f_jpg + .jpg) y asegúrate de que el Content-Type sea image/jpeg accesible públicamente.'
        : undefined
    });
  }
}

router.post('/publish-one', handlePublishOne);
router.get('/publish-one',  handlePublishOne);

// --- diagnóstico de cola ---
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
      sample
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Error stats' });
  }
});

// Carrusel y reel (sin cambios)
router.post('/publish-carousel-one', publishCarouselAccount2);
router.get('/publish-carousel-one', publishCarouselAccount2);
router.post('/publish-reel-one', publishReelAccount2);
router.get('/publish-reel-one', publishReelAccount2);
router.get('/monitor/summary', getIGMonitorSummary);
router.get('/monitor/recent', getIGRecent);
router.get('/monitor/eligible', getIGEligible);

export default router;
