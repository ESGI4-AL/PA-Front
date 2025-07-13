import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getProjectDeliverables,
  submitDeliverable,
  downloadSubmissionFile,
  deleteSubmission
} from '@/domains/project/services/deliverableService';
import {
  StudentDeliverableView,
  SubmitDeliverableData,
  ValidationResult
} from '@/domains/project/models/deliverableModels';

interface UseStudentDeliverablesReturn {
  deliverables: StudentDeliverableView[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  uploadProgress: number;
  refetch: () => Promise<void>;
  submitDeliverable: (deliverableId: string, submissionData: SubmitDeliverableData) => Promise<{ success: boolean; validation?: ValidationResult; message?: string }>;
  downloadSubmission: (submissionId: string, fileName: string) => Promise<void>;
  deleteSubmissionById: (submissionId: string) => Promise<void>;
}

export const useStudentDeliverables = (projectId: string): UseStudentDeliverablesReturn => {
  const [deliverables, setDeliverables] = useState<StudentDeliverableView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchDeliverables = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectDeliverables(projectId);
      setDeliverables(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const submitDeliverableHandler = async (
    deliverableId: string,
    submissionData: SubmitDeliverableData
  ): Promise<{ success: boolean; validation?: ValidationResult; message?: string }> => {
    setSubmitting(true);
    setUploadProgress(0);
    setError(null);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const result = await submitDeliverable(deliverableId, submissionData, projectId);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // délai pour laisser le temps à la base de données de se synchroniser
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Actualiser immédiatement les données pour mettre à jour les compteurs
      await fetchDeliverables();

      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);

      return {
        success: true,
        validation: result.validation,
        message: 'Livrable soumis avec succès sur Firebase Storage !'
      };
    } catch (err) {
      clearInterval(progressInterval);
      setUploadProgress(0);

      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la soumission';
      setError(errorMessage);

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setSubmitting(false);
    }
  };

  const downloadSubmissionHandler = async (submissionId: string, fileName: string): Promise<void> => {
    try {
      await downloadSubmissionFile(submissionId, fileName);
      toast.success(`Fichier "${fileName}" téléchargé avec succès !`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du téléchargement';
      toast.error(errorMessage);
      throw error;
    }
  };

  const deleteSubmissionHandler = async (submissionId: string): Promise<void> => {
    try {
      await deleteSubmission(submissionId);
      toast.success('Soumission supprimée avec succès !');

      await fetchDeliverables();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      toast.error(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    fetchDeliverables();
  }, [fetchDeliverables]);

  return {
    deliverables,
    loading,
    error,
    submitting,
    uploadProgress,
    refetch: fetchDeliverables,
    submitDeliverable: submitDeliverableHandler,
    downloadSubmission: downloadSubmissionHandler,
    deleteSubmissionById: deleteSubmissionHandler
  };
};
