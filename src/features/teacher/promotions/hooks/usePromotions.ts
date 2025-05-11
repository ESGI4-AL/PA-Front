import { useState, useEffect, useCallback } from 'react';
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionById,
  getPromotionStudents,
  addStudentToPromotion,
  importStudentsToPromotion,
  removeStudentFromPromotion,
  updateStudentInPromotion
} from '@/domains/promotion/services/promotionService';
import {
  Promotion,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  Student,
  StudentFilters
} from '@/domains/promotion/models/promotionModels';

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPromotions();
      setPromotions(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des promotions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPromotionById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const promotion = await getPromotionById(id);
      setCurrentPromotion(promotion);
      setError(null);
      return promotion;
    } catch (err) {
      setError('Erreur lors du chargement de la promotion');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPromotionDetails = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await getPromotionById(id);
      setCurrentPromotion(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des détails de la promotion');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async (promotionId: string, filters: StudentFilters = {}) => {
    setLoading(true);
    try {
      const studentsArray = await getPromotionStudents(promotionId, filters);
      setStudents(studentsArray);
      setError(null);
      return studentsArray;
    } catch (err) {
      setError('Erreur lors du chargement des étudiants');
      console.error(err);
      setStudents([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addPromotion = useCallback(async (promotionData: CreatePromotionRequest) => {
    setLoading(true);
    try {
      const newPromotion = await createPromotion(promotionData);

      setPromotions(prev => {
        if (!Array.isArray(prev)) {
          return [newPromotion];
        }
        return [...prev, newPromotion];
      });

      setError(null);
      return newPromotion;
    } catch (err) {
      setError('Erreur lors de la création de la promotion');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const editPromotion = useCallback(async (id: string, promotionData: UpdatePromotionRequest) => {
    setLoading(true);
    try {
      const updatedPromotion = await updatePromotion(id, promotionData);

      setPromotions(prev => {
        if (!Array.isArray(prev)) {
          return [updatedPromotion];
        }
        return prev.map(p => p.id === id ? updatedPromotion : p);
      });

      if (currentPromotion?.id === id) {
        setCurrentPromotion(updatedPromotion);
      }

      setError(null);
      return updatedPromotion;
    } catch (err) {
      setError('Erreur lors de la mise à jour de la promotion');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPromotion]);

  const removePromotion = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await deletePromotion(id);

      setPromotions(prev => {
        if (!Array.isArray(prev)) {
          return [];
        }
        return prev.filter(p => p.id !== id);
      });

      setError(null);
    } catch (err) {
      setError('Erreur lors de la suppression de la promotion');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addStudent = useCallback(async (promotionId: string, studentData: { firstName: string; lastName: string; email: string }) => {
    setLoading(true);
    try {
      const newStudent = await addStudentToPromotion(promotionId, studentData);

      setStudents(prev => {
        if (!Array.isArray(prev)) {
          return [newStudent];
        }
        return [...prev, newStudent];
      });

      setError(null);
      return newStudent;
    } catch (err) {
      setError('Erreur lors de l\'ajout de l\'étudiant');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const importStudents = useCallback(async (promotionId: string, file: File) => {
    setLoading(true);
    try {
      const newStudents = await importStudentsToPromotion(promotionId, file);

      setStudents(prev => {
        if (!Array.isArray(prev)) {
          return newStudents;
        }
        return [...prev, ...newStudents];
      });

      setError(null);
      return newStudents;
    } catch (err) {
      setError('Erreur lors de l\'importation des étudiants');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStudent = useCallback(async (promotionId: string, studentId: string, studentData: { firstName: string; lastName: string; email: string }) => {
    setLoading(true);
    try {
      const updatedStudent = await updateStudentInPromotion(promotionId, studentId, studentData);

      setStudents(prev => {
        if (!Array.isArray(prev)) {
          return [updatedStudent];
        }
        return prev.map(s => s.id === studentId ? updatedStudent : s);
      });

      setError(null);
      return updatedStudent;
    } catch (err) {
      setError('Erreur lors de la modification de l\'étudiant');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeStudent = useCallback(async (promotionId: string, studentId: string) => {
    setLoading(true);
    try {
      await removeStudentFromPromotion(promotionId, studentId);

      setStudents(prev => {
        if (!Array.isArray(prev)) {
          return [];
        }
        return prev.filter(s => s.id !== studentId);
      });

      setError(null);
    } catch (err) {
      setError('Erreur lors de la suppression de l\'étudiant');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  return {
    promotions,
    loading,
    error,
    currentPromotion,
    students,
    fetchPromotions,
    fetchPromotionById,
    fetchPromotionDetails,
    fetchStudents,
    addPromotion,
    editPromotion,
    removePromotion,
    addStudent,
    importStudents,
    updateStudent,
    removeStudent
  };
};
