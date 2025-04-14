// src/components/dashboard/TeacherDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { useNotification } from '../../contexts/NotificationContext';
import evaluationService, { Evaluation } from '../../services/evaluationService';
import userService from '../../services/userService';
import scaleService from '../../services/scaleService';
import Link from 'next/link';
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  ClockIcon, 
  ChatBubbleLeftIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  CheckIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../ui/LoadingSpinner';

interface StudentPerformance {
  skill: string;
  percentage: number;
}

interface FrequentScale {
  id: number;
  title: string;
  criteriaCount: number;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  // États pour les statistiques
  const [stats, setStats] = useState({
    totalEvaluations: 0,
    studentsEvaluated: 0,
    pendingGrades: 0,
    unreadMessages: 0
  });
  
  // États pour les données
  const [requiredActions, setRequiredActions] = useState<any[]>([]);
  const [recentEvaluations, setRecentEvaluations] = useState<Evaluation[]>([]);
  const [studentPerformances, setStudentPerformances] = useState<StudentPerformance[]>([]);
  const [frequentScales, setFrequentScales] = useState<FrequentScale[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les évaluations
        const evaluations = await evaluationService.getEvaluations();
        
        // Filtrer pour n'obtenir que les évaluations du professeur
        const teacherEvals = evaluations.filter(ev => ev.teacherId === user?.userId);
        
        // Récupérer les 5 évaluations les plus récentes
        const recent = [...teacherEvals]
          .sort((a, b) => {
            const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 5);
          
        setRecentEvaluations(recent);
        
        // Calculer les statistiques de base
        const totalEvals = teacherEvals.length;
        
        // Trouver les évaluations nécessitant une notation
        const needsGrading = teacherEvals.filter(ev => {
          if (ev.status !== 'draft') return false;
          
          const criteriaCount = ev.scale?.criteria?.length || 0;
          const gradesCount = ev.grades?.length || 0;
          
          return criteriaCount > gradesCount;
        });
        
        // Extraire les étudiants uniques évalués
        const uniqueStudentIds = new Set(teacherEvals.map(ev => ev.studentId));
        
        // Simuler les messages non lus (à remplacer par un vrai appel API)
        const unreadMessages = Math.floor(Math.random() * 5); // Simulation: 0-4 messages
        
        // Mettre à jour les statistiques
        setStats({
          totalEvaluations: totalEvals,
          studentsEvaluated: uniqueStudentIds.size,
          pendingGrades: needsGrading.length,
          unreadMessages: unreadMessages
        });
        
        // Créer les actions requises
        const actions = [
          ...needsGrading.map(ev => ({
            id: ev.id,
            type: 'evaluation',
            title: ev.title,
            studentName: ev.student?.name || 'Étudiant',
            action: 'À noter',
            link: `/evaluations/${ev.id}/grade`
          }))
        ];
        
                  // Ajouter des messages simulés si nécessaire
        if (unreadMessages > 0) {
          const students = ['Alice Johnson', 'Bob Wilson', 'Charlie Brown', 'Diana Prince'];
          for (let i = 0; i < unreadMessages; i++) {
            actions.push({
              id: 1000 + i, // Utiliser un nombre au lieu d'une chaîne
              type: 'message',
              title: `Message de ${students[Math.floor(Math.random() * students.length)]}`, // Ajout de la propriété title
              studentName: students[Math.floor(Math.random() * students.length)],
              action: 'À répondre',
              link: '/messages'
            });
          }
        }
        
        setRequiredActions(actions);
        
        // Calculer les performances des étudiants par compétence
        calculateStudentPerformances(teacherEvals);
        
        // Récupérer et calculer les barèmes fréquemment utilisés
        fetchFrequentScales();
        
      } catch (err) {
        console.error("Erreur lors du chargement des données du dashboard:", err);
        setError("Impossible de charger les données du tableau de bord");
        showNotification('error', 'Erreur de chargement', 'Impossible de charger les données du tableau de bord');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, showNotification]);
  
  // Fonction pour calculer les performances par compétence
  const calculateStudentPerformances = (evaluations: Evaluation[]) => {
    // Map pour stocker les données par compétence
    const skillsMap = new Map<string, { total: number; max: number; count: number }>();
    
    // Parcourir toutes les évaluations avec des notes
    evaluations.forEach(ev => {
      if (ev.grades && ev.grades.length > 0) {
        ev.grades.forEach(grade => {
          if (grade.criteria?.associatedSkill) {
            const skill = grade.criteria.associatedSkill;
            
            if (!skillsMap.has(skill)) {
              skillsMap.set(skill, { total: 0, max: 0, count: 0 });
            }
            
            const skillData = skillsMap.get(skill)!;
            skillData.total += grade.value;
            skillData.max += grade.criteria.maxPoints;
            skillData.count += 1;
          }
        });
      }
    });
    
    // Convertir la map en tableau pour l'affichage
    const performances = Array.from(skillsMap.entries()).map(([skill, data]) => {
      const percentage = Math.round((data.total / data.max) * 100);
      return { skill, percentage };
    }).sort((a, b) => b.percentage - a.percentage);
    
    setStudentPerformances(performances);
  };
  
