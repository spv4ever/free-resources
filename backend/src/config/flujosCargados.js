// src/config/flujosCargados.js
import fs from 'fs';
import path from 'path';

const rutaNormal = path.join(process.cwd(), 'src', 'modeloia', 'flux_keiko.json');
const rutaPro = path.join(process.cwd(), 'src', 'modeloia', 'flux_advanced.json');

export const flujosCargados = {
  normal: JSON.parse(fs.readFileSync(rutaNormal, 'utf-8')),
  pro: JSON.parse(fs.readFileSync(rutaPro, 'utf-8'))
};
