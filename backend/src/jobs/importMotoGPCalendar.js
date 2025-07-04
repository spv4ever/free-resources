import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import SportsEvent from '../models/SportsEvent.js';

dotenv.config();

const ICS_FILES = [
  { path: './src/data/mototiming-MotoGP-calendar-2025.ics', category: 'MotoGP', sport: 'motogp' },
  { path: './src/data/mototiming-Moto2-calendar-2025.ics', category: 'Moto2', sport: 'motogp' },
  { path: './src/data/mototiming-Moto3-calendar-2025.ics', category: 'Moto3', sport: 'motogp' },
  { path: './src/data/Formula_1.ics', category: 'Formula 1', sport: 'formula_1' }
];

// Función auxiliar para parsear fechas
const parseDate = (raw) => {
  if (!raw) return null;
  const match = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (!match) return null;
  const [, y, m, d, h, min, s] = match;
  const date = new Date(Date.UTC(+y, +m - 1, +d, +h, +min, +s));
  return isNaN(date.getTime()) ? null : date;
};

// Extraer tipo de sesión
const extractSessionType = (summary) => {
  if (!summary) return null;

  const lower = summary.toLowerCase();

  if (lower.includes('test') || lower.includes('shakedown')) return 'TEST';
  if (lower.includes('fp')) return 'FP';
  if (lower.includes('q')) return 'Q';
  if (lower.includes('spr')) return 'SPR';
  if (lower.includes('rac')) return 'RAC';
  if (lower.includes('wup')) return 'WUP';
  if (lower.includes('pr')) return 'PR';

  return null;
};
// Generar slug de evento
const generateEventSlug = (summary) => {
  const match = summary.match(/–\s(.+?)\sGP$/i);
  return match ? match[1].trim().toLowerCase().replace(/\s+/g, '-') : null;
};

// Parseador simple de ICS
const parseIcsFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const events = [];
  let current = null;

  for (let line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      current = {};
    } else if (line.startsWith('END:VEVENT')) {
      if (current) events.push(current);
      current = null;
    } else if (current) {
      if (line.startsWith('UID')) current.uid = line.split(':')[1]?.trim();
      if (line.startsWith('SUMMARY')) current.summary = line.split(':')[1]?.trim();
      if (line.startsWith('LOCATION')) current.location = line.split(':')[1]?.trim().replace(/\\,/g, ',');
      if (line.startsWith('DTSTART')) current.start = line.split(':').pop().trim();
      if (line.startsWith('DTEND')) current.end = line.split(':').pop().trim();
    }
  }

  return events;
};

const importMotoGPCalendar = async () => {
  try {
    console.log('🛠 Iniciando importación MotoGP...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    await SportsEvent.deleteMany({ sport: 'motogp' });
    console.log('🧹 Eventos MotoGP anteriores eliminados');

    for (const file of ICS_FILES) {
      const absPath = path.resolve(file.path);
      console.log(`📁 Procesando: ${absPath}`);
      const events = parseIcsFile(absPath);
      console.log(`📆 ${events.length} eventos encontrados para ${file.category}`);

      const bulkOps = [];

      for (const e of events) {
        const parsedStart = parseDate(e.start);
        const parsedEnd = parseDate(e.end);
        const sessionType = extractSessionType(e.summary);
        const eventSlug = generateEventSlug(e.summary);

        if (!parsedStart || isNaN(parsedStart.getTime())) {
          console.log(`⚠️ Evento sin fecha válida: ${e.summary}`);
          continue;
        }

        bulkOps.push({
          updateOne: {
            filter: { uid: e.uid },
            update: {
              $set: {
                title: e.summary,
                description: '',
                location: e.location || '',
                start: parsedStart,
                end: parsedEnd && !isNaN(parsedEnd.getTime()) ? parsedEnd : parsedStart,
                sport: 'motogp',
                competition: 'MotoGP World Championship',
                category: file.category,
                sessionType,
                eventSlug,
                metadata: {}
              }
            },
            upsert: true
          }
        });
      }

      if (bulkOps.length > 0) {
        const result = await SportsEvent.bulkWrite(bulkOps);
        const upserted = result.upsertedCount || 0;
        const modified = result.modifiedCount || 0;
        const totalOps = upserted + modified;
        console.log(`✅ ${totalOps} eventos procesados para ${file.category}`);
      } else {
        console.log(`⚠️ No se encontraron eventos válidos para insertar (${file.category})`);
      }
    }

    const total = await SportsEvent.countDocuments({ sport: 'motogp' });
    console.log(`📊 Total actual en colección: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante la importación:', err.message);
    process.exit(1);
  }
};


// Adaptar función extractSessionType para F1
const extractSessionTypeF1 = (summary) => {
  if (!summary) return null;
  const lower = summary.toLowerCase();
  if (lower.includes('practice')) return 'Practice';
  if (lower.includes('qualifying')) return 'Qualifying';
  if (lower.includes('race')) return 'Race';
  if (lower.includes('sprint')) return 'Sprint';
  return null;
};

// Generar slug para F1 (puedes usar similar o personalizar)
const generateEventSlugF1 = (summary) => {
  // Extrae el nombre del GP (ej: 'Hungarian Grand Prix') de la cadena summary
  const match = summary.match(/formula 1 (.+?) grand prix/i);
  if (match) return match[1].trim().toLowerCase().replace(/\s+/g, '-');
  return null;
};

const importF1Calendar = async () => {
  try {
    console.log('🛠 Iniciando importación Formula 1...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    await SportsEvent.deleteMany({ sport: 'formula_1' });
    console.log('🧹 Eventos Formula 1 anteriores eliminados');

    const file = ICS_FILES.find(f => f.sport === 'formula_1');
    const absPath = path.resolve(file.path);
    console.log(`📁 Procesando: ${absPath}`);
    const events = parseIcsFile(absPath);
    console.log(`📆 ${events.length} eventos encontrados para Formula 1`);

    const bulkOps = [];

    for (const e of events) {
      const parsedStart = parseDate(e.start);
      const parsedEnd = parseDate(e.end);
      const sessionType = extractSessionTypeF1(e.summary);
      const eventSlug = generateEventSlugF1(e.summary);

      if (!parsedStart || isNaN(parsedStart.getTime())) {
        console.log(`⚠️ Evento sin fecha válida: ${e.summary}`);
        continue;
      }

      bulkOps.push({
        updateOne: {
          filter: { uid: e.uid },
          update: {
            $set: {
              title: e.summary,
              description: '',
              location: e.location || '',
              start: parsedStart,
              end: parsedEnd && !isNaN(parsedEnd.getTime()) ? parsedEnd : parsedStart,
              sport: 'formula_1',
              competition: 'Formula 1 World Championship',
              category: file.category,
              sessionType,
              eventSlug,
              metadata: {}
            }
          },
          upsert: true
        }
      });
    }

    if (bulkOps.length > 0) {
      const result = await SportsEvent.bulkWrite(bulkOps);
      const upserted = result.upsertedCount || 0;
      const modified = result.modifiedCount || 0;
      const totalOps = upserted + modified;
      console.log(`✅ ${totalOps} eventos procesados para Formula 1`);
    } else {
      console.log(`⚠️ No se encontraron eventos válidos para insertar (Formula 1)`);
    }

    const total = await SportsEvent.countDocuments({ sport: 'formula_1' });
    console.log(`📊 Total actual en colección: ${total}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante la importación:', err.message);
    process.exit(1);
  }
};

importF1Calendar();
// importMotoGPCalendar();
