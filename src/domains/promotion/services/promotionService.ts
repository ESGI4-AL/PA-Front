import { Promotion, PromotionWithStudents, CreatePromotionRequest, UpdatePromotionRequest, Student, StudentFilters } from '../models/promotionModels';
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

export const getPromotions = async (
  filters: { year?: string; search?: string; page?: number; limit?: number } = {}
): Promise<{ promotions: Promotion[]; totalPages: number; currentPage: number }> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.year) queryParams.append('year', filters.year);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const response = await fetch(`${API_URL}/promotions?${queryParams.toString()}`, {
      headers: {
        ...getAuthHeaders()
      }
    });

    const data = await handleApiResponse(response);
    return {
      promotions: data.promotions,
      totalPages: data.totalPages,
      currentPage: data.currentPage
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des promotions:', error);
    throw error;
  }
};

export const getPromotionById = async (id: string): Promise<Promotion> => {
  try {
    const response = await fetch(`${API_URL}/promotions/${id}`, {
      headers: {
        ...getAuthHeaders()
      }
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la promotion avec l'ID ${id}:`, error);
    throw error;
  }
};

export const createPromotion = async (promotion: CreatePromotionRequest): Promise<Promotion> => {
  try {
    const response = await fetch(`${API_URL}/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(promotion)
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error('Erreur lors de la création de la promotion:', error);
    throw error;
  }
};

export const updatePromotion = async (id: string, promotion: UpdatePromotionRequest): Promise<Promotion> => {
  try {
    const response = await fetch(`${API_URL}/promotions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(promotion)
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la promotion avec l'ID ${id}:`, error);
    throw error;
  }
};

export const deletePromotion = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/promotions/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });

    if (!response.ok) {
      await handleApiResponse(response);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression de la promotion avec l'ID ${id}:`, error);
    throw error;
  }
};

export const getPromotionStudents = async (id: string, filters: StudentFilters = {}): Promise<Student[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    queryParams.append('_', Date.now().toString());

    const url = `${API_URL}/promotions/${id}/students${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders()
      }
    });

    const data = await handleApiResponse(response);

    return data.students || [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des étudiants pour la promotion avec l'ID ${id}:`, error);
    throw error;
  }
};

export const addStudentToPromotion = async (promotionId: string, student: { firstName: string; lastName: string; email: string }): Promise<Student> => {
  try {
    const response = await fetch(`${API_URL}/promotions/${promotionId}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(student)
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un étudiant à la promotion:', error);
    throw error;
  }
};

export const importStudentsToPromotion = async (promotionId: string, file: File): Promise<Student[]> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/promotions/${promotionId}/students/import`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders()
      },
      body: formData
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error('Erreur lors de l\'importation des étudiants:', error);
    throw error;
  }
};

export const updateStudentInPromotion = async (promotionId: string, studentId: string, student: { firstName: string; lastName: string; email: string }): Promise<Student> => {
  try {
    const response = await fetch(`${API_URL}/promotions/${promotionId}/students/${studentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(student)
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error('Erreur lors de la modification d\'un étudiant:', error);
    throw error;
  }
};

export const removeStudentFromPromotion = async (promotionId: string, studentId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/promotions/${promotionId}/students/${studentId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });

    if (!response.ok) {
      await handleApiResponse(response);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression d\'un étudiant de la promotion:', error);
    throw error;
  }
};

export const getMyPromotion = async (): Promise<PromotionWithStudents> => {
  try {
    const response = await fetch(`${API_URL}/promotions/my-promotion`, {
      headers: {
        ...getAuthHeaders()
      }
    });

    return handleApiResponse(response);
  } catch (error) {
    console.error('Erreur lors de la récupération de ma promotion:', error);
    throw error;
  }
};
