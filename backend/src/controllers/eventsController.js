import { getMatchesByCompetition, getTopScorers  } from '../services/footballDataService.js';
import SportsEvent from '../models/SportsEvent.js';
import PlayerStat from '../models/PlayerStat.js';
import slugify from '../utils/slugify.js';

function getChampionsCategory(stage, group) {
  const stageMap = {
    GROUP_STAGE: 'Fase de grupos',
    LAST_16: 'Octavos de final',
    QUARTER_FINALS: 'Cuartos de final',
    SEMI_FINALS: 'Semifinales',
    FINAL: 'Final'
  };

  if (stage === 'GROUP_STAGE' && group) {
    return `Grupo ${group.replace('GROUP_', '')}`;
  }

  return stageMap[stage] || 'Desconocido';
}

export async function importarPartidos(competitionCode, competitionName, season) {
  const partidos = await getMatchesByCompetition(competitionCode, season);
  let nuevos = 0;
  let actualizados = 0;

  for (const match of partidos) {
    const uid = match.id.toString();
    const existente = await SportsEvent.findOne({ uid });

    const start = new Date(match.utcDate);
    const slug = slugify(`${match.homeTeam.name}-${match.awayTeam.name}-${match.matchday}-${season}`);

    const competition = competitionName;
    const sport = 'futbol';
    const sessionType = 'Partido';

    const category = (competitionCode === 'CL')
      ? getChampionsCategory(match.stage, match.group)
      : 'Primera División';

    const score = {
      fullTime: match.score?.fullTime || { home: null, away: null },
      halfTime: match.score?.halfTime || { home: null, away: null }
    };

    const metadata = {
        matchday: match.matchday,
        status: match.status,
        stage: match.stage,
        season: season, // ← Aquí lo añadimos
        group: match.group || null,
        referees: match.referees?.map(r => r.name) || [],
        winner: match.score?.winner || null
        };

    const eventData = {
      uid,
      title: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      description: `Partido de la temporada ${season} de ${competition}`,
      location: '', // Puedes enriquecerlo después
      start,
      end: null, // Opcional: puedes sumar 2h aprox.
      sport,
      competition,
      category,
      sessionType,
      eventSlug: slug,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      status: match.status,
      score,
      metadata
    };

    if (!existente) {
      await SportsEvent.create(eventData);
      nuevos++;
    } else {
      const haCambios =
        existente.start.getTime() !== start.getTime() ||
        existente.status !== match.status ||
        JSON.stringify(existente.score) !== JSON.stringify(score) ||
        !existente.metadata?.season || existente.metadata.season !== season;

      if (haCambios) {
        await SportsEvent.updateOne({ uid }, eventData);
        actualizados++;
      }
    }
  }

  return {
    total: partidos.length,
    nuevos,
    actualizados
  };
}

export async function getProximosPartidos(req, res) {
  try {
    const hoy = new Date();

    const proximos = await SportsEvent.find({
      sport: 'futbol',
      status: 'TIMED',
      start: { $gte: hoy }
    })
      .sort({ start: 1 })
      .limit(50); // subimos a 50 por si hay muchos partidos el mismo día
    // console.log('Proximos partidos:', proximos.map(p => ({
    // start: p.start,
    // status: p.status,
    // title: p.title
    // })));
    res.json(proximos);
  } catch (error) {
    console.error('Error al obtener próximos partidos:', error);
    res.status(500).json({ error: 'Error al obtener próximos partidos' });
  }
}


export async function getPartidosJornadaLaLiga(req, res) {
  try {
    const temporada = parseInt(req.query.season || 2025);
    const jornadaParam = req.params.jornada;

    if (jornadaParam) {
      // Modo manual
      const partidos = await SportsEvent.find({
        sport: 'futbol',
        competition: 'LaLiga',
        'metadata.season': temporada,
        'metadata.matchday': parseInt(jornadaParam)
      }).sort({ start: 1 });

      return res.json(partidos);
    }

    // Modo automático: buscar la jornada más próxima que esté en curso o por jugar
    const ahora = new Date();

    const proximosPartidos = await SportsEvent.find({
      sport: 'futbol',
      competition: 'LaLiga',
      'metadata.season': temporada,
      status: { $in: ['TIMED', 'IN_PLAY'] },
      start: { $gte: ahora }
    }).sort({ start: 1 });

    if (!proximosPartidos.length) {
      return res.json([]); // No hay jornadas próximas
    }

    const siguienteJornada = proximosPartidos[0]?.metadata?.matchday;

    const partidosDeEsaJornada = await SportsEvent.find({
      sport: 'futbol',
      competition: 'LaLiga',
      'metadata.season': temporada,
      'metadata.matchday': siguienteJornada
    }).sort({ start: 1 });

    return res.json(partidosDeEsaJornada);
  } catch (error) {
    console.error('Error al obtener jornada de LaLiga:', error);
    res.status(500).json({ error: 'Error al obtener jornada de LaLiga' });
  }
}


export async function importarGoleadores(req, res) {
  try {
    const { competitionCode, competitionName, season } = req.body;

    if (!competitionCode || !competitionName || !season) {
      return res.status(400).json({ error: 'competitionCode, competitionName y season son requeridos' });
    }

    const goleadores = await getTopScorers(competitionCode, season);
    let nuevos = 0, actualizados = 0;

    for (const item of goleadores) {
      const uid = `${competitionCode}-${season}-${item.player.id}`;
      const existente = await PlayerStat.findOne({ uid });

      const datos = {
        uid,
        playerId: item.player.id,
        playerName: item.player.name,
        teamName: item.team.name,
        goals: item.goals || 0,
        assists: item.assists || 0,
        played: item.playedMatches || 0,
        competition: competitionName,
        season: Number(season)
      };

      if (!existente) {
        await PlayerStat.create(datos);
        nuevos++;
      } else {
        await PlayerStat.updateOne({ uid }, datos);
        actualizados++;
      }
    }

    res.json({ status: 'ok', total: goleadores.length, nuevos, actualizados });
  } catch (error) {
    console.error('Error al importar goleadores:', error);
    res.status(500).json({ error: 'Error al importar goleadores' });
  }
}

export async function getGoleadores(req, res) {
  try {
    const competition = req.params.competition; // 'laliga' o 'champions'
    const season = parseInt(req.query.season) || 2025;

    const competitionMap = {
      laliga: 'LaLiga',
      champions: 'Champions League'
    };

    const competitionName = competitionMap[competition.toLowerCase()];
    if (!competitionName) {
      return res.status(400).json({ error: 'Competición no válida' });
    }

    const jugadores = await PlayerStat.find({
      competition: competitionName,
      season
    }).sort({ goals: -1 });

    res.json(jugadores);
  } catch (error) {
    console.error('Error al obtener goleadores:', error);
    res.status(500).json({ error: 'Error al obtener goleadores' });
  }
}

export async function getJornadasLaLigaDisponibles(req, res) {
  try {
    const temporada = parseInt(req.query.season) || 2025;

    const jornadas = await SportsEvent.distinct('metadata.matchday', {
      competition: 'LaLiga',
      sport: 'futbol',
      'metadata.matchday': { $ne: null },
      'metadata.season': temporada
    });

    res.json(jornadas.sort((a, b) => a - b));
  } catch (error) {
    console.error('Error al obtener jornadas:', error);
    res.status(500).json({ error: 'Error al obtener jornadas disponibles' });
  }
}