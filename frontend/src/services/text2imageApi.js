// src/services/text2imageApi.js
import axios from 'axios';

// 1) Build-time (CRA): process.env.REACT_APP_API_URL
// 2) Runtime opcional: window.__APP_API_URL__ (inyectado en index.html)
// 3) Fallback local
const BASE_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.__APP_API_URL__) ||
  'http://localhost:5000';

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Bearer si hay JWT en localStorage
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Centraliza 401
API.interceptors.response.use(
  r => r,
  err => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

export const startText2Image = async (payload) => {
  const { data } = await API.post('/api/generacion/text2img', payload);
  return data;
};

// ⬇️ ACEPTA PARAMS Y AÑADE ANTI-CACHÉ
export const getImageStatus = async (imageId, extraParams = {}) => {
  if (!imageId) throw new Error('imageId requerido');

  const { data } = await API.get(`/api/generacion/text2img/${imageId}`, {
    params: { ...extraParams, t: Date.now() },     // ← evita cacheo
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });

  // devuelve tal cual; el unwrapping ya lo haces en TextToImagePage
  return data;
};

export default API;
