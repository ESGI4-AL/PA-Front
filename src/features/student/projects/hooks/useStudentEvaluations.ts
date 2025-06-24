import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface EvaluationCriteria {
  id: string;
  name: string;
  description?: string;
  weight: number;
  type: 'group' | 'individual';
  evaluationType: 'deliverable' | 'report' | 'presentation';
}

interface Grade {
  id: string;
  score: number;
  comment?: string;
  isPublished: boolean;
  criteriaId: string;
  groupId?: string;
  studentId?: string;
  criteria: EvaluationCriteria;
  group?: any;
  student?: any;
}

interface StudentGradeData {
  deliverable: {
    group: Grade[];
    individual: Grade[];
  };
  report: {
    group: Grade[];
    individual: Grade[];
  };
  presentation: {
    group: Grade[];
    individual: Grade[];
  };
}

export const useStudentEvaluations = (projectId: string) => {
  console.log('=== INIT HOOK useStudentEvaluations ===');
  console.log('Project ID reçu:', projectId);
  console.log('Type du Project ID:', typeof projectId);
  console.log('Project ID valide?', projectId && projectId !== 'undefined');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grades, setGrades] = useState<StudentGradeData>({
    deliverable: { group: [], individual: [] },
    report: { group: [], individual: [] },
    presentation: { group: [], individual: [] }
  });
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [projectInfo, setProjectInfo] = useState<any>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  });

  const apiRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    console.log('=== DÉBUT REQUÊTE API ÉTUDIANT ===');
    console.log('URL:', url);
    console.log('Options:', options);
    
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    console.log('URL complète:', fullUrl);
    
    const headers = getHeaders();
    console.log('Headers:', headers);
    console.log('Token présent?', headers.Authorization ? 'OUI' : 'NON');
    
    try {
      console.log('Envoi de la requête...');
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      console.log('=== RÉPONSE REÇUE ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('URL de réponse:', response.url);
      console.log('OK?', response.ok);
      
      const responseHeaders = Object.fromEntries(response.headers.entries());
      console.log('Headers de réponse:', responseHeaders);
      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (contentType && contentType.includes('text/html')) {
        console.error('❌ PROBLÈME DÉTECTÉ: Réponse HTML au lieu de JSON!');
        console.error('❌ Cela indique que la route n\'existe pas ou retourne une page d\'erreur');
        
        const htmlContent = await response.text();
        console.error('Contenu HTML reçu (100 premiers chars):', htmlContent.substring(0, 100));
        
        throw new Error('La route retourne du HTML au lieu de JSON. Vérifiez que la route existe sur le serveur.');
      }

      if (!response.ok) {
        console.error('Réponse non-OK, tentative de lecture du JSON d\'erreur...');
        
        let errorData;
        try {
          errorData = await response.json();
          console.error('Données d\'erreur JSON:', errorData);
        } catch (jsonError) {
          console.error('Impossible de parser l\'erreur en JSON:', jsonError);
          errorData = { message: `HTTP ${response.status}` };
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      console.log('Réponse OK, tentative de lecture du JSON...');
      const result = await response.json();
      console.log('JSON parsé avec succès:', result);
      console.log('=== FIN REQUÊTE API RÉUSSIE ===');
      
      return result;
      
    } catch (error: any) {
      console.error('=== ERREUR DANS apiRequest ===');
      console.error('Type d\'erreur:', error.name);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('=== FIN ERREUR ===');
      throw error;
    }
  }, []);

  const loadStudentGrades = useCallback(async () => {
    console.log('=== DÉBUT loadStudentGrades ===');
    console.log('Project ID:', projectId);
    
    if (!projectId) {
      console.log('Pas de projectId, arrêt de la fonction');
      return;
    }
    
    if (projectId === 'undefined') {
      console.error('Project ID est "undefined" (string), problème dans l\'URL');
      return;
    }
    
    try {
      console.log('⏳ Début du chargement des notes étudiant...');
      setLoading(true);
      setError(null);
      
      // UTILISE LA VRAIE ROUTE QUE VOUS AVEZ AJOUTÉE
      const url = `/projects/${projectId}/student/grades`;
      console.log('URL construite:', url);
      
      const result = await apiRequest(url);
      console.log('Résultat notes étudiant reçu:', result);
      
      if (result.status === 'success') {
        console.log('Status success détecté');
        console.log('Data reçue:', result.data);
        
        setGrades(result.data.grades || {
          deliverable: { group: [], individual: [] },
          report: { group: [], individual: [] },
          presentation: { group: [], individual: [] }
        });
        
        setStudentInfo(result.data.student);
        setProjectInfo(result.data.project);
        
        console.log('Notes étudiant mises à jour dans le state');
      } else {
        console.error('Status non-success:', result.status);
        throw new Error(result.message || 'Erreur lors du chargement des notes');
      }
    } catch (error: any) {
      console.error('=== ERREUR dans loadStudentGrades ===');
      console.error('Erreur:', error);
      console.error('Message:', error.message);
      
      const errorMessage = error.message || 'Erreur de connexion';
      setError(errorMessage);
      console.error('Error loading student grades:', error);
    } finally {
      setLoading(false);
      console.log('=== FIN loadStudentGrades ===');
    }
  }, [projectId, apiRequest]);

  const refreshGrades = useCallback(async () => {
    console.log('=== DÉBUT refreshGrades ===');
    await loadStudentGrades();
    console.log('=== FIN refreshGrades ===');
  }, [loadStudentGrades]);

  // Fonctions utilitaires pour le calcul des moyennes
  const calculateWeightedAverage = useCallback((gradesList: Grade[]) => {
    if (gradesList.length === 0) return null;
    
    const publishedGrades = gradesList.filter(g => g.isPublished);
    if (publishedGrades.length === 0) return null;
    
    const totalWeight = publishedGrades.reduce((sum, grade) => sum + grade.criteria.weight, 0);
    const weightedSum = publishedGrades.reduce((sum, grade) => sum + (grade.score * grade.criteria.weight), 0);
    
    return totalWeight > 0 ? weightedSum / totalWeight : null;
  }, []);

  const calculateOverallAverage = useCallback(() => {
    const allGrades = [
      ...grades.deliverable.group,
      ...grades.deliverable.individual,
      ...grades.report.group,
      ...grades.report.individual,
      ...grades.presentation.group,
      ...grades.presentation.individual
    ];
    
    return calculateWeightedAverage(allGrades);
  }, [grades, calculateWeightedAverage]);

  const getTypeAverage = useCallback((evaluationType: keyof StudentGradeData) => {
    const typeGrades = [...grades[evaluationType].group, ...grades[evaluationType].individual];
    return calculateWeightedAverage(typeGrades);
  }, [grades, calculateWeightedAverage]);

  const getPublishedGradesCount = useCallback(() => {
    const allGrades = [
      ...grades.deliverable.group,
      ...grades.deliverable.individual,
      ...grades.report.group,
      ...grades.report.individual,
      ...grades.presentation.group,
      ...grades.presentation.individual
    ];
    
    const publishedCount = allGrades.filter(g => g.isPublished).length;
    const totalCount = allGrades.length;
    
    return { publishedCount, totalCount };
  }, [grades]);

  const getStatistics = useCallback(() => {
    console.log('=== Calcul des statistiques étudiant ===');
    
    const overallAverage = calculateOverallAverage();
    const deliverableAverage = getTypeAverage('deliverable');
    const reportAverage = getTypeAverage('report');
    const presentationAverage = getTypeAverage('presentation');
    const { publishedCount, totalCount } = getPublishedGradesCount();
    
    const stats = {
      overallAverage,
      deliverableAverage,
      reportAverage,
      presentationAverage,
      publishedCount,
      totalCount,
      completionPercentage: totalCount > 0 ? Math.round((publishedCount / totalCount) * 100) : 0
    };
    
    console.log('Statistiques étudiant calculées:', stats);
    return stats;
  }, [calculateOverallAverage, getTypeAverage, getPublishedGradesCount]);

  useEffect(() => {
    console.log('=== useEffect CHARGEMENT INITIAL ÉTUDIANT ===');
    console.log('Project ID dans useEffect:', projectId);
    console.log('Condition de chargement:', projectId ? 'TRUE' : 'FALSE');
    
    if (projectId) {
      console.log('Démarrage du chargement initial étudiant...');
      loadStudentGrades();
    } else {
      console.log('Pas de projectId, pas de chargement');
    }
  }, [projectId, loadStudentGrades]);

  console.log('=== ÉTAT ACTUEL DU HOOK ÉTUDIANT ===');
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Student Info:', studentInfo);
  console.log('Project Info:', projectInfo);
  console.log('Grades keys:', Object.keys(grades));

  return {
    // États
    loading,
    error,
    grades,
    studentInfo,
    projectInfo,
    
    refreshGrades,
    loadStudentGrades,
    
    calculateWeightedAverage,
    calculateOverallAverage,
    getTypeAverage,
    getPublishedGradesCount,
    getStatistics
  };
};