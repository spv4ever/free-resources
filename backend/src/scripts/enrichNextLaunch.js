// enrichNextLaunch.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import SpacexLaunch from '../models/SpacexLaunch.js';

dotenv.config();

const MAX_API_CALLS_PER_HOUR = parseInt(process.env.MAX_API_CALLS_PER_HOUR || '15');
const RESERVED_FOR_OTHER_USES = parseInt(process.env.RESERVED_FOR_OTHER_USES || '2');
const FREQ_ENRICH_CALLS_PER_HOUR = parseInt(process.env.FREQ_ENRICH_CALLS_PER_HOUR || '6');

const API_ALLOWED = MAX_API_CALLS_PER_HOUR - RESERVED_FOR_OTHER_USES;
const isScriptExecution = process.argv[1].includes('enrichNextLaunch');

async function enrichNextLaunch() {
  if (FREQ_ENRICH_CALLS_PER_HOUR > API_ALLOWED) {
    console.warn('⏸️ No hay suficientes slots de API disponibles. Reduce FREQ_ENRICH_CALLS_PER_HOUR.');
    return;
  }

  try {
    if (isScriptExecution) await mongoose.connect(process.env.MONGO_URI);
    console.log('[🔁] Conectado a MongoDB');

    const launch = await SpacexLaunch.findOne({ isEnriched: { $ne: true } }).sort({ net: 1 });
    if (!launch) {
      console.log('✅ No hay lanzamientos pendientes de enriquecer.');
      if (isScriptExecution) await mongoose.disconnect();
      return;
    }

    const { id } = launch;
    const { data: full } = await axios.get(`https://ll.thespacedevs.com/2.2.0/launch/${id}`);

    const cleanedTimeline = Array.isArray(full.timeline)
      ? full.timeline.map(item => ({
          type: {
            id: item.type?.id || null,
            abbrev: item.type?.abbrev || '',
            description: item.type?.description || ''
          },
          relative_time: item.relative_time || ''
        }))
      : [];

    await SpacexLaunch.findOneAndUpdate(
        { id },
        {
            $set: {
            id: full.id,
            name: full.name,
            net: full.net,
            status: full.status,
            image: full.image || null,
            webcast: full.vidURLs?.[0]?.url || null,
            vidURLs: full.vidURLs || [],
            mission_patches: full.mission_patches || [],
            updates: full.updates || [],
            timeline: cleanedTimeline,
            pad: full.pad
                ? {
                    name: full.pad.name || '',
                    location: {
                    name: full.pad.location?.name || '',
                    country_code: full.pad.location?.country_code || ''
                    },
                    latitude: full.pad.latitude || null,
                    longitude: full.pad.longitude || null
                }
                : null,
            rocket: full.rocket || null,
            mission: full.mission || null,
            launch_service_provider: full.launch_service_provider || null,
            spacecraft: full.rocket?.spacecraft_stage?.spacecraft || null,
            rocketName: full.rocket?.configuration?.name || '',
            upcoming: ![3, 4, 5, 6, 7].includes(full.status?.id),
            last_updated: new Date(),
            isEnriched: true
            }
        },
        { upsert: true, new: true }
        );

    console.log(`✅ Enriquecido: ${full.name}`);
    if (isScriptExecution) await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error enriqueciendo lanzamiento:', err.message);
    if (isScriptExecution) await mongoose.disconnect();
  }
}

// Ejecutar si se llama directamente
if (isScriptExecution) {
  enrichNextLaunch();
}

export default enrichNextLaunch;
