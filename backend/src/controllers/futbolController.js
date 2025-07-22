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
      // 1. Guardamos/actualizamos el equipo base (sin importar competición)
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

      // 2. Guardamos/actualizamos la participación
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

      // Buscar el equipo base
      const team = await Team.findOne({ apiId: teamApiId });
      if (!team) {
        console.warn(`Equipo no encontrado para clasificación: ${teamApiId}`);
        continue;
      }

      // Verificamos que tenga participación en esta competición/temporada
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

export async function getEquiposLaLiga(req, res) {
  try {
    const { season } = req.query;
    if (!season) return res.status(400).json({ error: 'Temporada requerida' });

    const equipos = await TeamParticipation.find({
      competition: 'LaLiga',
      season
    }).populate('team');

    res.json(equipos);
  } catch (err) {
    console.error('Error al obtener equipos de LaLiga:', err.message);
    res.status(500).json({ error: 'Error interno al obtener equipos' });
  }
}


export async function getClasificacionLaLiga(req, res) {
  try {
    const { season } = req.query;
    if (!season) return res.status(400).json({ error: 'Temporada requerida' });

    const standings = await Standing.find({
      competition: 'LaLiga',
      season
    })
      .populate('team')
      .sort({ position: 1 });

    res.json(standings);
  } catch (err) {
    console.error('Error al obtener clasificación de LaLiga:', err.message);
    res.status(500).json({ error: 'Error interno al obtener clasificación' });
  }
}

