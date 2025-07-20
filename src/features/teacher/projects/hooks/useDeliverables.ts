import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ValidationRule {
  id?: string;
  type: 'file_size' | 'file_presence' | 'folder_structure' | 'file_content';
  rule: any;
  description: string;
}

interface Deliverable {
  id: string;
  name: string;
  description?: string;
  type: 'archive' | 'git';
  deadline: string;
  allowLateSubmission: boolean;
  latePenaltyPerHour: number;
  rules?: ValidationRule[];
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

interface DeliverableForm {
  name: string;
  description: string;
  type: 'archive' | 'git';
  deadline: string;
  allowLateSubmission: boolean;
  latePenaltyPerHour: number;
  rules: ValidationRule[];
}

interface DeliverableStats {
  totalDeliverables: number;
  activeDeliverables: number;
  expiredDeliverables: number;
  submissionsRate: number;
}

interface GroupSummary {
  group: {
    id: string;
    name: string;
  };
  submission: {
    id: string;
    submissionDate: string;
    isLate: boolean;
    hoursLate: number;
    validationStatus: 'pending' | 'valid' | 'invalid';
    validationDetails: any;
    similarityScore: number | null;
  } | null;
}

interface DeliverableSummary {
  deliverable: {
    id: string;
    name: string;
    description: string;
    type: string;
    deadline: string;
    allowLateSubmission: boolean;
    latePenaltyPerHour: number;
  };
  rules: ValidationRule[];
  groupSummaries: GroupSummary[];
}

interface SimilarityAnalysisResult {
  deliverableId: string;
  deliverableName: string;
  submissionsCount: number;
  validSubmissionsCount: number;
  comparisons: Array<{
    submission1Id: string;
    submission2Id: string;
    group1: { id: string; name: string };
    group2: { id: string; name: string };
    similarityScore: number;
    similarityPercentage: number;
    method: string;
    algorithms: Array<any>;
    details: {
      file1: string;
      file2: string;
      type1: string;
      type2: string;
      timestamp: string;
      error?: string;
    };
    isSuspicious: boolean;
    comparedAt: string;
  }>;
  suspiciousPairs: Array<any>;
  similarityMatrix: { [key: string]: { [key: string]: number } };
  statistics: {
    totalComparisons: number;
    successfulComparisons: number;
    errorCount: number;
    suspiciousCount: number;
    averageSimilarity: number;
    maxSimilarity: number;
  };
  threshold: number;
  submissions: Array<{
    id: string;
    groupId: string;
    groupName: string;
    fileName?: string;
    fileSize?: number;
    filePath?: string;
    gitUrl?: string;
    submissionDate: string;
    isLate: boolean;
    validationStatus: string;
    similarityScore?: number;
  }>;
  processedAt: string;
}

export const useDeliverables = (projectId: string) => {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DeliverableStats>({
    totalDeliverables: 0,
    activeDeliverables: 0,
    expiredDeliverables: 0,
    submissionsRate: 0
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  });

  const apiCall = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          ...getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Si on ne peut pas parser la réponse JSON
          if (response.status === 404) {
            errorMessage = 'Ressource non trouvée';
          } else if (response.status === 403) {
            errorMessage = 'Accès refusé';
          } else if (response.status >= 500) {
            errorMessage = 'Erreur serveur';
          } else {
            errorMessage = 'Erreur réseau';
          }
        }

        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Erreur réseau - Vérifiez votre connexion internet');
      }
      throw error;
    }
  };

  const fetchDeliverables = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCall(`/projects/${projectId}/deliverables`);

      if (response.status === 'success') {
        const deliverablesList = response.data || [];
        setDeliverables(deliverablesList);

        const now = new Date();
        const total = deliverablesList.length;
        const active = deliverablesList.filter((d: Deliverable) => new Date(d.deadline) > now).length;
        const expired = total - active;

        setStats({
          totalDeliverables: total,
          activeDeliverables: active,
          expiredDeliverables: expired,
          submissionsRate: 0 // TODO: calculer le vrai taux basé sur les soumissions
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des livrables:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const createDeliverable = async (deliverableData: DeliverableForm) => {
    try {
      setLoading(true);

      const response = await apiCall(`/projects/${projectId}/deliverables`, {
        method: 'POST',
        body: JSON.stringify(deliverableData),
      });

      if (response.status === 'success') {
        await fetchDeliverables();
        toast.success('Livrable créé avec succès');
        return response.data;
      }
    } catch (error) {
      console.error('Erreur lors de la création du livrable:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateDeliverable = async (deliverableId: string, updateData: Partial<DeliverableForm>) => {
    try {
      setLoading(true);

      const response = await apiCall(`/deliverables/${deliverableId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (response.status === 'success') {
        await fetchDeliverables();
        toast.success('Livrable modifié avec succès');
        return response.data;
      }
    } catch (error) {
      console.error('Erreur lors de la modification du livrable:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la modification';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteDeliverable = async (deliverableId: string) => {
    try {
      setLoading(true);

      const response = await apiCall(`/deliverables/${deliverableId}`, {
        method: 'DELETE',
      });

      if (response.status === 'success') {
        await fetchDeliverables();
        toast.success('Livrable supprimé avec succès');
        return response.data;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du livrable:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const analyzeSimilarity = async (deliverableId: string): Promise<SimilarityAnalysisResult> => {
    try {
      const response = await apiCall(`/deliverables/${deliverableId}/analyze`, {
        method: 'POST',
      });

      if (response.status === 'success') {
        toast.success('Analyse de similarité terminée');
        return response.data;
      }

      throw new Error('Réponse API invalide');
    } catch (error) {
      console.error('Erreur lors de l\'analyse de similarité:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'analyse';
      toast.error(errorMessage);
      throw error;
    }
  };

  const getSubmissionContent = async (submissionId: string): Promise<{
    content: string;
    fileName?: string;
    language?: string;
  }> => {
    try {
      const response = await apiCall(`/deliverables/submissions/${submissionId}/content`);

      if (response.status === 'success') {
        return response.data;
      }

      throw new Error('Réponse API invalide');
    } catch (error) {
      console.error('Erreur lors de la récupération du contenu:', error);

      let errorMessage = 'Erreur inconnue';

      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('non trouvée')) {
          errorMessage = 'Soumission non trouvée ou fichier supprimé';
        } else if (error.message.includes('réseau') || error.message.includes('network')) {
          errorMessage = 'Erreur réseau - Impossible de récupérer le contenu du fichier';
        } else if (error.message.includes('Expires') || error.message.includes('expired')) {
          errorMessage = 'Le lien de téléchargement a expiré. Veuillez rafraîchir la page';
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'Accès refusé au fichier';
        } else if (error.message.includes('500')) {
          errorMessage = 'Erreur serveur lors de la lecture du fichier';
        } else {
          errorMessage = error.message;
        }
      }

      throw new Error(`Impossible de récupérer le contenu du fichier: ${errorMessage}`);
    }
  };

  const getDeliverableSummary = async (deliverableId: string): Promise<DeliverableSummary> => {
    try {
      const response = await apiCall(`/deliverables/${deliverableId}/summary`);

      if (response.status === 'success') {
        return response.data;
      }

      throw new Error('Réponse API invalide');
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la récupération du résumé';
      toast.error(errorMessage);
      throw error;
    }
  };

  const sendDeadlineReminders = async () => {
    try {
      const response = await apiCall('/deliverables/send-reminders', {
        method: 'POST',
      });

      if (response.status === 'success') {
        toast.success(`${response.data.count} rappels envoyés`);
        return response.data;
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des rappels:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi des rappels';
      toast.error(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    if (projectId && projectId !== 'undefined') {
      fetchDeliverables();
    }
  }, [projectId]);

  return {
    deliverables,
    loading,
    error,
    stats,

    createDeliverable,
    updateDeliverable,
    deleteDeliverable,
    analyzeSimilarity,
    getDeliverableSummary,
    getSubmissionContent,
    sendDeadlineReminders,

    refetch: fetchDeliverables,
  };
};
