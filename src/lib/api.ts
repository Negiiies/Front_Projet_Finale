// src/lib/api.ts
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Cache pour stocker le token CSRF
let csrfTokenCache: string | null = null;

// Fonction de création d'API
export const createApi = () => {
  // Créer l'instance API
  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Crucial pour les cookies CSRF
  });

  // Intercepteur pour ajouter les tokens aux requêtes
  api.interceptors.request.use(
    async (config) => {
      // Ajouter le token d'authentification si disponible
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      
      // Ajouter le token CSRF pour les méthodes non-GET
      if (config.method !== 'get') {
        try {
          const csrfToken = await getCsrfToken();
          config.headers['X-CSRF-Token'] = csrfToken;
        } catch (error) {
          console.error('Impossible d\'obtenir le token CSRF', error);
        }
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Intercepteur pour gérer les erreurs et le refresh token
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error?.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('No refresh token available');
          
          const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });
          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Redirection vers la page de connexion si le refresh token est invalide
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
};

// Fonction pour obtenir le token CSRF
export const getCsrfToken = async () => {
  try {
    if (csrfTokenCache) return csrfTokenCache;
    
    const response = await axios.get(`${BASE_URL}/csrf-token`, { withCredentials: true });
    csrfTokenCache = response.data.token;
    return csrfTokenCache;
  } catch (error) {
    console.error('Erreur lors de la récupération du token CSRF:', error);
    throw error;
  }
};

// Exporter l'API par défaut comme une instance unique
export default createApi();