
import axios from 'axios';
import SpacexLaunch from '../models/SpacexLaunch.js';

const API_URL = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?search=spacex&limit=3';

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
        name: l.name,
        net: l.net,
        status: l.status,
        image: l.image || null,
        webcast: l.webcast,
        pad: l.pad,
        last_updated: new Date(),
        upcoming: isUpcoming,
        id: l.id,
        rocketName: l.rocket?.configuration?.name || 'Desconocido'
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
    const launches = await SpacexLaunch.find({ upcoming: false }).sort({ net: -1 }).limit(24);
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