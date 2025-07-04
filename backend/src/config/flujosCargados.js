// src/config/flujosCargados.js
import fs from 'fs';
import path from 'path';

const rutaNormal = path.join(process.cwd(), 'src', 'modeloia', 'flux_keiko.json');
const rutaPro = path.join(process.cwd(), 'src', 'modeloia', 'flux_advanced.json');
const rutaStickers = path.join(process.cwd(), 'src', 'modeloia', 'stickers.json');
const rutaAnime = path.join(process.cwd(), 'src', 'modeloia', 'anime.json');

export const flujosCargados = {
  normal: JSON.parse(fs.readFileSync(rutaNormal, 'utf-8')),
  pro: JSON.parse(fs.readFileSync(rutaPro, 'utf-8')),
  stickers: JSON.parse(fs.readFileSync(rutaStickers, 'utf-8')),
  anime: JSON.parse(fs.readFileSync(rutaAnime, 'utf-8')) // 👈 nuevo flujo
};