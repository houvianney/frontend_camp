import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$|\/api$/i, '');

export const api = axios.create({
  baseURL: `${normalizedBaseUrl}/api`,
});

// Injecte le token JWT stocké après login sur chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('[API] ->', config.method?.toUpperCase(), config.url, config.data ?? '');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('[API] <-', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('[API] <- ERROR', error?.config?.url, error?.response?.status, error?.response?.data);
    return Promise.reject(error);
  },
);
