'use client';

import { useState } from 'react';
import { useAuth } from '../../../lib/auth';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

 // Dans page.tsx (Login)
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  
  try {
    console.log("Tentative de connexion avec:", email);
    await login(email, password);
  } catch (err: any) {
    console.error("Erreur complète de connexion:", err);
    
    // Message d'erreur plus informatif
    if (err?.response?.status === 429) {
      setError("Trop de tentatives de connexion. Veuillez réessayer plus tard.");
    } else {
      setError(err?.response?.data?.message || "Échec de la connexion. Vérifiez vos identifiants.");
    }
  }
};
  return (
    <div className="flex h-screen">
      {/* Section gauche - Couleur de l'école 89 avec illustration */}
      <div className="hidden md:flex md:w-5/12 bg-[#138784] flex-col p-10 relative text-white">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">89 Progress</h1>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Découvrez la plateforme d'évaluation pour l'École 89.
          </h2>
        </div>
        
        {/* Illustration au centre */}
        <div className="flex-grow flex items-center justify-center">
          <div className="relative w-80 h-80">
            <Image 
              src="/images/geek.svg" 
              alt="Illustration" 
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
        
        {/* Crédits en bas */}
        <div className="text-sm">
          École 89 - Tous droits réservés
        </div>
      </div>

      {/* Section droite - Formulaire de connexion */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-8 bg-[#f0f2f5]">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[#138784]">Se connecter à 89 Progress</h2>
          </div>
          
          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          
          {/* Formulaire */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Nom d'utilisateur ou adresse email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-[#138784] focus:border-[#138784]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <a href="#" className="text-sm text-[#138784] hover:text-[#0a6c6a]">
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-[#138784] focus:border-[#138784]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#138784] hover:bg-[#0c6460] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#138784]"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Seul l'équipe pédagogique peut créer des comptes.
          </div>
        </div>
      </div>
    </div>
  );
}