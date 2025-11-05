// backend/src/lib/igUrlHelpers.js
import fetch from 'node-fetch';

export function toInstagramJpegUrl(url) {
  try {
    const u = new URL(url);
    if (!/res\.cloudinary\.com$/i.test(u.hostname)) return url;

    // Inserta transformaciones tras /upload/
    u.pathname = u.pathname.replace(
      /\/image\/upload\/(?!.*\/f_jpg)/,
      '/image/upload/f_jpg,q_auto:good,w_1080/'
    );

    // Fuerza extensión .jpg si termina en .png/.webp/.avif
    u.pathname = u.pathname.replace(/\.(png|webp|avif)(?=$)/i, '.jpg');

    return u.toString();
  } catch {
    return url;
  }
}

export async function assertInstagramFetchable(url, expectedKind /* 'image' | 'video' */) {
  const res = await fetch(url, { method: 'HEAD' });
  if (!res.ok) throw new Error(`URL no accesible: HTTP ${res.status}`);
  const ct = (res.headers.get('content-type') || '').toLowerCase();

  if (expectedKind === 'image') {
    if (!ct.startsWith('image/jpeg')) {
      throw new Error(`Content-Type inválido para imagen: ${ct} (se requiere image/jpeg)`);
    }
  } else if (expectedKind === 'video') {
    // IG Graph espera MP4 (H.264/AAC). Normalmente: video/mp4
    if (!ct.includes('video')) {
      throw new Error(`Content-Type inválido para vídeo: ${ct} (se espera video/mp4)`);
    }
  }
}

export function guessKindFromUrl(url) {
  const u = new URL(url);
  const ext = (u.pathname.split('.').pop() || '').toLowerCase();
  if (['mp4', 'mov', 'm4v'].includes(ext)) return 'video';
  // Por defecto, lo tratamos como imagen
  return 'image';
}
