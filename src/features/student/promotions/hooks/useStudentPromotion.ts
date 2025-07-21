import { useState, useEffect, useCallback } from 'react';
import { getMyPromotion } from '@/domains/promotion/services/promotionService';
import { PromotionWithStudents, Student } from '@/domains/promotion/models/promotionModels';

export const useStudentPromotion = () => {
  const [promotion, setPromotion] = useState<PromotionWithStudents | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyPromotion = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyPromotion();
      setPromotion(data);

      if (data?.students) {
        setStudents(data.students);
      } else {
        setStudents([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de la promotion';
      setError(errorMessage);
      console.error('Erreur lors du chargement de la promotion:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchMyPromotion();
  }, [fetchMyPromotion]);

  return {
    promotion,
    students,
    loading,
    error,
    fetchMyPromotion,
    clearError
  };
};
