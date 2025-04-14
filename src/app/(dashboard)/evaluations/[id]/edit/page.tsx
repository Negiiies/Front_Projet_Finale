// src/app/(dashboard)/evaluations/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../lib/auth';
import { useNotification } from '../../../../../contexts/NotificationContext';
import evaluationService from '../../../../../services/evaluationService';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../../../../components/ui/LoadingSpinner';

export default function EditEvaluationPage() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  const params = useParams();
  const evaluationId = Number(params.id);
  
  // États du formulaire
  const [title, setTitle] = useState('');
  const [dateEval, setDateEval] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<any>(null);

  // Charger les données de l'évaluation
  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        setLoading(true);
        const data = await evaluationService.getEvaluationById(evaluationId);
        setEvaluation(data);
        
        // Préremplir le formulaire
        setTitle(data.title);
        setDateEval(formatDateForInput(data.dateEval));
        
        // Vérifier si l'utilisateur a le droit de modifier cette évaluation
        if (user?.role !== 'admin' && data.teacherId !== user?.userId) {
          showNotification('error', 'Accès refusé', 'Vous ne pouvez pas modifier cette évaluation.');
          router.push(`/evaluations/${evaluationId}`);
          return;
        }
        
        // Vérifier si l'évaluation est en mode brouillon
        if (data.status !== 'draft') {
          showNotification('warning', 'Modification impossible', 'Seules les évaluations en mode brouillon peuvent être modifiées.');
          router.push(`/evaluations/${evaluationId}`);
          return;
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'évaluation', err);
        setError('Impossible de charger les détails de cette évaluation.');
        showNotification('error', 'Erreur de chargement', 'Impossible de charger les détails de cette évaluation.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [evaluationId, user, router, showNotification]);

  // Formater la date pour le champ input
  const formatDateForInput = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !dateEval) {
      setError('Le titre et la date sont requis.');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const updateData = {
        title,
        dateEval: new Date(dateEval)
      };
      
      await evaluationService.updateEvaluation(evaluationId, updateData);
      showNotification('success', 'Évaluation mise à jour', 'L\'évaluation a été mise à jour avec succès.');
      router.push(`/evaluations/${evaluationId}`);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'évaluation', err);
      setError('Impossible de mettre à jour l\'évaluation. Veuillez vérifier vos données.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Chargement de l'évaluation..." />;
  }

  if (!evaluation) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
        Évaluation non trouvée.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Link href={`/evaluations/${evaluationId}`} className="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Modifier l'évaluation</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre de l'évaluation *
            </label>
            <input
              type="text"
              id="title"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#138784] focus:border-[#138784]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="dateEval" className="block text-sm font-medium text-gray-700 mb-1">
              Date d'évaluation *
            </label>
            <input
              type="date"
              id="dateEval"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#138784] focus:border-[#138784]"
              value={dateEval}
              onChange={(e) => setDateEval(e.target.value)}
              required
            />
          </div>
        </div>
        
        {/* Informations en lecture seule */}
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Informations sur l'évaluation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Étudiant:</span> 
              <span className="ml-2">{evaluation.student?.name}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Barème:</span> 
              <span className="ml-2">{evaluation.scale?.title}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Statut:</span> 
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Brouillon
              </span>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Créée le:</span> 
              <span className="ml-2">{new Date(evaluation.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Link
            href={`/evaluations/${evaluationId}`}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Link>
          
          <button
            type="submit"
            disabled={saving}
            className="bg-[#138784] text-white px-6 py-2 rounded-md hover:bg-[#0c6460] disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
      
      {/* Section pour accéder aux notes */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Notes et évaluation</h3>
          <Link
            href={`/evaluations/${evaluationId}/grade`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Modifier les notes
          </Link>
        </div>
        
        <p className="text-gray-600">
          Pour modifier les notes attribuées aux différents critères, utilisez la page dédiée à la notation.
        </p>
      </div>
    </div>
  );
}