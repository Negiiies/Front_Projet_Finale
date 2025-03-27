// src/app/(dashboard)/evaluations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth';
import evaluationService, { Evaluation } from '../../../services/evaluationService';
import Link from 'next/link';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function EvaluationsPage() {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const data = await evaluationService.getEvaluations();
        setEvaluations(data);
      } catch (err) {
        console.error('Erreur lors du chargement des évaluations', err);
        setError('Impossible de charger les évaluations. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      return;
    }

    try {
      await evaluationService.deleteEvaluation(id);
      setEvaluations(evaluations.filter(evaluation => evaluation.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression', err);
      setError('Impossible de supprimer cette évaluation.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#138784]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        {error}
      </div>
    );
  }

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Évaluations</h1>
        {isTeacherOrAdmin && (
          <Link 
            href="/evaluations/create" 
            className="bg-[#138784] text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-[#0c6460] transition"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nouvelle évaluation</span>
          </Link>
        )}
      </div>

      {evaluations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Aucune évaluation disponible pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                {user?.role === 'teacher' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
                )}
                {user?.role === 'student' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professeur</th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {evaluations.map((evaluation) => (
                <tr key={evaluation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{evaluation.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(evaluation.dateEval).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${evaluation.status === 'published' ? 'bg-green-100 text-green-800' : 
                        evaluation.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {evaluation.status === 'published' ? 'Publiée' : 
                       evaluation.status === 'draft' ? 'Brouillon' : 'Archivée'}
                    </span>
                  </td>
                  {user?.role === 'teacher' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{evaluation.student?.name}</div>
                    </td>
                  )}
                  {user?.role === 'student' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{evaluation.teacher?.name}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link 
                        href={`/evaluations/${evaluation.id}`} 
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      
                      {isTeacherOrAdmin && evaluation.status === 'draft' && (
                        <>
                          <Link 
                            href={`/evaluations/${evaluation.id}/edit`} 
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          
                          <button 
                            onClick={() => handleDelete(evaluation.id)} 
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}