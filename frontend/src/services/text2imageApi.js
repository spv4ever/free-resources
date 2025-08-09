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
  withCredentials: true, // ⬅️ permite enviar cookies de sesión si las hay
  headers: { 'Content-Type': 'application/json' },
  // timeout: 20000, // opcional
});

// Bearer si hay JWT en localStorage (soporte híbrido)
API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Centraliza el 401 (sesión caducada / no logado)
API.interceptors.response.use(
  r => r,
  err => {
    if (err?.response?.status === 401) {
      // limpia rastro local y deja que el UI muestre el aviso de login
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

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
