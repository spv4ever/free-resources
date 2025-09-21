// services/igQueueService.js
import ImagenGenerada from '../models/ImagenGenerada.js';
import fetch from 'node-fetch';

export async function pickRandomCandidate({ account, platform = 'instagram', theme = null }) {
  const match = {
    status: 'completada',
    visible: true,
    publishable: true,
    // si quieres restringir por tema:
    ...(theme ? { tematica: theme } : {})
  };

  const pipeline = [
    { $match: match },
    { $match: {
        $or: [
          { publications: { $exists: false } },
          { publications: { $size: 0 } },
          { publications: { $not: { $elemMatch: { platform, account } } } }
        ]
      }
    },
    { $sample: { size: 1 } },
    { $project: {
        _id: 1, prompt: 1, finalUrl: 1, url: 1, cloudinaryPublicId: 1, tematica: 1
      }
    }
  ];

  const [doc] = await ImagenGenerada.aggregate(pipeline);
  return doc || null;
}

export async function markAsPosted({ id, platform = 'instagram', account, postId }) {
  const doc = await ImagenGenerada.findById(id);
  if (!doc) throw new Error('Imagen no encontrada');

  const already = (doc.publications || []).some(p => p.platform === platform && p.account === account);
  if (!already) {
    doc.publications = doc.publications || [];
    doc.publications.push({ platform, account, postId, postedAt: new Date() });
    await doc.save();
  }
  return doc;
}

// Opcional: tag en Cloudinary
export async function tagCloudinaryPosted({ publicId, account }) {
  if (!process.env.CLOUDINARY_DO_TAG || process.env.CLOUDINARY_DO_TAG !== 'true') return;
  if (!publicId) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/tags/ig_posted_${account}`;
  const body = new URLSearchParams();
  body.append('public_ids[]', publicId);

  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  }).catch(() => {});
}
