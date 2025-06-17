// src/controllers/motogpController.js
import SportsEvent from '../models/SportsEvent.js';

export const getNextMotoGPCircuitEvents = async (req, res) => {
  try {
    const now = new Date();

    // 1. Buscar la próxima carrera principal (RAC)
    const nextRace = await SportsEvent.findOne({
      sport: 'motogp',
      sessionType: 'RAC',
      start: { $gte: now }
    }).sort({ start: 1 });

    if (!nextRace) {
      return res.status(404).json({ error: 'No upcoming MotoGP race found' });
    }

    const { eventSlug } = nextRace;

    // 2. Buscar todos los eventos de ese circuito (mismo slug)
    const events = await SportsEvent.find({
      sport: 'motogp',
      eventSlug
    }).sort({ start: 1 });

    res.json({
      eventSlug,
      circuit: events[0]?.location || '',
      totalEvents: events.length,
      events
    });
  } catch (err) {
    console.error('❌ Error en getNextMotoGPCircuitEvents:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEventsByCircuitSlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Buscamos todos los eventos de ese slug, ordenados por fecha
    const events = await SportsEvent.find({
      sport: 'motogp',
      eventSlug: slug
    }).sort({ start: 1 });

    if (!events.length) {
      return res
        .status(404)
        .json({ message: 'No se encontraron eventos para este circuito' });
    }

    // Tomamos los datos comunes del primer evento
    const first = events[0];
    const eventName = first.competition.replace(/GP$/, '').trim() + ' GP'; 
    // o si tienes un campo específico:
    // const eventName = first.eventName;

    const circuit = first.location; // o first.circuit si lo guardas así

    // Devolvemos un objeto con todo
    res.json({
      eventName,
      circuit,
      events
    });
  } catch (err) {
    console.error('❌ Error al obtener eventos por slug:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getUpcomingMotoGPCircuits = async (req, res) => {
  try {
    const today = new Date();

    const rawEvents = await SportsEvent.find({
      sport: 'motogp',
      start: { $gte: today },
      eventSlug: { $ne: null }
    }).sort({ start: 1 });

    const grouped = {};

    for (const ev of rawEvents) {
      const slug = ev.eventSlug;

      if (!grouped[slug]) {
        grouped[slug] = {
          slug,
          name: ev.title.split('–')[1]?.trim() || slug,
          start: ev.start,
          end: ev.end,
          categories: new Set([ev.category])
        };
      } else {
        if (ev.start < grouped[slug].start) grouped[slug].start = ev.start;
        if (ev.end > grouped[slug].end) grouped[slug].end = ev.end;
        grouped[slug].categories.add(ev.category);
      }
    }

    const circuits = Object.values(grouped).map(c => ({
      ...c,
      categories: Array.from(c.categories)
    }));

    res.json(circuits);
  } catch (err) {
    console.error('Error en getUpcomingMotoGPCircuits:', err);
    res.status(500).json({ error: 'Error al obtener próximos circuitos' });
  }
};

export const getFullMotoGPCalendar = async (req, res) => {
  try {
    const allEvents = await SportsEvent.find({ sport: 'motogp' });

    const grouped = {};

    const slugify = str =>
      str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // elimina acentos
        .replace(/[^\w\s-]/g, '') // elimina símbolos raros
        .trim()
        .replace(/\s+/g, '-');

    for (const ev of allEvents) {
      const locationKey = ev.location?.replace(/\\,/g, ',') || 'unknown';
      const slug = slugify(locationKey);

      if (!grouped[slug]) {
        grouped[slug] = {
          slug,
          name: locationKey,
          eventSlug: ev.eventSlug || slug,  // ✅ Añadir aquí
          start: ev.start,
          end: ev.end,
          categories: new Set([ev.category]),
          hasPassed: new Date(ev.end) < new Date(),
        };
      } else {
        if (ev.start < grouped[slug].start) grouped[slug].start = ev.start;
        if (ev.end > grouped[slug].end) grouped[slug].end = ev.end;
        grouped[slug].categories.add(ev.category);
      }
    }

    const result = Object.values(grouped).map(c => ({
      ...c,
      categories: Array.from(c.categories)
    }));

    res.json(result);
  } catch (err) {
    console.error('❌ Error en getFullMotoGPCalendar:', err.message);
    res.status(500).json({ error: 'Error al obtener el calendario completo' });
  }
};