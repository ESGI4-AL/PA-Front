import { getAuthToken } from '../../user/services/authService';
import {
  StudentDeliverableView,
  SubmitDeliverableData,
  ValidationResult
} from '../models/deliverableModels';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Vous devez être connecté pour effectuer cette action');
  }
  return {
    'Authorization': `Bearer ${token}`
  };
};

const handleApiResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
    }
    if (response.status === 413) {
      throw new Error('Fichier trop volumineux. Vérifiez la taille maximale autorisée.');
    }
    throw new Error(data.message || 'Une erreur est survenue');
  }
  return data.data || data;
};

/**
 * Récupère la liste des livrables d'un projet pour un étudiant
 */
export const getProjectDeliverables = async (projectId: string): Promise<StudentDeliverableView[]> => {
  try {
    const url = `${API_URL}/projects/${projectId}/deliverables`;
    const headers = getAuthHeaders();

    const response = await fetch(url, { headers });
    const deliverables = await handleApiResponse(response);

    // Compteurs pour l'analyse Firebase
    let firebaseSubmissionsCount = 0;
    let totalSubmissionsCount = 0;

    // Traitement côté client pour ajouter les propriétés calculées
    const processedDeliverables = deliverables.map((deliverable: any, index: number) => {
      const now = new Date();
      const deadline = new Date(deliverable.deadline);
      const isExpired = now > deadline;
      const timeRemaining = deadline.getTime() - now.getTime();

      const submission = deliverable.submission || deliverable.submissions?.[0] || null;

      // Log pour débug si soumission trouvée
      if (submission) {
        totalSubmissionsCount++;
        const isFirebaseStored = !!(submission.filePath || submission.gitUrl);
        if (isFirebaseStored) firebaseSubmissionsCount++;
      }

      return {
        ...deliverable,
        submission,
        isExpired,
        timeRemaining: timeRemaining > 0 ? timeRemaining : 0,
        canSubmit: !isExpired || deliverable.allowLateSubmission
      };
    });

    return processedDeliverables;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère un livrable spécifique avec ses détails
 */
export const getDeliverableById = async (deliverableId: string): Promise<StudentDeliverableView> => {
  try {
    const response = await fetch(`${API_URL}/deliverables/${deliverableId}`, {
      headers: getAuthHeaders()
    });
    const deliverable = await handleApiResponse(response);

    const now = new Date();
    const deadline = new Date(deliverable.deadline);
    const isExpired = now > deadline;
    const timeRemaining = deadline.getTime() - now.getTime();

    return {
      ...deliverable,
      isExpired,
      timeRemaining: timeRemaining > 0 ? timeRemaining : 0,
      canSubmit: !isExpired || deliverable.allowLateSubmission
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère le groupe de l'utilisateur pour un projet donné
 */
const getCurrentUserGroupId = async (projectId: string): Promise<string> => {
  try {
    // Vérifier d'abord si l'utilisateur a un groupe dans le localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.groupId) {
      return user.groupId;
    }

    // Sinon, récupérer depuis l'API
    const response = await fetch(`${API_URL}/groups/project/${projectId}/user-group`, {
      headers: getAuthHeaders()
    });
    const data = await handleApiResponse(response);

    return data.id || data.groupId;
  } catch (error) {
    throw new Error('Impossible de récupérer votre groupe pour ce projet');
  }
};

/**
 * Soumet un livrable (archive ou lien Git)
 */

export const submitDeliverable = async (
  deliverableId: string,
  submissionData: SubmitDeliverableData,
  projectId: string
): Promise<{ submission: any; validation: ValidationResult }> => {
  try {
    const formData = new FormData();

    // Récupérer le groupe ID de l'utilisateur connecté
    const groupId = await getCurrentUserGroupId(projectId);
    formData.append('groupId', groupId);

    if (submissionData.type === 'archive' && submissionData.file) {
      formData.append('file', submissionData.file);
      formData.append('type', 'archive');

      const fileName = submissionData.fileName || submissionData.file.name;
      formData.append('fileName', fileName);
      formData.append('fileSize', submissionData.file.size.toString());

    } else if (submissionData.type === 'git' && submissionData.gitUrl) {
      formData.append('gitUrl', submissionData.gitUrl);
      formData.append('type', 'git');

    } else {
      throw new Error('Données de soumission invalides: fichier ou URL Git manquant');
    }

    const response = await fetch(`${API_URL}/deliverables/${deliverableId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
        // Ne pas ajouter Content-Type pour FormData
      },
      body: formData
    });

    const result = await handleApiResponse(response);

    return result;

  } catch (error) {
    throw error;
  }
};

/**
 * Télécharge un fichier de soumission depuis Firebase
 */
export const downloadSubmissionFile = async (submissionId: string, fileName: string): Promise<void> => {
  try {
    const url = `${API_URL}/deliverables/submissions/${submissionId}/download`;
    const headers = getAuthHeaders();

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur réseau' }));
      throw new Error(errorData.message || 'Erreur lors du téléchargement du fichier');
    }

    // Récupérer le blob
    const blob = await response.blob();

    // Vérifier si le blob est valide
    if (blob.size === 0) {
      throw new Error('Le fichier téléchargé est vide');
    }

    // Créer un lien de téléchargement
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || 'fichier-livrable';
    document.body.appendChild(link);
    link.click();

    // Nettoye
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

  } catch (error) {
    throw error;
  }
};

/**
 * Supprime une soumission de livrable
 */
export const deleteSubmission = async (submissionId: string): Promise<void> => {
  try {

    const url = `${API_URL}/deliverables/submissions/${submissionId}`;
    const headers = getAuthHeaders();

    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la suppression');
    }

  } catch (error) {
    throw error;
  }
};
