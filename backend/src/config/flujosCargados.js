import fs from 'fs';
import path from 'path';

const rutaNormal = path.join(process.cwd(), 'src', 'modeloia', 'flux_keiko.json');
const rutaPro = path.join(process.cwd(), 'src', 'modeloia', 'flux_advanced.json');
const rutaStickers = path.join(process.cwd(), 'src', 'modeloia', 'stickers.json');
const rutaAnime = path.join(process.cwd(), 'src', 'modeloia', 'anime.json');
const rutaRMBG = path.join(process.cwd(), 'src', 'modeloia', 'RMBG.json');
const rutaUpscale = path.join(process.cwd(), 'src', 'modeloia', 'upscale.json');
const rutaWallpaper = path.join(process.cwd(), 'src', 'modeloia', 'flux_wallpaper.json'); // 👈 nueva línea

export const flujosCargados = {
  normal: JSON.parse(fs.readFileSync(rutaNormal, 'utf-8')),
  pro: JSON.parse(fs.readFileSync(rutaPro, 'utf-8')),
  stickers: JSON.parse(fs.readFileSync(rutaStickers, 'utf-8')),
  anime: JSON.parse(fs.readFileSync(rutaAnime, 'utf-8')),
  rmbg: JSON.parse(fs.readFileSync(rutaRMBG, 'utf-8')),
  upscale: JSON.parse(fs.readFileSync(rutaUpscale, 'utf-8')),
  wallpaper: JSON.parse(fs.readFileSync(rutaWallpaper, 'utf-8')) // 👈 nueva entrada
};
