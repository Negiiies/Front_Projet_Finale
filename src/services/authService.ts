// src/services/authService.ts
import api, { getCsrfToken } from '../lib/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    role: 'student' | 'teacher' | 'admin';
  };
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Obtenir un token CSRF avant de tenter la connexion
    await getCsrfToken(); // Le token sera mis en cache par l'intercepteur
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      // Assurez-vous d'avoir un token CSRF valide pour le logout
      await getCsrfToken();
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Réinitialiser le cache du token CSRF (si vous utilisez un cache)
    }
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  // Ajout de la méthode getCurrentUser
  getCurrentUser: (): any => {
    // S'assurer que le code s'exécute uniquement côté client
    if (typeof window === 'undefined') return null;
    
    // Récupérer les informations utilisateur à partir du token
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      // Décodage basique du JWT
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT token', error);
      return null;
    }
  }
};
// Dans authService.ts
logout: async (): Promise<void> => {
  try {
    // Vérifie si un token existe
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      try {
        // Essaie de se déconnecter via l'API
        await getCsrfToken();
        await api.post('/auth/logout');
      } catch (apiError) {
        // Si l'API échoue, continue quand même
        console.warn("Erreur API lors de la déconnexion:", apiError);
      }
    }
  } finally {
    // Dans tous les cas, nettoie le localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export default authService;