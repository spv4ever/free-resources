import cron from 'node-cron';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import NasaImage from '../models/NasaImage.js';
import dotenv from 'dotenv';

dotenv.config();

const logFile = path.resolve('logs/nasa_job.log');

const logToFile = (message) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
};

const fetchNasaImageDaily = () => {
  console.log('🛰️ Job de NASA activado - Se ejecutará cada día a las 05:05 UTC');
  logToFile('🛰️ Job iniciado y programado correctamente');

  cron.schedule('5 5 * * *', async () => {
    try {
      const apiKey = process.env.NASA_KEY_ID;
      const res = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`);
      const data = res.data;

      const exists = await NasaImage.findOne({ fecha: data.date });
      if (exists) {
        const msg = `Imagen del ${data.date} ya existe, no se insertó`;
        console.log('🟡', msg);
        logToFile(`🟡 ${msg}`);
        return;
      }

      const nueva = new NasaImage({
        ref: `APOD-${data.date}`,
        fecha: data.date,
        url: data.url,
        titulo: data.title,
        descripcion: data.explanation,
        hdurl: data.hdurl || '',
        copyright: data.copyright || '',
        media_type: data.media_type
      });

      await nueva.save();
      const msg = `✅ Imagen del día guardada: ${data.date}`;
      console.log(msg);
      logToFile(msg);
    } catch (err) {
      const errorMsg = `❌ Error al obtener imagen NASA: ${err.message}`;
      console.error(errorMsg);
      logToFile(errorMsg);
    }
  }, {
    timezone: 'UTC'
  });
};

export const fetchTodayImage = async () => {
    try {
      const apiKey = process.env.NASA_KEY_ID;
      const res = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`);
      const data = res.data;
  
      const exists = await NasaImage.findOne({ fecha: data.date });
      if (exists) {
        const msg = `Imagen del ${data.date} ya existe`;
        console.log('🟡', msg);
        logToFile(`🟡 ${msg}`);
        return;
      }
  
      const nueva = new NasaImage({
        ref: `APOD-${data.date}`,
        fecha: data.date,
        url: data.url,
        titulo: data.title,
        descripcion: data.explanation,
        hdurl: data.hdurl || '',
        copyright: data.copyright || '',
        media_type: data.media_type
      });
  
      await nueva.save();
      const msg = `✅ Imagen del día guardada: ${data.date}`;
      console.log(msg);
      logToFile(msg);
    } catch (err) {
      const errorMsg = `❌ Error al obtener imagen NASA: ${err.message}`;
      console.error(errorMsg);
      logToFile(errorMsg);
    }
  };
  

export default fetchNasaImageDaily;
