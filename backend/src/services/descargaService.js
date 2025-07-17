// services/descargaService.js
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';

const execFileAsync = promisify(execFile);
const CARPETA_TEMP = path.resolve('temp/downloads');

export const procesarDescarga = async (url, formato = 'mp4') => {
  try {
    if (!fs.existsSync(CARPETA_TEMP)) {
      fs.mkdirSync(CARPETA_TEMP, { recursive: true });
    }

    // Generar nombre seguro y único
    const safeId = nanoid(10);

    const outputTemplate = path.join(CARPETA_TEMP, `${safeId}.%(ext)s`);

    // Formato dinámico seguro según plataforma
    let args = [
      url,
      '-o', outputTemplate,
      '--no-playlist',
      '--quiet',
      '--no-warnings',
      '--print-json'
    ];

    // Instagram no soporta bestvideo+bestaudio
    const usarBestSolo = url.includes('instagram.com') || url.includes('tiktok.com');

    if (formato === 'mp3') {
      args.push('-f', 'bestaudio');
      args.push('--extract-audio');
      args.push('--audio-format', 'mp3');
    } else if (formato === 'mp4') {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            args.push('-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best');
        } else {
            args.push('-f', 'mp4');
        }
    } else if (formato === 'best' && usarBestSolo) {
      args.push('-f', 'best');
    } else if (formato === 'best') {
      args.push('-f', 'bestvideo+bestaudio');
    }
    args.push('--no-geo-bypass');
    args.push('--geo-bypass-country', 'ES');
    const { stdout } = await execFileAsync('yt-dlp', args);

    const metadata = JSON.parse(stdout);
    const ext = formato === 'mp3' ? 'mp3' : metadata.ext;
    const filename = `${safeId}.${ext}`;
    const filepath = path.join(CARPETA_TEMP, filename);

    return {
      filename,
      filepath,
      metadata: {
        title: metadata.title,
        uploader: metadata.uploader,
        duration: metadata.duration,
        webpage_url: metadata.webpage_url,
        thumbnail: metadata.thumbnail
      },
      platform: metadata.extractor_key
    };
  } catch (error) {
    console.error('Error en procesarDescarga:', error);
    return null;
  }
};
