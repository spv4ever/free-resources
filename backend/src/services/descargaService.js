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

    // Nombre base único para todos los archivos
    const safeId = nanoid(6);
    const outputTemplate = path.join(CARPETA_TEMP, `${safeId}-%(id)s.%(ext)s`);

    const usarBestSolo = url.includes('instagram.com') || url.includes('tiktok.com');

    let args = [
      url,
      '-o', outputTemplate,
      '--no-warnings',
      '--no-playlist',
      '--quiet',
      '--print-json',
      '--no-geo-bypass',
      '--geo-bypass-country', 'ES'
    ];

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

    const { stdout } = await execFileAsync('yt-dlp', args);

    // Parsear múltiples JSON
    const jsonObjects = stdout
      .split('\n')
      .filter(line => line.trim().startsWith('{'))
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          console.warn('❌ JSON malformado ignorado:', line);
          return null;
        }
      })
      .filter(Boolean);

    if (!jsonObjects.length) {
      return null;
    }

    // Crear resultado por cada bloque
    const resultados = jsonObjects.map((metadata) => {
      const ext = formato === 'mp3' ? 'mp3' : metadata.ext || 'mp4';
      const filename = `${safeId}-${metadata.id}.${ext}`;
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
    });

    return resultados;
  } catch (error) {
    console.error('Error en procesarDescarga:', error);
    return null;
  }
};
