import { Project, CreateProjectData, UpdateProjectData, ProjectStatus } from '../models/projectModels';
import { getAuthToken } from '../../user/services/authService';

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

    throw new Error(data.message || 'Une erreur est survenue');
  }

  return data.data;
};

export const getAllProjects = async (
  filters: {
    teacherId?: string;
    promotionId?: string;
    status?: ProjectStatus;
    search?: string;
    page?: number;
    limit?: number
  } = {}
): Promise<{ projects: Project[]; totalPages: number; currentPage: number }> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.teacherId) queryParams.append('teacherId', filters.teacherId);
    if (filters.promotionId) queryParams.append('promotionId', filters.promotionId);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const response = await fetch(`${API_URL}/projects?${queryParams.toString()}`, {
      headers: {
        ...getAuthHeaders()
      }
    });

    const data = await handleApiResponse(response);
    return {
      projects: data.projects || data, // Handle different response structures
      totalPages: data.totalPages || 1,
      currentPage: data.currentPage || 1
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    throw error;
  }
};

export const getProjectById = async (id: string): Promise<Project> => {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      headers: {
        ...getAuthHeaders()
      }
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error(`Erreur lors de la récupération du projet avec l'ID ${id}:`, error);
    throw error;
  }
};

export const createProject = async (project: CreateProjectData): Promise<Project> => {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(project)
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error);
    throw error;
  }
};

export const updateProject = async (id: string, project: UpdateProjectData): Promise<Project> => {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(project)
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du projet avec l'ID ${id}:`, error);
    throw error;
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });

    if (!response.ok) {
      await handleApiResponse(response);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression du projet avec l'ID ${id}:`, error);
    throw error;
  }
};
