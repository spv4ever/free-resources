// src/controllers/nasaDownloadController.js
import axios from 'axios';
import path from 'path';
import mime from 'mime-types';

// Ajusta los hosts permitidos según tus fuentes
const ALLOWED_HOSTS = new Set([
  'apod.nasa.gov',
  'www.nasa.gov',
  'images-assets.nasa.gov',
  'img.youtube.com',
  'i.ytimg.com',
]);

const sanitizeName = (s = 'nasa-image') =>
  s.replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').slice(0, 80) || 'nasa-image';

export const downloadFromNasa = async (req, res) => {
  try {
    const { src, filename } = req.query;
    if (!src) return res.status(400).json({ error: 'Falta parámetro src' });

    let urlObj;
    try { urlObj = new URL(src); }
    catch { return res.status(400).json({ error: 'URL inválida' }); }

    if (!ALLOWED_HOSTS.has(urlObj.hostname)) {
      return res.status(403).json({ error: 'Host no permitido' });
    }

    const upstream = await axios.get(src, {
      responseType: 'arraybuffer',
      timeout: 20000,
      maxContentLength: 50 * 1024 * 1024, // 50MB, ajusta si quieres
      maxBodyLength: 50 * 1024 * 1024,
    });

    const contentType = upstream.headers['content-type'] || 'application/octet-stream';
    let ext = mime.extension(contentType) || path.extname(urlObj.pathname).replace('.', '') || 'bin';

    const base = sanitizeName(filename || path.basename(urlObj.pathname, '.' + ext) || 'nasa-image');
    const finalName = `${base}.${ext}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${finalName}"`);
    res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');

    return res.status(200).send(Buffer.from(upstream.data));
  } catch (err) {
    console.error('[NASA DOWNLOAD] error:', err?.message || err);
    return res.status(500).json({ error: 'No se pudo descargar el recurso' });
  }
};
