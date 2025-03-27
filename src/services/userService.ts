// src/services/userService.ts
import api from '../lib/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'active' | 'inactive';
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'teacher' | 'admin';
    description?: string;
  }): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  updateUser: async (id: number, userData: {
    name?: string;
    description?: string;
    password?: string;
  }): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
  // Dans userService.ts, ajoutez cette nouvelle méthode
changePassword: async (userId: number, data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.post(`/users/${userId}/change-password`, data);
  },

  // Dans src/services/userService.ts, ajoute cette méthode:

getMyProfile: async (): Promise<User> => {
  // On récupère l'utilisateur depuis le localStorage ou le jeton
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }
  
  // Décodage basique du JWT pour obtenir l'ID
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    // Maintenant on peut utiliser l'ID obtenu du token
    const response = await api.get(`/users/${payload.userId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du décodage du token ou de la récupération du profil', error);
    throw error;
  }
}
};

export default userService;