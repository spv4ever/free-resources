import Team from '../models/Team.js';
import TeamParticipation from '../models/TeamParticipation.js';
import Standing from '../models/Standing.js';
import {
  getTeamsByCompetition,
  getStandingsByCompetition
} from '../services/footballDataService.js';

function mapCompetitionCode(code) {
  if (code === 'PD') return 'LaLiga';
  if (code === 'CL') return 'Champions';
  return code;
}

export async function syncTeams(competitionCode, season) {
  try {
    const teams = await getTeamsByCompetition(competitionCode, season);
    const competition = mapCompetitionCode(competitionCode);

    for (const t of teams) {
      const team = await Team.findOneAndUpdate(
        { apiId: t.id },
        {
          name: t.name,
          shortName: t.shortName,
          tla: t.tla,
          logo: t.crest,
          area: t.area?.name
        },
        { upsert: true, new: true }
      );

      await TeamParticipation.findOneAndUpdate(
        { team: team._id, competition, season },
        { team: team._id, competition, season },
        { upsert: true, new: true }
      );
    }

    return teams.length;
  } catch (err) {
    console.error(`Error al sincronizar equipos de ${competitionCode}:`, err.message);
    throw err;
  }
}

export async function syncStandings(competitionCode, season) {
  try {
    const standingsData = await getStandingsByCompetition(competitionCode, season);
    const competition = mapCompetitionCode(competitionCode);

    const generalTable = standingsData.find(s => s.type === 'TOTAL');
    if (!generalTable) throw new Error('No se encontró tabla general');

    for (const entry of generalTable.table) {
      const teamApiId = entry.team.id;

      const team = await Team.findOne({ apiId: teamApiId });
      if (!team) {
        console.warn(`Equipo no encontrado para clasificación: ${teamApiId}`);
        continue;
      }

      const participation = await TeamParticipation.findOne({
        team: team._id,
        competition,
        season
      });

      if (!participation) {
        console.warn(`Participación no encontrada: ${team.name} en ${competition} ${season}`);
        continue;
      }

      await Standing.findOneAndUpdate(
        { team: team._id, competition, season },
        {
          team: team._id,
          competition,
          season,
          position: entry.position,
          played: entry.playedGames,
          won: entry.won,
          draw: entry.draw,
          lost: entry.lost,
          goalsFor: entry.goalsFor,
          goalsAgainst: entry.goalsAgainst,
          goalDifference: entry.goalDifference,
          points: entry.points
        },
        { upsert: true, new: true }
      );
    }

    return generalTable.table.length;
  } catch (err) {
    console.error(`Error al sincronizar standings de ${competitionCode}:`, err.message);
    throw err;
  }
}

/* ──────────────────────────────────────────────
   LECTURA GENÉRICA (BD) REUTILIZABLE
   competition puede venir como:
   - 'PD' | 'CL'  → se mapea a 'LaLiga' | 'Champions'
   - 'LaLiga' | 'Champions' → se usa tal cual
────────────────────────────────────────────── */

async function getCompetitionNameFromQuery(req) {
  const { competition } = req.query || {};
  if (!competition) return null;

  // Acepta códigos o nombres
  if (competition === 'PD' || competition === 'CL') {
    return mapCompetitionCode(competition);
  }
  if (competition === 'LaLiga' || competition === 'Champions') {
    return competition;
  }
  return null;
}

export async function getEquiposByCompetition(req, res, forcedCompetitionName) {
  try {
    const { season } = req.query;
    if (!season) return res.status(400).json({ error: 'Temporada requerida' });

    const competitionName =
      forcedCompetitionName || (await getCompetitionNameFromQuery(req));

    if (!competitionName)
      return res.status(400).json({ error: 'Parámetro "competition" inválido (use PD|CL|LaLiga|Champions)' });

    const equipos = await TeamParticipation.find({
      competition: competitionName,
      season
    }).populate('team');

    // Devolvemos igual que LaLiga (participations con team populado)
    return res.json(equipos);
  } catch (err) {
    console.error('Error al obtener equipos:', err.message);
    return res.status(500).json({ error: 'Error interno al obtener equipos' });
  }
}

export async function getClasificacionByCompetition(req, res, forcedCompetitionName) {
  try {
    const { season } = req.query;
    if (!season) return res.status(400).json({ error: 'Temporada requerida' });

    const competitionName =
      forcedCompetitionName || (await getCompetitionNameFromQuery(req));

    if (!competitionName)
      return res.status(400).json({ error: 'Parámetro "competition" inválido (use PD|CL|LaLiga|Champions)' });

    const standings = await Standing.find({
      competition: competitionName,
      season
    })
      .populate('team')
      .sort({ position: 1 });

    return res.json(standings);
  } catch (err) {
    console.error('Error al obtener clasificación:', err.message);
    return res.status(500).json({ error: 'Error interno al obtener clasificación' });
  }
}



/* ──────────────────────────────────────────────
   WRAPPERS ESPECÍFICOS (mantienen tus rutas actuales)
────────────────────────────────────────────── */

// LaLiga (rutas existentes)
export async function getEquiposLaLiga(req, res) {
  return getEquiposByCompetition(req, res, 'LaLiga');
}
export async function getClasificacionLaLiga(req, res) {
  return getClasificacionByCompetition(req, res, 'LaLiga');
}

// Champions (rutas nuevas, mismo formato de respuesta)
export async function getEquiposChampions(req, res) {
  return getEquiposByCompetition(req, res, 'Champions');
}
export async function getClasificacionChampions(req, res) {
  return getClasificacionByCompetition(req, res, 'Champions');
}
