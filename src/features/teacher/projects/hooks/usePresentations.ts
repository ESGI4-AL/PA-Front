// features/teacher/projects/hooks/usePresentations.ts

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PresentationSchedule } from '../../../../domains/project/models/presentationModels';
import * as presentationService from '../../../../domains/project/services/presentationService';

export const usePresentations = (projectId: string) => {
  const [schedules, setSchedules] = useState<PresentationSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await presentationService.getPresentationSchedule(projectId);
      setSchedules(data);
    } catch (err: any) {
      if (err.message && !err.message.includes('No presentation schedule found')) {
        setError(err.message || 'Erreur lors du chargement des soutenances');
        toast.error(err.message || 'Erreur lors du chargement des soutenances');
      }
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (scheduleData: {
    startTime: string;
    duration?: number;
    endTime?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const data = await presentationService.createPresentationSchedule(projectId, scheduleData);
      toast.success('Planning de soutenances créé avec succès');
      await fetchSchedules();
      return data;
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la création du planning';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderSchedule = async (groupOrder: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const data = await presentationService.reorderPresentationSchedule(projectId, groupOrder);
      setSchedules(data);
      toast.success('Ordre des soutenances mis à jour');
      return data;
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la réorganisation du planning';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = async (scheduleData: {
    startTime: string;
    duration?: number;
    endTime?: string;
  }) => {
    if (!projectId) {
      toast.error('ID du projet manquant');
      return;
    }

    if (schedules.length === 0) {
      toast.error('Aucun planning à modifier');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await presentationService.updatePresentationSchedule(projectId, scheduleData);
      toast.success('Planning de soutenances modifié avec succès');
      await fetchSchedules();
      return data;
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la modification du planning';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async () => {
    if (!projectId) {
      toast.error('ID du projet manquant');
      return;
    }

    if (schedules.length === 0) {
      toast.error('Aucun planning à supprimer');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await presentationService.deletePresentationSchedule(projectId);
      setSchedules([]);
      toast.success('Planning de soutenances supprimé avec succès');
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur lors de la suppression du planning';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadSchedulePDF = async () => {
    if (!projectId) {
      toast.error('ID du projet manquant');
      return;
    }

    if (schedules.length === 0) {
      toast.error('Aucun planning de soutenances trouvé à télécharger');
      return;
    }

    try {
      const blob = await presentationService.generateSchedulePDF(projectId);

      if (blob.size === 0) {
        toast.error('Le fichier PDF généré est vide');
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `planning_soutenances_${projectId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF du planning téléchargé');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la génération du PDF');
    }
  };

  const downloadAttendanceSheet = async (sortBy: 'group' | 'alphabetical' = 'group') => {
    if (!projectId) {
      toast.error('ID du projet manquant');
      return;
    }

    if (schedules.length === 0) {
      toast.error('Aucun planning de soutenances trouvé pour générer la liste d\'émargement');
      return;
    }

    try {
      const blob = await presentationService.generateAttendanceSheetPDF(projectId, sortBy);

      if (blob.size === 0) {
        toast.error('Le fichier PDF généré est vide');
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `liste_emargement_${sortBy}_${projectId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la génération de la liste d\'émargement');
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchSchedules();
    }
  }, [projectId]);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    reorderSchedule,
    deleteSchedule,
    downloadSchedulePDF,
    downloadAttendanceSheet
  };
};