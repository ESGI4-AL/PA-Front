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

interface GradeData {
  [evaluationType: string]: {
    group: { [groupId: string]: { group: any; grades: Grade[] } };
    individual: { [studentId: string]: { student: any; grades: Grade[] } };
  };
}

interface CreateCriteriaData {
  name: string;
  description?: string;
  weight: number;
  type: 'group' | 'individual';
  evaluationType: 'deliverable' | 'report' | 'presentation';
}

interface GradeInput {
  score: number;
  comment?: string;
  isPublished?: boolean;
}

export const useEvaluations = (projectId: string) => {
  //.log('=== INIT HOOK useEvaluations ===');
  //.log('Project ID reçu:', projectId);
  //.log('Type du Project ID:', typeof projectId);
  //.log('Project ID valide?', projectId && projectId !== 'undefined');


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [grades, setGrades] = useState<GradeData>({
    deliverable: { group: {}, individual: {} },
    report: { group: {}, individual: {} },
    presentation: { group: {}, individual: {} }
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  });

  const apiRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    //console.log('=== DÉBUT REQUÊTE API ===');
    //console.log('URL:', url);
    //console.log('Options:', options);

    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    //console.log('URL complète:', fullUrl);

    const headers = getHeaders();
    //console.log('Headers:', headers);
    //console.log('Token présent?', headers.Authorization ? 'OUI' : 'NON');

    try {
      //console.log('Envoi de la requête...');
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      //console.log('=== RÉPONSE REÇUE ===');
      //console.log('Status:', response.status);
      //console.log('Status Text:', response.statusText);
      //console.log('URL de réponse:', response.url);
      //console.log('OK?', response.ok);

      const responseHeaders = Object.fromEntries(response.headers.entries());
      //console.log('Headers de réponse:', responseHeaders);

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

  const loadEvaluationCriteria = useCallback(async () => {
    console.log('=== DÉBUT loadEvaluationCriteria ===');
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
      console.log('⏳ Début du chargement...');
      setLoading(true);
      setError(null);

      const url = `/projects/${projectId}/evaluation-criteria`;
      console.log('URL construite:', url);

      const result = await apiRequest(url);
      console.log('Résultat reçu:', result);

      if (result.status === 'success') {
        console.log('Status success détecté');
        console.log('Data reçue:', result.data);
        console.log('Type de data:', typeof result.data);
        console.log('Est un array?', Array.isArray(result.data));

        setCriteria(result.data);
        console.log('Critères mis à jour dans le state');
      } else {
        console.error('Status non-success:', result.status);
        throw new Error(result.message || 'Erreur lors du chargement des critères');
      }
    } catch (error: any) {
      console.error('=== ERREUR dans loadEvaluationCriteria ===');
      console.error('Erreur:', error);
      console.error('Message:', error.message);

      const errorMessage = error.message || 'Erreur de connexion';
      setError(errorMessage);
      console.error('Error loading criteria:', error);
    } finally {
      setLoading(false);
      console.log('=== FIN loadEvaluationCriteria ===');
    }
  }, [projectId, apiRequest]);

  const loadProjectGrades = useCallback(async () => {
    console.log('=== DÉBUT loadProjectGrades ===');
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
      const url = `/projects/${projectId}/grades`;
      console.log('URL grades construite:', url);

      const result = await apiRequest(url);
      console.log('Résultat grades reçu:', result);

      if (result.status === 'success') {
        console.log('Grades status success');
        console.log('Grades data:', result.data);
        setGrades(result.data);
        console.log('Grades mis à jour dans le state');
      } else {
        console.warn('Grades status non-success:', result.status);
      }
    } catch (error: any) {
      console.error('=== ERREUR dans loadProjectGrades ===');
      console.error('Erreur grades:', error);
      console.error('Error loading grades:', error);
    } finally {
      console.log('=== FIN loadProjectGrades ===');
    }
  }, [projectId, apiRequest]);

  const createEvaluationCriteria = useCallback(async (criteriaData: CreateCriteriaData) => {
    console.log('=== DÉBUT createEvaluationCriteria ===');
    console.log('Données du critère:', criteriaData);

    if (!projectId) {
      console.error('Pas de projectId pour la création');
      return;
    }

    try {
      setLoading(true);

      const url = `/projects/${projectId}/evaluation-criteria`;
      console.log('URL création:', url);

      const result = await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(criteriaData)
      });

      console.log('Résultat création:', result);

      if (result.status === 'success') {
        toast.success('Critère créé avec succès');
        console.log('Critère créé, rechargement de la liste...');
        await loadEvaluationCriteria();
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors de la création');
      }
    } catch (error: any) {
      console.error('Erreur création critère:', error);
      const errorMessage = error.message || 'Erreur de connexion';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      console.log('🏁 === FIN createEvaluationCriteria ===');
    }
  }, [projectId, apiRequest, loadEvaluationCriteria]);

  const updateEvaluationCriteria = useCallback(async (criteriaId: string, updateData: Partial<CreateCriteriaData>) => {
    console.log('=== DÉBUT updateEvaluationCriteria ===');
    console.log('Criteria ID:', criteriaId);
    console.log('Update Data:', updateData);

    try {
      setLoading(true);

      const url = `/evaluation/criteria/${criteriaId}`;
      console.log('URL modification:', url);

      const result = await apiRequest(url, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (result.status === 'success') {
        toast.success('Critère modifié avec succès');
        await loadEvaluationCriteria();
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors de la modification');
      }
    } catch (error: any) {
      console.error('Erreur modification critère:', error);
      const errorMessage = error.message || 'Erreur de connexion';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      console.log('=== FIN updateEvaluationCriteria ===');
    }
  }, [apiRequest, loadEvaluationCriteria]);

  const deleteEvaluationCriteria = useCallback(async (criteriaId: string) => {
    console.log('=== DÉBUT deleteEvaluationCriteria ===');
    console.log('Criteria ID à supprimer:', criteriaId);

    try {
      setLoading(true);

      const url = `/evaluation/criteria/${criteriaId}`;
      console.log('📍 URL suppression:', url);

      const result = await apiRequest(url, {
        method: 'DELETE'
      });

      if (result.status === 'success') {
        toast.success('Critère supprimé avec succès');
        await loadEvaluationCriteria();
        return result;
      } else {
        throw new Error(result.message || 'Erreur lors de la suppression');
      }
    } catch (error: any) {
      console.error('Erreur suppression critère:', error);
      const errorMessage = error.message || 'Erreur de connexion';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      console.log('=== FIN deleteEvaluationCriteria ===');
    }
  }, [apiRequest, loadEvaluationCriteria]);

  const gradeGroup = useCallback(async (criteriaId: string, groupId: string, gradeData: GradeInput) => {
    console.log('=== DÉBUT gradeGroup ===');
    console.log('Criteria ID:', criteriaId);
    console.log('Group ID:', groupId);
    console.log('Grade Data:', gradeData);

    try {
      setLoading(true);

      const url = `/evaluation/criteria/${criteriaId}/group/${groupId}`;
      console.log('URL notation groupe:', url);

      const result = await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(gradeData)
      });

      if (result.status === 'success') {
        toast.success('Note attribuée avec succès');
        await loadProjectGrades();
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors de l\'attribution');
      }
    } catch (error: any) {
      console.error('Erreur notation groupe:', error);
      const errorMessage = error.message || 'Erreur de connexion';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      console.log('=== FIN gradeGroup ===');
    }
  }, [apiRequest, loadProjectGrades]);

  const gradeStudent = useCallback(async (criteriaId: string, studentId: string, gradeData: GradeInput) => {
    console.log('=== DÉBUT gradeStudent ===');
    console.log('Criteria ID:', criteriaId);
    console.log('Student ID:', studentId);
    console.log('Grade Data:', gradeData);

    try {
      setLoading(true);

      const url = `/evaluation/criteria/${criteriaId}/student/${studentId}`;
      console.log('URL notation étudiant:', url);

      const result = await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(gradeData)
      });

      if (result.status === 'success') {
        toast.success('Note attribuée avec succès');
        await loadProjectGrades();
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors de l\'attribution');
      }
    } catch (error: any) {
      console.error('Erreur notation étudiant:', error);
      const errorMessage = error.message || 'Erreur de connexion';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      console.log('=== FIN gradeStudent ===');
    }
  }, [apiRequest, loadProjectGrades]);

  const publishProjectGrades = useCallback(async () => {
    console.log('=== DÉBUT publishProjectGrades ===');

    if (!projectId) {
      console.error('Pas de projectId pour la publication');
      return;
    }

    try {
      setLoading(true);

      const url = `/projects/${projectId}/publish-grades`;
      console.log('URL publication:', url);

      const result = await apiRequest(url, {
        method: 'POST'
      });

      if (result.status === 'success') {
        toast.success('Notes publiées avec succès');
        await loadProjectGrades();
        return result;
      } else {
        throw new Error(result.message || 'Erreur lors de la publication');
      }
    } catch (error: any) {
      console.error('Erreur publication:', error);
      const errorMessage = error.message || 'Erreur de connexion';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      console.log('=== FIN publishProjectGrades ===');
    }
  }, [projectId, apiRequest, loadProjectGrades]);

  const calculateGroupFinalGrade = useCallback(async (groupId: string) => {
    console.log('=== DÉBUT calculateGroupFinalGrade ===');
    console.log('Group ID:', groupId);

    if (!projectId) {
      console.error('Pas de projectId pour le calcul');
      return;
    }

    try {
      const url = `/projects/${projectId}/groups/${groupId}/final-grade`;
      console.log('URL calcul note finale:', url);

      const result = await apiRequest(url);

      if (result.status === 'success') {
        console.log('Calcul réussi:', result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors du calcul');
      }
    } catch (error: any) {
      console.error('Erreur calcul note finale:', error);
      throw error;
    } finally {
      console.log('=== FIN calculateGroupFinalGrade ===');
    }
  }, [projectId, apiRequest]);

  const getStatistics = useCallback(() => {
    console.log('=== Calcul des statistiques ===');
    console.log('Nombre de critères:', criteria.length);

    const totalCriteria = criteria.length;
    const deliverableCriteria = criteria.filter(c => c.evaluationType === 'deliverable').length;
    const reportCriteria = criteria.filter(c => c.evaluationType === 'report').length;
    const presentationCriteria = criteria.filter(c => c.evaluationType === 'presentation').length;
    const groupCriteria = criteria.filter(c => c.type === 'group').length;
    const individualCriteria = criteria.filter(c => c.type === 'individual').length;

    const stats = {
      totalCriteria,
      deliverableCriteria,
      reportCriteria,
      presentationCriteria,
      groupCriteria,
      individualCriteria
    };

    console.log('Statistiques calculées:', stats);
    return stats;
  }, [criteria]);

  useEffect(() => {
    console.log('=== useEffect CHARGEMENT INITIAL ===');
    console.log('Project ID dans useEffect:', projectId);
    console.log('Condition de chargement:', projectId ? 'TRUE' : 'FALSE');

    if (projectId) {
      console.log('Démarrage du chargement initial...');
      loadEvaluationCriteria();
      loadProjectGrades();
    } else {
      console.log('Pas de projectId, pas de chargement');
    }
  }, [projectId, loadEvaluationCriteria, loadProjectGrades]);

  console.log('=== ÉTAT ACTUEL DU HOOK ===');
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Criteria count:', criteria.length);
  console.log('Grades keys:', Object.keys(grades));

  return {

    loading,
    error,
    criteria,
    grades,


    createEvaluationCriteria,
    updateEvaluationCriteria,
    deleteEvaluationCriteria,
    gradeGroup,
    gradeStudent,
    publishProjectGrades,
    calculateGroupFinalGrade,
    loadEvaluationCriteria,
    loadProjectGrades,
    getStatistics
  };
};