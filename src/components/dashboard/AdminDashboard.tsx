// src/components/dashboard/AdminDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { useNotification } from '../../contexts/NotificationContext';
import Link from 'next/link';
import userService from '../../services/userService';
import evaluationService from '../../services/evaluationService';
import scaleService from '../../services/scaleService';
import { 
  UserGroupIcon, 
  UserIcon, 
  AcademicCapIcon, 
  DocumentTextIcon,
  PlusIcon,
  Squares2X2Icon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    teachers: 0,
    students: 0,
    admins: 0,
    totalEvaluations: 0,
    draftEvaluations: 0,
    publishedEvaluations: 0,
    totalScales: 0
  });
  
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentEvaluations, setRecentEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les données des utilisateurs
      const usersData = await userService.getUsers();
      
      // Calculer les statistiques des utilisateurs
      const totalUsers = usersData.length;
      const activeUsers = usersData.filter(u => u.status === 'active').length;
      const teachers = usersData.filter(u => u.role === 'teacher').length;
      const students = usersData.filter(u => u.role === 'student').length;
      const admins = usersData.filter(u => u.role === 'admin').length;
      
      // Récupérer les utilisateurs récents
      const recentUsers = [...usersData]
        .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
        .slice(0, 5);
      
      setRecentUsers(recentUsers);
      
      // Récupérer les données des évaluations
      const evalsData = await evaluationService.getEvaluations();
      
      // Calculer les statistiques des évaluations
      const totalEvaluations = evalsData.length;
      const draftEvaluations = evalsData.filter(e => e.status === 'draft').length;
      const publishedEvaluations = evalsData.filter(e => e.status === 'published').length;
      
      // Récupérer les évaluations récentes
      const recentEvals = [...evalsData]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      setRecentEvaluations(recentEvals);
      
      // Récupérer les données des barèmes
      const scalesData = await scaleService.getScales();
      const totalScales = scalesData.length;
      
      // Mettre à jour les statistiques
      setStats({
        totalUsers,
        activeUsers,
        teachers,
        students,
        admins,
        totalEvaluations,
        draftEvaluations,
        publishedEvaluations,
        totalScales
      });
      
    } catch (error) {
      console.error("Erreur lors du chargement des données du dashboard:", error);
      showNotification('error', 'Erreur de chargement', 'Impossible de charger les données du tableau de bord');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return <LoadingSpinner size="lg" text="Chargement du tableau de bord..." />;
  }

  return (
    <div className="space-y-8">
      {/* En-tête avec titre et bouton de rafraîchissement */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tableau de bord administrateur</h2>
          <p className="text-gray-600">Vue d'ensemble du système</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
          title="Rafraîchir les données"
        >
          <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Utilisateurs</p>
              <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <div className="flex justify-between items-center">
              <span>Actifs</span>
              <span>{stats.activeUsers}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span>Professeurs</span>
              <span>{stats.teachers}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span>Étudiants</span>
              <span>{stats.students}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Évaluations</p>
              <p className="text-3xl font-bold mt-1">{stats.totalEvaluations}</p>
            </div>
            <div className="bg-green-100 p-2 rounded">
              <DocumentTextIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <div className="flex justify-between items-center">
              <span>Brouillons</span>
              <span>{stats.draftEvaluations}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span>Publiées</span>
              <span>{stats.publishedEvaluations}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span>Taux de publication</span>
              <span>
                {stats.totalEvaluations > 0 
                  ? Math.round((stats.publishedEvaluations / stats.totalEvaluations) * 100) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Barèmes</p>
              <p className="text-3xl font-bold mt-1">{stats.totalScales}</p>
            </div>
            <div className="bg-purple-100 p-2 rounded">
              <Squares2X2Icon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/scales"
              className="text-xs text-[#138784] hover:underline"
            >
              Voir tous les barèmes →
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Ratio</p>
              <p className="text-3xl font-bold mt-1">
                {stats.teachers > 0 
                  ? (stats.students / stats.teachers).toFixed(1) 
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-yellow-100 p-2 rounded">
              <ChartBarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <p>Étudiants par professeur</p>
          </div>
        </div>
      </div>
      
      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/users/create"
            className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center hover:bg-blue-100 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <UserPlusIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">Nouvel utilisateur</div>
              <div className="text-sm text-gray-500">Ajouter un étudiant ou professeur</div>
            </div>
          </Link>
          
          <Link
            href="/scales/create"
            className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex items-center hover:bg-purple-100 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded-full mr-3">
              <PlusIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium">Nouveau barème</div>
              <div className="text-sm text-gray-500">Créer un barème d'évaluation</div>
            </div>
          </Link>
          
          <Link
            href="/users"
            className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center hover:bg-green-100 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-full mr-3">
              <UserGroupIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium">Gérer les utilisateurs</div>
              <div className="text-sm text-gray-500">Voir tous les utilisateurs</div>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Section des utilisateurs récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold">Utilisateurs récents</h3>
            <Link href="/users" className="text-[#138784] hover:underline text-sm">
              Voir tous
            </Link>
          </div>
          
          {recentUsers.length === 0 ? (
            <div className="p-5 text-center text-gray-500">
              <p>Aucun utilisateur trouvé.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentUsers.map((user, index) => (
                <div key={user.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium
                        ${user.role === 'admin' ? 'bg-red-500' : 
                          user.role === 'teacher' ? 'bg-blue-500' : 'bg-green-500'}`}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                          user.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role === 'admin' ? 'Admin' : 
                          user.role === 'teacher' ? 'Professeur' : 'Étudiant'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Section des évaluations récentes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold">Évaluations récentes</h3>
            <Link href="/evaluations" className="text-[#138784] hover:underline text-sm">
              Voir toutes
            </Link>
          </div>
          
          {recentEvaluations.length === 0 ? (
            <div className="p-5 text-center text-gray-500">
              <p>Aucune évaluation trouvée.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentEvaluations.map((evaluation) => (
                <div key={evaluation.id} className="p-4 hover:bg-gray-50">
                  <Link href={`/evaluations/${evaluation.id}`} className="block">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{evaluation.title}</div>
                        <div className="text-sm text-gray-500">
                          Étudiant: {evaluation.student?.name} • 
                          Prof: {evaluation.teacher?.name}
                        </div>
                      </div>
                      
                      <div>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${evaluation.status === 'published' ? 'bg-green-100 text-green-800' : 
                            evaluation.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {evaluation.status === 'published' ? 'Publiée' : 
                          evaluation.status === 'draft' ? 'Brouillon' : 'Archivée'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Information système */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Informations système</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium">Version</div>
            <div className="text-gray-500">89 Progress v1.0.0</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium">Environnement</div>
            <div className="text-gray-500">Production</div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium">Date</div>
            <div className="text-gray-500">{new Date().toLocaleDateString('fr-FR')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant d'icône UserPlus si non importé
function UserPlusIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}