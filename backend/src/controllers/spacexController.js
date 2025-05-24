
import axios from 'axios';
import SpacexLaunch from '../models/SpacexLaunch.js';
import enrichNextLaunch from '../scripts/enrichNextLaunch.js';

const API_URL = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?lsp__name=SpaceX&limit=10';


// 1. Obtener los 3 próximos lanzamientos desde la API
export async function fetchNextLaunchesFromAPI() {
  const response = await axios.get(API_URL);
  return response.data.results;
}

// 2. Actualizar base de datos manteniendo históricos y actualizando los próximos
export async function updateSpacexLaunches() {
  const newLaunches = await fetchNextLaunchesFromAPI();
  const newIds = newLaunches.map(l => l.id);

  // A. Obtener todos los que actualmente están marcados como próximos en la base de datos
  const currentUpcoming = await SpacexLaunch.find({ upcoming: true });

  for (const launch of currentUpcoming) {
    const apiLaunch = newLaunches.find(l => l.id === launch.id);

    if (apiLaunch) {
      // Si sigue en la API y su estado indica que ya ocurrió, lo pasamos a histórico
      if ([3, 4, 5, 6, 7].includes(apiLaunch.status?.id)) {
        await SpacexLaunch.findByIdAndUpdate(launch._id, { upcoming: false, status: apiLaunch.status });
        console.log(`[CRON] Marcado como histórico (por status): ${launch.name}`);
      }
    } else {
      // Si ya no está en la API y la fecha ya pasó, lo marcamos como histórico
      if (new Date(launch.net) < new Date()) {
        await SpacexLaunch.findByIdAndUpdate(launch._id, { upcoming: false });
        console.log(`[CRON] Marcado como histórico (por fecha): ${launch.name}`);
      } else {
        // Si no está en la API y aún es futuro, lo eliminamos
        await SpacexLaunch.findByIdAndDelete(launch._id);
        console.log(`[CRON] Eliminado (ya no aparece en API y es futuro): ${launch.name}`);
      }
    }
  }

  // B. Insertar o actualizar los nuevos próximos
  for (const l of newLaunches) {
    const isUpcoming = ![3, 4, 5, 6, 7].includes(l.status?.id);

    await SpacexLaunch.findOneAndUpdate(
      { id: l.id },
      {
        id: l.id,
        name: l.name,
        net: l.net,
        status: l.status,
        image: l.image || null,
        webcast: l.vidURLs?.[0] || null,
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
        upcoming: isUpcoming,
        last_updated: new Date()
      },
      { upsert: true }
    );


    console.log(`[CRON] ${isUpcoming ? 'Guardado como próximo' : 'Actualizado como histórico'}: ${l.name}`);
  }

  console.log('[CRON] Actualización de lanzamientos SpaceX completada.');
}

// 3. Obtener lanzamientos próximos
export async function getSpacexLaunches(req, res) {
  try {
    const launches = await SpacexLaunch.find({ upcoming: true }).sort({ net: 1 });
    res.json(launches);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching upcoming launches' });
  }
}

// 4. Obtener lanzamientos históricos
export async function getSpacexHistory(req, res) {
  try {
    const launches = await SpacexLaunch.find({ upcoming: false }).sort({ net: -1 }).limit(60);
    res.json(launches);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching history' });
  }
}

export async function getSpacexStats(req, res) {
  try {
    const stats = await SpacexLaunch.aggregate([
      { $match: { upcoming: false } },
      {
        $group: {
          _id: {
            year: { $year: "$net" },
            rocket: "$rocketName",
            status: "$status.name"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1 } }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Error generating stats' });
  }
}

// controllers/spacexController.js

export const getLaunchById = async (req, res) => {
  const { id } = req.params;
  try {
    const launch = await SpacexLaunch.findById(id);
    if (!launch) return res.status(404).json({ message: 'Lanzamiento no encontrado' });
    res.json(launch);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener lanzamiento', error: error.message });
  }
};


export const getPendingEnrichCount = async (req, res) => {
  try {
    const count = await SpacexLaunch.countDocuments({ isEnriched: { $ne: true } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Error al contar lanzamientos sin enriquecer' });
  }
};

export const handleEnrichOneLaunch = async (req, res) => {
  try {
    await enrichNextLaunch(false); // ❗ No cerrar conexión aquí
    res.json({ message: 'Lanzamiento enriquecido correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al enriquecer lanzamiento', error: err.message });
  }
};