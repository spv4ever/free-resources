import axios from 'axios';
import NasaImage from '../models/NasaImage.js';
import dotenv from 'dotenv';

dotenv.config();

export const fetchMissingImagesForMonth = async (year, month) => {
  const apiKey = process.env.NASA_KEY_ID;
  const totalDays = new Date(year, month, 0).getDate(); // num días del mes
  const baseDate = `${year}-${String(month).padStart(2, '0')}`;

  const existing = await NasaImage.find({
    fecha: { $regex: `^${baseDate}` }
  }).distinct('fecha');

  const missingDates = [];

  for (let day = 1; day <= totalDays; day++) {
    const date = `${baseDate}-${String(day).padStart(2, '0')}`;
    if (!existing.includes(date)) {
      missingDates.push(date);
    }
  }

  const inserted = [];

  for (const date of missingDates) {
    try {
      const res = await axios.get(`https://api.nasa.gov/planetary/apod`, {
        params: {
          date,
          api_key: apiKey
        }
      });

      const data = res.data;

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
      inserted.push(data.date);
    } catch (err) {
      console.error(`❌ Error al obtener ${date}:`, err.response?.data || err.message);
    }
  }

  return {
    total: totalDays,
    existentes: existing.length,
    nuevos: inserted.length,
    fechasInsertadas: inserted
  };
};
