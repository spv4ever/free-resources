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
            id: l.id,
            name: l.name,
            net: l.net,
            status: l.status,
            image: l.image || null,
            webcast: l.vidURLs?.[0] || l.webcast || null,
            pad: {
              name: l.pad?.name || '',
              location: {
                name: l.pad?.location?.name || '',
                country_code: l.pad?.location?.country_code || ''
              },
              latitude: l.pad?.latitude || null,
              longitude: l.pad?.longitude || null
            },
            rocket: {
              configuration: {
                full_name: l.rocket?.configuration?.full_name || '',
                manufacturer: {
                  name: l.rocket?.configuration?.manufacturer?.name || ''
                }
              }
            },
            mission: l.mission
              ? {
                  name: l.mission.name || '',
                  description: l.mission.description || '',
                  type: l.mission.type || '',
                  orbit: {
                    name: l.mission.orbit?.name || ''
                  }
                }
              : null,
            launch_service_provider: {
              name: l.launch_service_provider?.name || '',
              country_code: l.launch_service_provider?.country_code || ''
            },
            spacecraft: l.rocket?.spacecraft_stage?.spacecraft
              ? {
                  name: l.rocket.spacecraft_stage.spacecraft.name || '',
                  manufacturer: {
                    name: l.rocket.spacecraft_stage.spacecraft.spacecraft_config?.manufacturer?.name || ''
                  }
                }
              : null,
            upcoming: false,
            last_updated: new Date(),
            rocketName: l.rocket?.configuration?.name || 'Desconocido'
          },
          { upsert: true }
        );
      }
    }

    console.log('✅ Lanzamientos históricos cargados correctamente.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error cargando históricos:', err);
    await mongoose.disconnect();
  }
}

fetchHistoricalData();
