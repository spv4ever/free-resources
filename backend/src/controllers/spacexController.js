
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

  // A. Marcar como históricos los que ya fueron lanzados o cancelados
  const currentUpcoming = await SpacexLaunch.find({ upcoming: true });

  for (const launch of currentUpcoming) {
    const apiLaunch = newLaunches.find(l => l.id === launch.id);
    if (apiLaunch && [3, 4, 5, 6, 7].includes(apiLaunch.status?.id)) {
      // Si se ha lanzado o cancelado, lo marcamos como histórico
      await SpacexLaunch.findByIdAndUpdate(launch._id, { upcoming: false, status: apiLaunch.status });
    }
  }

  // B. Eliminar los próximos que ya no están entre los siguientes 3
  await SpacexLaunch.deleteMany({ upcoming: true, id: { $nin: newIds } });
  // await SpacexLaunch.deleteMany({ upcoming: false, id: { $nin: newIds } });
  // C. Insertar o actualizar los nuevos próximos
  for (const l of newLaunches) {
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
        upcoming: true,
        id: l.id,
        rocketName: l.rocket?.configuration?.name || 'Desconocido'
      },
      { upsert: true }
    );
  }
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