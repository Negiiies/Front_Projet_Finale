// src/app/(dashboard)/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth';
import userService, { User } from '../../../services/userService';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Formulaire
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const profileData = await userService.getMyProfile();
        setProfile(profileData);
        setName(profileData.name);
        setDescription(profileData.description || '');
      } catch (err) {
        console.error('Erreur lors du chargement du profil', err);
        setError('Impossible de charger les informations de profil.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Mise à jour des informations de base
      const updatedProfile = await userService.updateUser(user!.userId, {
        name,
        description
      });
      
      setProfile(updatedProfile);
      setSuccess('Profil mis à jour avec succès!');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil', err);
      setError('Impossible de mettre à jour le profil.');
    } finally {
      setUpdating(false);
    }
  };

  // Dans src/app/(dashboard)/profile/page.tsx, mettre à jour handleChangePassword:

const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    setUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Utiliser la méthode dédiée du service
      await userService.changePassword(user!.userId, {
        currentPassword,
        newPassword
      });
      
      setSuccess('Mot de passe mis à jour avec succès!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du mot de passe', err);
      // Afficher des messages d'erreur plus précis
      if (err.status === 401) {
        setError('Mot de passe actuel incorrect.');
      } else {
        setError(err.message || 'Impossible de mettre à jour le mot de passe.');
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#138784]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        Impossible de charger le profil.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Mon profil</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations de profil */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                value={profile.email}
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">L'email ne peut pas être modifié.</p>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#138784] focus:border-[#138784]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Rôle
              </label>
              <input
                type="text"
                id="role"
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                value={profile.role === 'student' ? 'Étudiant' : 
                       profile.role === 'teacher' ? 'Professeur' : 'Administrateur'}
                disabled
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description / Bio
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#138784] focus:border-[#138784]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={updating}
                className="bg-[#138784] text-white px-4 py-2 rounded-md hover:bg-[#0c6460] disabled:opacity-50"
              >
                {updating ? 'Mise à jour...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Changement de mot de passe */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Changer de mot de passe</h2>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe actuel
              </label>
              <input
                type="password"
                id="currentPassword"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#138784] focus:border-[#138784]"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="newPassword"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#138784] focus:border-[#138784]"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Au moins 8 caractères, une majuscule, un chiffre et un caractère spécial
              </p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#138784] focus:border-[#138784]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={updating}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? 'Mise à jour...' : 'Changer le mot de passe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}