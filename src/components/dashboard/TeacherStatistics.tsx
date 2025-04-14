// src/components/dashboard/TeacherStatistics.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import evaluationService, { Evaluation } from '../../services/evaluationService';
import userService, { User } from '../../services/userService';
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../ui/LoadingSpinner';

type EvaluationStats = {
  totalEvaluations: number;
  draftCount: number;
  publishedCount: number;
  archivedCount: number;
  totalStudents: number;
  averageScore: number;
  needsGradingCount: number;
  topPerformingStudents: { id: number; name: string; score: number }[];
  skillsDistribution: { skill: string; count: number }[];
};

export default function TeacherStatistics() {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [stats, setStats] = useState<EvaluationStats>({
    totalEvaluations: 0,
    draftCount: 0,
    publishedCount: 0,
    archivedCount: 0,
    totalStudents: 0,
    averageScore: 0,
    needsGradingCount: 0,
    topPerformingStudents: [],
    skillsDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer toutes les évaluations de l'enseignant
        const evalsData = await evaluationService.getEvaluations();
        setEvaluations(evalsData);
        
        // Récupérer tous les utilisateurs pour avoir les noms des étudiants
        const usersData = await userService.getUsers();
        const studentUsers = usersData.filter(u => u.role === 'student');
        setStudents(studentUsers);
        
        // Calculer les statistiques
        calculateStats(evalsData, studentUsers);
      } catch (err) {
        console.error('Erreur lors du chargement des données', err);
        setError('Impossible de charger les statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateStats = (evals: Evaluation[], studentUsers: User[]) => {
    // Filtrer pour n'obtenir que les évaluations de l'enseignant connecté
    const teacherEvals = evals.filter(ev => ev.teacherId === user?.userId);
    
    // Compter par statut
    const draftCount = teacherEvals.filter(ev => ev.status === 'draft').length;
    const publishedCount = teacherEvals.filter(ev => ev.status === 'published').length;
    const archivedCount = teacherEvals.filter(ev => ev.status === 'archived').length;
    
    // Calculer le nombre d'évaluations qui nécessitent une notation
    const needsGradingCount = teacherEvals.filter(ev => {
      if (ev.status !== 'draft') return false;
      
      const criteriaCount = ev.scale?.criteria?.length || 0;
      const gradesCount = ev.grades?.length || 0;
      
      return criteriaCount > gradesCount;
    }).length;
    
    // Obtenir les étudiants uniques concernés par ces évaluations
    const uniqueStudentIds = new Set(teacherEvals.map(ev => ev.studentId));
    const totalStudents = uniqueStudentIds.size;
    
    // Calculer la moyenne des notes sur toutes les évaluations
    let totalScore = 0;
    let totalMaxScore = 0;
    
    teacherEvals.forEach(ev => {
      if (ev.grades && ev.grades.length > 0) {
        const evalScore = ev.grades.reduce((sum, grade) => sum + grade.value, 0);
        totalScore += evalScore;
        
        // Ajouter au score maximum possible
        if (ev.scale?.criteria) {
          const maxPossible = ev.scale.criteria.reduce((sum, c) => sum + c.maxPoints, 0);
          totalMaxScore += maxPossible;
        }
      }
    });
    
    // Calculer le pourcentage moyen
    const averageScore = totalMaxScore > 0 
      ? Math.round((totalScore / totalMaxScore) * 100) 
      : 0;
    
    // Calculer les scores par étudiant pour trouver les meilleurs
    const studentScores = new Map<number, { total: number; max: number; name: string }>();
    
    teacherEvals.forEach(ev => {
      if (ev.grades && ev.grades.length > 0 && ev.scale?.criteria) {
        const studentId = ev.studentId;
        const student = studentUsers.find(s => s.id === studentId);
        const studentName = student ? student.name : `Étudiant #${studentId}`;
        
        if (!studentScores.has(studentId)) {
          studentScores.set(studentId, { total: 0, max: 0, name: studentName });
        }
        
        const scoreData = studentScores.get(studentId)!;
        
        // Ajouter les scores de cette évaluation
        const evalScore = ev.grades.reduce((sum, grade) => sum + grade.value, 0);
        const maxPossible = ev.scale.criteria.reduce((sum, c) => sum + c.maxPoints, 0);
        
        scoreData.total += evalScore;
        scoreData.max += maxPossible;
      }
    });
    
    // Convertir en tableau et trier
    const topStudents = Array.from(studentScores.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        score: data.max > 0 ? Math.round((data.total / data.max) * 100) : 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5
    
    // Compter les compétences évaluées
    const skillsCount = new Map<string, number>();
    
    teacherEvals.forEach(ev => {
      if (ev.scale?.criteria) {
        ev.scale.criteria.forEach(criteria => {
          const skill = criteria.associatedSkill;
          skillsCount.set(skill, (skillsCount.get(skill) || 0) + 1);
        });
      }
    });
    
    // Convertir en tableau et trier
    const skillsDistribution = Array.from(skillsCount.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count);
    
    setStats({
      totalEvaluations: teacherEvals.length,
      draftCount,
      publishedCount,
      archivedCount,
      totalStudents,
      averageScore,
      needsGradingCount,
      topPerformingStudents: topStudents,
      skillsDistribution
    });
  };

  if (loading) {
    return <LoadingSpinner size="md" text="Chargement des statistiques..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicateurs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total des évaluations</p>
              <p className="text-3xl font-bold mt-1">{stats.totalEvaluations}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <div className="flex justify-between items-center">
              <span>Brouillons</span>
              <span>{stats.draftCount}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span>Publiées</span>
              <span>{stats.publishedCount}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span>Archivées</span>
              <span>{stats.archivedCount}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Étudiants évalués</p>
              <p className="text-3xl font-bold mt-1">{stats.totalStudents}</p>
            </div>
            <div className="bg-green-100 p-2 rounded">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
              Note moyenne: {stats.averageScore}%
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Distributions des compétences</p>
              <p className="text-3xl font-bold mt-1">{stats.skillsDistribution.length}</p>
            </div>
            <div className="bg-purple-100 p-2 rounded">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 text-xs">
            {stats.skillsDistribution.slice(0, 3).map((skill, index) => (
              <div key={index} className="flex justify-between items-center mt-1">
                <span className="truncate max-w-[70%]">{skill.skill}</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{skill.count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">En attente de notation</p>
              <p className="text-3xl font-bold mt-1">{stats.needsGradingCount}</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          {stats.needsGradingCount > 0 ? (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 text-xs rounded-md flex items-center">
              <ExclamationCircleIcon className="h-4 w-4 mr-1" />
              <span>Des évaluations nécessitent votre attention</span>
            </div>
          ) : (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-xs rounded-md flex items-center">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              <span>Toutes les évaluations sont notées</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Meilleurs étudiants */}
      {stats.topPerformingStudents.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="font-semibold">Meilleurs étudiants</h3>
            <p className="text-sm text-gray-500 mt-1">
              Basé sur les notes moyennes de toutes les évaluations
            </p>
          </div>
          
          <div className="p-5">
            <div className="space-y-4">
              {stats.topPerformingStudents.map((student, index) => (
                <div key={student.id} className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="ml-3 flex-grow">
                    <div className="font-medium">{student.name}</div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full mt-1.5">
                      <div 
                        className={`h-full rounded-full ${getScoreColor(student.score)}`}
                        style={{ width: `${student.score}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <span className={`font-bold ${getScoreTextColor(student.score)}`}>
                      {student.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fonction auxiliaire pour obtenir la couleur de la barre de progression
function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

// Fonction auxiliaire pour obtenir la couleur du texte
function getScoreTextColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

// Composant CheckCircleIcon si non importé
function CheckCircleIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}