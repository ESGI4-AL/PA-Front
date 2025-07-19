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
    console.log('📥 Récupération des livrables pour le projet:', projectId);

    const url = `${API_URL}/projects/${projectId}/deliverables`;
    const headers = getAuthHeaders();    console.log('🌐 URL appelée:', url);
    console.log('🔑 Headers utilisés:', headers);

    const response = await fetch(url, { headers });
    const deliverables = await handleApiResponse(response);

    console.log('📋 Livrables récupérés:', deliverables.length);
    console.log('🔍 Structure complète des livrables récupérés:', JSON.stringify(deliverables, null, 2));

    // Compteurs pour l'analyse Firebase
    let firebaseSubmissionsCount = 0;
    let totalSubmissionsCount = 0;

    // Traitement côté client pour ajouter les propriétés calculées
    const processedDeliverables = deliverables.map((deliverable: any, index: number) => {
      console.log(`🔍 Traitement livrable ${index + 1}/${deliverables.length} - "${deliverable.name}":`, {
        id: deliverable.id,
        hasSubmission: !!deliverable.submission,
        hasSubmissions: !!deliverable.submissions, // ✅ CORRECTION: submissions avec 's' minuscule
        submissionsLength: deliverable.submissions?.length || 0,
        submissionKeys: deliverable.submission ? Object.keys(deliverable.submission) : [],
        submissionsKeys: deliverable.submissions ? deliverable.submissions.map((s: any) => Object.keys(s)) : []
      });

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

        console.log(`📄 Soumission trouvée pour "${deliverable.name}":`, {
          id: submission.id,
          fileName: submission.fileName,
          fileSize: submission.fileSize ? `${(submission.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A',
          type: submission.type,
          validationStatus: submission.validationStatus,
          submissionDate: submission.submissionDate,
          isFirebaseStored,
          firebasePath: submission.filePath,
          gitUrl: submission.gitUrl
        });
      }

      return {
        ...deliverable,
        submission,
        isExpired,
        timeRemaining: timeRemaining > 0 ? timeRemaining : 0,
        canSubmit: !isExpired || deliverable.allowLateSubmission
      };
    });

    // Log global de l'analyse Firebase
    console.log('🔥 Analyse Firebase pour le projet:', {
      projectId,
      totalDeliverables: deliverables.length,
      totalSubmissions: totalSubmissionsCount,
      firebaseSubmissions: firebaseSubmissionsCount,
      syncPercentage: totalSubmissionsCount > 0 ? `${Math.round((firebaseSubmissionsCount / totalSubmissionsCount) * 100)}%` : '0%'
    });

    return processedDeliverables;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des livrables:', error);
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
    console.error('❌ Erreur lors de la récupération du livrable:', error);
    throw error;
  }
};

/**
 * Récupère le groupe de l'utilisateur pour un projet donné
 */
const getCurrentUserGroupId = async (projectId: string): Promise<string> => {
  try {
    console.log('🔍 Récupération du groupe pour le projet:', projectId);

    // Vérifier d'abord si l'utilisateur a un groupe dans le localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.groupId) {
      console.log('👥 Groupe trouvé dans localStorage:', user.groupId);
      return user.groupId;
    }

    // Sinon, récupérer depuis l'API
    const response = await fetch(`${API_URL}/groups/project/${projectId}/user-group`, {
      headers: getAuthHeaders()
    });
    const data = await handleApiResponse(response);

    console.log('👥 Groupe récupéré depuis API:', data);
    return data.id || data.groupId;
  } catch (error) {
    console.error('❌ Erreur récupération groupe:', error);
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
    console.log('🚀 Début soumission livrable:', {
      deliverableId,
      projectId,
      type: submissionData.type,
      hasFile: !!submissionData.file,
      hasGitUrl: !!submissionData.gitUrl,
      customFileName: submissionData.fileName
    });

    const formData = new FormData();

    // Récupérer le groupe ID de l'utilisateur connecté
    const groupId = await getCurrentUserGroupId(projectId);
    formData.append('groupId', groupId);

    console.log('👥 Groupe ID utilisé:', groupId);

    if (submissionData.type === 'archive' && submissionData.file) {
      console.log('📁 Ajout fichier à FormData:', {
        name: submissionData.file.name,
        customName: submissionData.fileName,
        size: `${(submissionData.file.size / 1024 / 1024).toFixed(2)} MB`,
        type: submissionData.file.type
      });

      formData.append('file', submissionData.file);
      formData.append('type', 'archive');

      const fileName = submissionData.fileName || submissionData.file.name;
      formData.append('fileName', fileName);
      formData.append('fileSize', submissionData.file.size.toString());

    } else if (submissionData.type === 'git' && submissionData.gitUrl) {
      console.log('🔗 Ajout URL Git à FormData:', submissionData.gitUrl);

      formData.append('gitUrl', submissionData.gitUrl);
      formData.append('type', 'git');

    } else {
      throw new Error('Données de soumission invalides: fichier ou URL Git manquant');
    }

    console.log('📤 Envoi vers API...');

    const response = await fetch(`${API_URL}/deliverables/${deliverableId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
        // Ne pas ajouter Content-Type pour FormData
      },
      body: formData
    });

    const result = await handleApiResponse(response);

    console.log('✅ Soumission réussie:', {
      submissionId: result.submission?.id,
      validationStatus: result.submission?.validationStatus,
      fileName: result.submission?.fileName,
      fileSize: result.submission?.fileSize
    });

    return result;

  } catch (error) {
    console.error('❌ Erreur lors de la soumission du livrable:', error);
    throw error;
  }
};

/**
 * Télécharge un fichier de soumission depuis Firebase
 */
export const downloadSubmissionFile = async (submissionId: string, fileName: string): Promise<void> => {
  try {
    console.log('📥 Téléchargement du fichier de soumission:', { submissionId, fileName });

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

    // Nettoyer
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    console.log('✅ Fichier téléchargé avec succès:', fileName);
  } catch (error) {
    console.error('❌ Erreur lors du téléchargement:', error);
    throw error;
  }
};

/**
 * Supprime une soumission de livrable
 */
export const deleteSubmission = async (submissionId: string): Promise<void> => {
  try {
    console.log('🗑️ Suppression de la soumission:', submissionId);

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

    console.log('✅ Soumission supprimée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    throw error;
  }
};
