import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$|\/api$/i, '');

export const api = axios.create({
  baseURL: `${normalizedBaseUrl}/api`,
});

// Injecte le token JWT stocké après login sur chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
