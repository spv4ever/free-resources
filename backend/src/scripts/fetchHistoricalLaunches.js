
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import SpacexLaunch from '../models/SpacexLaunch.js';

dotenv.config();

const API_URL = 'https://ll.thespacedevs.com/2.2.0/launch/?search=spacex&limit=1000&ordering=net&window_end__gte=2025-01-01';

async function fetchHistoricalData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');

    const response = await axios.get(API_URL);
    const launches = response.data.results;

    for (const l of launches) {
      if (l.status?.id === 3) {
        await SpacexLaunch.findOneAndUpdate(
          { id: l.id },
          {
            name: l.name,
            net: l.net,
            status: l.status,
            image: l.image || null,
            webcast: l.webcast,
            pad: l.pad,
            last_updated: new Date(),
            upcoming: false,
            id: l.id,
            rocketName: l.rocket?.configuration?.name || 'Desconocido'
          },
          { upsert: true }
        );
      }
    }

    console.log('Lanzamientos históricos cargados');
    mongoose.disconnect();
  } catch (err) {
    console.error('Error cargando históricos:', err);
    mongoose.disconnect();
  }
}

fetchHistoricalData();
