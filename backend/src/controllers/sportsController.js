// src/controllers/sportsController.js

import SportsEvent from '../models/SportsEvent.js';

export const getTodayEvents = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const events = await SportsEvent.find({
      start: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ start: 1 });

    res.json({ events });
  } catch (err) {
    console.error('❌ Error al obtener eventos del día:', err.message);
    res.status(500).json({ error: 'Error interno al obtener los eventos del día' });
  }
};
