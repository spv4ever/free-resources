import axios from 'axios';
import { FOOTBALL_API_BASE_URL, FOOTBALL_API_KEY } from '../config/apiConfig.js';

const axiosInstance = axios.create({
  baseURL: FOOTBALL_API_BASE_URL,
  headers: { 'X-Auth-Token': FOOTBALL_API_KEY }
});

export async function getMatchesByCompetition(competitionCode, season) {
  const { data } = await axiosInstance.get(`/competitions/${competitionCode}/matches?season=${season}`);
  return data.matches;
}

export async function getTopScorers(competitionCode, season) {
  const { data } = await axiosInstance.get(`/competitions/${competitionCode}/scorers?season=${season}`);
  return data.scorers;
}

export async function getTeamsByCompetition(competitionCode, season) {
  try {
    const { data } = await axiosInstance.get(`/competitions/${competitionCode}/teams?season=${season}`);
    return data.teams;
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`Equipos no disponibles para ${competitionCode} ${season}`);
      return [];
    }
    throw error;
  }
}

export async function getStandingsByCompetition(competitionCode, season) {
  const { data } = await axiosInstance.get(`/competitions/${competitionCode}/standings?season=${season}`);
  return data.standings; // Es un array
}