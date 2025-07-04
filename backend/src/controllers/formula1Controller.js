import SportsEvent from '../models/SportsEvent.js';

// Obtener próxima carrera principal (Race) y eventos de ese circuito
export const getNextF1CircuitEvents = async (req, res) => {
  try {
    const now = new Date();

    const nextRace = await SportsEvent.findOne({
      sport: 'formula_1',
      sessionType: 'Race',
      start: { $gte: now }
    }).sort({ start: 1 });

    if (!nextRace) {
      return res.status(404).json({ error: 'No upcoming Formula 1 race found' });
    }

    const { eventSlug } = nextRace;

    const events = await SportsEvent.find({
      sport: 'formula_1',
      eventSlug
    }).sort({ start: 1 });

    res.json({
      eventSlug,
      circuit: events[0]?.location || '',
      totalEvents: events.length,
      events
    });
  } catch (err) {
    console.error('❌ Error en getNextF1CircuitEvents:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Obtener eventos de un circuito por slug
export const getEventsByCircuitSlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const events = await SportsEvent.find({
      sport: 'formula_1',
      eventSlug: slug
    }).sort({ start: 1 });

    if (!events.length) {
      return res
        .status(404)
        .json({ message: 'No se encontraron eventos para este circuito' });
    }

    const first = events[0];
    const eventName = first.competition.replace(/GP$/, '').trim() + ' GP';

    const circuit = first.location;

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

// Obtener próximos circuitos con eventos futuros
export const getUpcomingF1Circuits = async (req, res) => {
  try {
    const today = new Date();

    const rawEvents = await SportsEvent.find({
      sport: 'formula_1',
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
    console.error('Error en getUpcomingF1Circuits:', err);
    res.status(500).json({ error: 'Error al obtener próximos circuitos' });
  }
};

// Obtener calendario completo de F1 agrupado por circuito
export const getFullF1Calendar = async (req, res) => {
  try {
    const allEvents = await SportsEvent.find({ sport: 'formula_1' });

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
          eventSlug: ev.eventSlug || slug,
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
    console.error('❌ Error en getFullF1Calendar:', err.message);
    res.status(500).json({ error: 'Error al obtener el calendario completo' });
  }
};
