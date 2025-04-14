// src/components/evaluations/EvaluationDetailView.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { Evaluation, Grade } from '../../services/evaluationService';
import { 
  DocumentTextIcon, 
  UserIcon, 
  AcademicCapIcon, 
  CalendarIcon,
  CheckBadgeIcon,
  ChartBarIcon,
  ClockIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface EvaluationDetailViewProps {
  evaluation: Evaluation;
}

export default function EvaluationDetailView({ evaluation }: EvaluationDetailViewProps) {
  const { user } = useAuth();
  const [totalScore, setTotalScore] = useState(0);
  const [maxPossibleScore, setMaxPossibleScore] = useState(0);
  const [scorePercentage, setScorePercentage] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [statusColor, setStatusColor] = useState('');
  
  // Déterminer si l'utilisateur est l'étudiant concerné par cette évaluation
  const isStudent = user?.role === 'student' && user?.userId === evaluation.studentId;
  // Déterminer si l'utilisateur est le professeur qui a créé cette évaluation
  const isTeacher = user?.role === 'teacher' && user?.userId === evaluation.teacherId;
  
  useEffect(() => {
    // Calculer le score total et le maximum possible
    if (evaluation.grades && evaluation.scale?.criteria) {
      const total = evaluation.grades.reduce((sum, grade) => sum + grade.value, 0);
      const max = evaluation.scale.criteria.reduce((sum, criteria) => sum + criteria.maxPoints, 0);
      
      setTotalScore(total);
      setMaxPossibleScore(max);
      const percentage = max > 0 ? Math.round((total / max) * 100) : 0;
      setScorePercentage(percentage);
      
      // Générer un feedback basé sur le score
      setFeedbackText(generateFeedback(total, max));
      
      // Déterminer la couleur du statut
      if (percentage >= 80) {
        setStatusColor('bg-green-100 text-green-800');
      } else if (percentage >= 60) {
        setStatusColor('bg-blue-100 text-blue-800');
      } else if (percentage >= 40) {
        setStatusColor('bg-yellow-100 text-yellow-800');
      } else {
        setStatusColor('bg-red-100 text-red-800');
      }
    }
  }, [evaluation]);

  // Générer un feedback textuel basé sur le score
  const generateFeedback = (score: number, maxScore: number): string => {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    
    if (percentage >= 90) {
      return "Excellent travail ! Vous avez parfaitement compris et maîtrisé tous les concepts.";
    } else if (percentage >= 80) {
      return "Très bon travail ! Vous avez démontré une solide compréhension des concepts.";
    } else if (percentage >= 70) {
      return "Bon travail ! Vous avez une bonne compréhension, avec quelques points à améliorer.";
    } else if (percentage >= 60) {
      return "Satisfaisant. Vous comprenez les concepts de base, mais certains aspects nécessitent plus d'attention.";
    } else if (percentage >= 50) {
      return "Passable. Vous avez une compréhension partielle, avec plusieurs concepts à revoir.";
    } else {
      return "Des améliorations sont nécessaires. Il serait bénéfique de revoir les concepts fondamentaux.";
    }
  };
  
  // Fonction pour obtenir la classe CSS en fonction du pourcentage
  const getScoreColorClass = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Fonction pour obtenir la couleur de la barre de progression
  const getProgressBarColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="space-y-6">
      {/* Informations de l'évaluation */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{evaluation.title}</h2>
            <div className="mt-2 flex items-center text-gray-500">
              <CalendarIcon className="h-5 w-5 mr-1" />
              <span>Date: {new Date(evaluation.dateEval).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              evaluation.status === 'published' ? 'bg-green-100 text-green-800' : 
              evaluation.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {evaluation.status === 'published' ? 'Publiée' : 
               evaluation.status === 'draft' ? 'Brouillon' : 'Archivée'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AcademicCapIcon className="h-8 w-8 text-[#138784]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Professeur</p>
              <p className="font-medium">{evaluation.teacher?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <UserIcon className="h-8 w-8 text-[#138784]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Étudiant</p>
              <p className="font-medium">{evaluation.student?.name}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Résumé des notes */}
      {evaluation.grades && evaluation.grades.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Résumé des notes</h3>
              <div className="flex items-center">
                <div className={`font-bold text-xl ${getScoreColorClass(scorePercentage)}`}>
                  {totalScore}/{maxPossibleScore}
                </div>
                <div className={`ml-2 px-2 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                  {scorePercentage}%
                </div>
              </div>
            </div>
            
            <div className="mt-4 mb-6">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressBarColor(scorePercentage)}`}
                  style={{ width: `${scorePercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Feedback général */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start">
              <div className="flex-shrink-0 mt-1">
                <CheckBadgeIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Feedback général</h4>
                <p className="mt-1 text-sm text-blue-700">{feedbackText}</p>
              </div>
            </div>
          </div>
          
          {/* Détail des critères et notes */}
          <div className="px-6 pt-4">
            <h4 className="font-medium mb-4">Détail par critère</h4>
            <div className="space-y-4">
              {evaluation.grades.map((grade) => {
                const criteria = grade.criteria;
                if (!criteria) return null;
                
                const criteriaPercentage = Math.round((grade.value / criteria.maxPoints) * 100);
                
                return (
                  <div key={grade.id} className="border-b border-gray-100 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{criteria.description}</div>
                        <div className="text-sm text-gray-500">Compétence: {criteria.associatedSkill}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{grade.value}/{criteria.maxPoints}</div>
                        <div className={`text-sm ${getScoreColorClass(criteriaPercentage)}`}>
                          {criteriaPercentage}%
                        </div>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getProgressBarColor(criteriaPercentage)}`}
                        style={{ width: `${criteriaPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="px-6 py-4 text-sm text-gray-500">
            <p>Coefficient total: {evaluation.scale?.criteria?.reduce((sum, c) => sum + c.coefficient, 0) || 0}/1</p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg">
          {isTeacher ? (
            <div className="flex flex-col items-center py-4">
              <ClockIcon className="h-12 w-12 mb-2 text-yellow-500" />
              <p className="text-center mb-4">Cette évaluation n'a pas encore été notée.</p>
              <Link
                href={`/evaluations/${evaluation.id}/grade`}
                className="bg-[#138784] text-white px-4 py-2 rounded-md hover:bg-[#0c6460]"
              >
                Noter cette évaluation
              </Link>
            </div>
          ) : (
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              <span>Cette évaluation n'a pas encore été notée.</span>
            </div>
          )}
        </div>
      )}
      
      {/* Commentaires */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Commentaires</h3>
          {isTeacher && (
            <Link
              href={`/evaluations/${evaluation.id}?comment=new`}
              className="text-[#138784] flex items-center hover:underline"
            >
              <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
              <span>Ajouter un commentaire</span>
            </Link>
          )}
        </div>
        
        {evaluation.comments && evaluation.comments.length > 0 ? (
          <div className="space-y-4">
            {evaluation.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{comment.teacher?.name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <p className="text-gray-700">{comment.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <ChatBubbleLeftIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>Aucun commentaire pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}