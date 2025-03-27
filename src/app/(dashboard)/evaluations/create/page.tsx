// src/app/(dashboard)/evaluations/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import evaluationService from '../../../../services/evaluationService';
import scaleService, { Scale } from '../../../../services/scaleService';
import userService, { User } from '../../../../services/userService';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CreateEvaluationPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [dateEval, setDateEval] = useState('');
  const [studentId, setStudentId] = useState<number | ''>('');
  const [scaleId, setScaleId] = useState<number | ''>('');
  
  const [students, setStudents] = useState<User[]>([]);
  const [scales, setScales] = useState<Scale[]>([]);
  const [selectedScale, setSelectedScale] = useState<Scale | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas un professeur
    if (user && user.role !== 'teacher' && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    const fetchData = async () => {
      try {
        const [studentsData, scalesData] = await Promise.all([
          userService.getUsers(), // Dans une application réelle, vous filtreriez les étudiants côté serveur
          scaleService.getScales()
        ]);
        
        // Filtrer seulement les étudiants actifs
        setStudents(studentsData.filter(u => u.role === 'student' && u.status === 'active'));
        
        // Filtrer les barèmes disponibles pour ce professeur (ses propres barèmes ou ceux partagés)
        const availableScales = user?.role === 'admin' 
          ? scalesData 
          : scalesData.filter(s => s.creatorId === user?.userId || s.isShared);
          
        setScales(availableScales);
      } catch (err) {
        console.error('Erreur lors du chargement des données', err);
        setError('Impossible de charger les données nécessaires pour créer une évaluation.');
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, [user, router]);

  // Charger les détails du barème sélectionné
  useEffect(() => {
    if (!scaleId) {
      setSelectedScale(null);
      return;
    }
    
    const fetchScaleDetails = async () => {
      try {
        const scaleData = await scaleService.getScaleById(Number(scaleId));
        setSelectedScale(scaleData);
      } catch (err) {
        console.error('Erreur lors du chargement des détails du barème', err);
        setError('Impossible de charger les détails du barème sélectionné.');
      }
    };
    
    fetchScaleDetails();
  }, [scaleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !dateEval || !studentId || !scaleId) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const evaluationData = {
        title,
        dateEval: new Date(dateEval),
        studentId: Number(studentId),
        scaleId: Number(scaleId)
      };
      
      await evaluationService.createEvaluation(evaluationData);
      router.push('/evaluations');
    } catch (err) {
      console.error('Erreur lors de la création de l\'évaluation', err);
      setError('Impossible de créer l\'évaluation. Veuillez vérifier vos données.');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#138784]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Link href="/evaluations" className="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Créer une nouvelle évaluation</h1>
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
          
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
              Étudiant *
            </label>
            <select
              id="studentId"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#138784] focus:border-[#138784]"
              value={studentId}
              onChange={(e) => setStudentId(Number(e.target.value))}
              required
            >
              <option value="">Sélectionner un étudiant</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="scaleId" className="block text-sm font-medium text-gray-700 mb-1">
              Barème *
            </label>
            <select
              id="scaleId"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#138784] focus:border-[#138784]"
              value={scaleId}
              onChange={(e) => setScaleId(Number(e.target.value))}
              required
            >
              <option value="">Sélectionner un barème</option>
              {scales.map((scale) => (
                <option key={scale.id} value={scale.id}>
                  {scale.title}
                </option>
              ))}
            </select>
            {scales.length === 0 && (
              <p className="mt-2 text-sm text-orange-600">
                Vous n'avez pas encore créé de barème. <Link href="/scales/create" className="text-blue-600 hover:underline">Créer un barème</Link>
              </p>
            )}
          </div>
        </div>
        
        {/* Afficher les détails du barème sélectionné */}
        {selectedScale && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Détails du barème sélectionné</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium">{selectedScale.title}</h4>
              {selectedScale.description && (
                <p className="text-sm text-gray-600 mt-1">{selectedScale.description}</p>
              )}
              
              {selectedScale.criteria && selectedScale.criteria.length > 0 ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">Critère</th>
                        <th className="px-4 py-2 text-left">Compétence</th>
                        <th className="px-4 py-2 text-right">Max points</th>
                        <th className="px-4 py-2 text-right">Coefficient</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedScale.criteria.map(criteria => (
                        <tr key={criteria.id} className="border-t border-gray-200">
                          <td className="px-4 py-2">{criteria.description}</td>
                          <td className="px-4 py-2">{criteria.associatedSkill}</td>
                          <td className="px-4 py-2 text-right">{criteria.maxPoints}</td>
                          <td className="px-4 py-2 text-right">{criteria.coefficient}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">Ce barème ne contient pas de critères.</p>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-4 pt-4">
          <Link
            href="/evaluations"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Link>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-[#138784] text-white px-6 py-2 rounded-md hover:bg-[#0c6460] disabled:opacity-50"
          >
            {loading ? 'Création en cours...' : 'Créer l\'évaluation'}
          </button>
        </div>
      </form>
    </div>
  );
}