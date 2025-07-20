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