  // Fonction pour récupérer les barèmes fréquemment utilisés
  const fetchFrequentScales = async () => {
    try {
      const scales = await scaleService.getScales();
      
      // On pourrait ajouter une logique pour déterminer les barèmes les plus utilisés
      // Pour l'instant, on prend juste les 3 premiers
      const frequent = scales.slice(0, 3).map(scale => ({
        id: scale.id,
        title: scale.title,
        criteriaCount: scale.criteria?.length || 0
      }));
      
      setFrequentScales(frequent);
    } catch (err) {
      console.error("Erreur lors du chargement des barèmes:", err);
    }
  };

  // Fonction pour obtenir la couleur de la barre de progression
  const getProgressBarColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Chargement de votre tableau de bord..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        {error}
        <button 
          onClick={() => window.location.reload()} 
          className="ml-4 underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message de bienvenue */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Bienvenue, {user?.name || 'Professeur'}</h1>
        <p className="text-gray-600">Voici un aperçu de vos évaluations et statistiques</p>
      </div>
      
      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Évaluations</p>
              <p className="text-3xl font-bold mt-1">{stats.totalEvaluations}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Étudiants</p>
              <p className="text-3xl font-bold mt-1">{stats.studentsEvaluated}</p>
            </div>
            <div className="bg-green-100 p-2 rounded">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">À noter</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingGrades}</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Messages</p>
              <p className="text-3xl font-bold mt-1">{stats.unreadMessages}</p>
            </div>
            <div className="bg-purple-100 p-2 rounded">
              <ChatBubbleLeftIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Actions requises */}
      {requiredActions.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-100">
            <div className="flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
              <h2 className="font-semibold text-red-700">Actions requises</h2>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {requiredActions.map((action, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50">
                <Link href={action.link} className="flex justify-between items-center">
                  <div className="flex items-center">
                    {action.type === 'evaluation' ? (
                      <DocumentTextIcon className="h-5 w-5 text-yellow-600 mr-3" />
                    ) : (
                      <ChatBubbleLeftIcon className="h-5 w-5 text-purple-600 mr-3" />
                    )}
                    <div>
                      {action.type === 'evaluation' ? (
                        <span className="font-medium">{action.title}</span>
                      ) : (
                        <span className="font-medium">Message de {action.studentName}</span>
                      )}
                      <div className="text-sm text-gray-500">
                        {action.type === 'evaluation' ? `Étudiant: ${action.studentName}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                    {action.action}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Évaluations récentes et Performances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évaluations récentes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold">Évaluations récentes</h2>
            <Link href="/evaluations" className="text-[#138784] hover:underline text-sm">
              Voir toutes
            </Link>
          </div>
          
          {recentEvaluations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>Vous n'avez pas encore d'évaluations.</p>
              <Link
                href="/evaluations/create"
                className="inline-block mt-3 px-4 py-2 bg-[#138784] text-white rounded-md hover:bg-[#0c6460]"
              >
                Créer ma première évaluation
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentEvaluations.map((evaluation) => (
                <div key={evaluation.id} className="px-6 py-4 hover:bg-gray-50">
                  <Link href={`/evaluations/${evaluation.id}`} className="block">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{evaluation.title}</div>
                        <div className="text-sm text-gray-500">
                          {evaluation.student?.name} • {new Date(evaluation.dateEval).toLocaleDateString('fr-FR')}
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
        
        {/* Performances des étudiants */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold">Performances des étudiants</h2>
            <div className="text-sm text-gray-500">
              <ChartBarIcon className="h-5 w-5 inline-block" />
            </div>
          </div>
          
          {studentPerformances.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>Pas assez de données pour afficher les performances.</p>
              <p className="text-sm mt-2">Les statistiques apparaîtront une fois que vous aurez noté des évaluations.</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {studentPerformances.map((performance, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{performance.skill}</span>
                    <span className="text-sm font-medium">{performance.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getProgressBarColor(performance.percentage)}`}
                      style={{ width: `${performance.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Barèmes fréquemment utilisés */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold">Barèmes fréquemment utilisés</h2>
          <Link href="/scales" className="text-[#138784] hover:underline text-sm">
            Voir tous
          </Link>
        </div>
        
        {frequentScales.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>Vous n'avez pas encore créé de barèmes.</p>
            <Link
              href="/scales/create"
              className="inline-block mt-3 px-4 py-2 bg-[#138784] text-white rounded-md hover:bg-[#0c6460]"
            >
              Créer mon premier barème
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {frequentScales.map((scale) => (
              <div key={scale.id} className="px-6 py-4 hover:bg-gray-50">
                <Link href={`/scales/${scale.id}`} className="flex justify-between items-center">
                  <div className="font-medium">{scale.title}</div>
                  <div className="text-sm text-gray-500">
                    {scale.criteriaCount} critère{scale.criteriaCount > 1 ? 's' : ''}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}