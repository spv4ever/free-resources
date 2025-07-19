const TENOR_API_KEY = process.env.REACT_APP_TENOR_API_KEY;
const BASE_URL = 'https://tenor.googleapis.com/v2/';
// console.log("Clave Tenor:", TENOR_API_KEY); // para depurar

export async function searchGifs(query, limit = 20) {
  const url = `${BASE_URL}search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=${limit}&media_filter=gif`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

export async function getTrendingGifs(limit = 20) {
  const url = `${BASE_URL}featured?key=${TENOR_API_KEY}&limit=${limit}&media_filter=gif`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

export async function getCategories() {
  const url = `${BASE_URL}categories?key=${TENOR_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.tags || [];
}

export async function getAutocomplete(query) {
  const url = `${BASE_URL}autocomplete?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}