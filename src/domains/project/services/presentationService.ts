// domains/project/services/presentationService.ts

import { PresentationSchedule } from '../models/presentationModels';
import { getAuthToken } from '../../user/services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Vous devez être connecté pour effectuer cette action');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const handleApiResponse = async (response: Response) => {
  let data;
  
  try {
    const textResponse = await response.text();
    data = JSON.parse(textResponse);
  } catch (error) {
    throw new Error('Réponse invalide du serveur');
  }
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
    }
    
    throw new Error(data.message || `Erreur ${response.status}: ${response.statusText}`);
  }
  
  return data.data || data;
};

/**
 * Récupère le planning des soutenances pour un projet
 */
export const getPresentationSchedule = async (projectId: string): Promise<PresentationSchedule[]> => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/presentations`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    return await handleApiResponse(response);
  } catch (error) {
    throw error;
  }
};

/**
 * Crée un nouveau planning de soutenances pour un projet
 */
export const createPresentationSchedule = async (
  projectId: string, 
  scheduleData: {
    startTime: string;
    duration?: number;
    endTime?: string;
  }
): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/presentations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(scheduleData)
    });
    
    return await handleApiResponse(response);
  } catch (error) {
    throw error;
  }
};

/**
 * Réorganise l'ordre des passages des groupes pour les soutenances
 */
export const reorderPresentationSchedule = async (
  projectId: string, 
  groupOrder: string[]
): Promise<PresentationSchedule[]> => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/presentations/reorder`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ groupOrder })
    });
    
    return await handleApiResponse(response);
  } catch (error) {
    throw error;
  }
};

/**
 * Génère un PDF avec le planning des soutenances
 */
export const generateSchedulePDF = async (projectId: string): Promise<Blob> => {
  try {
    // Première requête pour obtenir l'URL du PDF
    const response = await fetch(`${API_URL}/projects/${projectId}/presentations/pdf`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la génération du PDF');
    }
    
    const result = await response.json();
    
    if (result.data && result.data.fileUrl) {
      const fileResponse = await fetch(result.data.fileUrl, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!fileResponse.ok) {
        throw new Error('Erreur lors du téléchargement du fichier PDF');
      }
      
      return await fileResponse.blob();
    } else {
      throw new Error('URL du fichier PDF non trouvée dans la réponse');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Génère un PDF avec la liste d'émargement
 */
export const generateAttendanceSheetPDF = async (
  projectId: string, 
  sortBy: 'group' | 'alphabetical' = 'group'
): Promise<Blob> => {
  try {
    const url = new URL(`${API_URL}/projects/${projectId}/presentations/attendance-sheet`);
    url.searchParams.append('sortBy', sortBy);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la génération de la liste d\'émargement');
    }
    
    const result = await response.json();
    
    if (result.data && result.data.fileUrl) {
      const fileResponse = await fetch(result.data.fileUrl, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!fileResponse.ok) {
        throw new Error('Erreur lors du téléchargement du fichier PDF');
      }
      
      return await fileResponse.blob();
    } else {
      throw new Error('URL du fichier PDF non trouvée dans la réponse');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Modifie le planning des soutenances d'un projet
 */
export const updatePresentationSchedule = async (
  projectId: string,
  scheduleData: {
    startTime: string;
    duration?: number;
    endTime?: string;
  }
): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}/presentations`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(scheduleData)
    });
    
    return await handleApiResponse(response);
  } catch (error) {
    throw error;
  }
};

/**
 * Supprime le planning des soutenances d'un projet
 */
export const deletePresentationSchedule = async (projectId: string): Promise<void> => {
  try {
    
    const response = await fetch(`${API_URL}/projects/${projectId}/presentations`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (response.status === 404) {
      throw new Error('La fonctionnalité de suppression n\'est pas encore implémentée dans le backend');
    }
    
    if (!response.ok) {
   
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression du planning');
      } catch (jsonError) {
        throw new Error('Route de suppression non trouvée. Veuillez ajouter la route DELETE dans votre backend.');
      }
    }
  } catch (error) {
    throw error;
  }
};