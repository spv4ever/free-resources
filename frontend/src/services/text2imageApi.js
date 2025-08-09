// src/services/text2imageApi.js
import axios from 'axios';

// 1) Build-time (CRA): process.env.REACT_APP_API_URL
// 2) Runtime opcional: window.__APP_API_URL__ (inyectado en index.html)
// 3) Fallback local
const BASE_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.__APP_API_URL__) ||
  'http://localhost:5000';

const API = axios.create({ baseURL: BASE_URL });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const startText2Image = async (payload) => {
  const { data } = await API.post('/api/generacion/text2img', payload);
  return data;
};

export const getImageStatus = async (imageId) => {
  if (!imageId) throw new Error('imageId requerido');
  const { data } = await API.get(`/api/generacion/text2img/${imageId}`);
  return data;
};

export default API;
