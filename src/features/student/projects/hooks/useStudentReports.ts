import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Group {
  id: string;
  name: string;
  members: Student[];
}

interface Report {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'published';
  projectId: string;
  groupId: string;
  group: Group;
  lastEditedBy?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportSection {
  id: string;
  title: string;
  content: string;
  contentType: 'html' | 'markdown' | 'plain';
  order: number;
  reportId: string;
  lastEditedBy?: string;
  isVisible: boolean;
  sectionType: 'text' | 'image' | 'table' | 'code' | 'mixed';
  createdAt: string;
  updatedAt: string;
}

interface CreateReportData {
  title: string;
  description?: string;
}

interface CreateSectionData {
  title: string;
  content?: string;
  contentType?: 'html' | 'markdown' | 'plain';
  sectionType?: 'text' | 'image' | 'table' | 'code' | 'mixed';
}

interface UpdateSectionData {
  title?: string;
  content?: string;
  contentType?: 'html' | 'markdown' | 'plain';
}

const extractArrayFromResponse = (response: any, dataType: string): any[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (!response) {
    return [];
  }

  if (typeof response === 'object') {
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }

    if (response.data && typeof response.data === 'object') {
      if (dataType === 'sections' && Array.isArray(response.data.sections)) {
        return response.data.sections;
      }

      if (dataType === 'reports' && Array.isArray(response.data.reports)) {
        return response.data.reports;
      }
    }

    const possibleKeys = ['items', 'results', 'content', dataType];
    for (const key of possibleKeys) {
      if (Array.isArray(response[key])) {
        return response[key];
      }
    }
  }

  return [];
};

export const useStudentReports = (projectId: string) => {
  const [report, setReport] = useState<Report | null>(null);
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [userGroupId, setUserGroupId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [forceUpdate, setForceUpdate] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Timer pour l'auto-save
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  });

  const fetchUserGroupId = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/groups/project/${projectId}/user-group`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          setUserGroupId(null);
          return null;
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const groupData = result.data || result;

      if (groupData && groupData.id) {
        setUserGroupId(groupData.id);
        return groupData.id;
      }

      setUserGroupId(null);
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du groupe utilisateur:', error);
      setUserGroupId(null);
      return null;
    }
  }, [projectId, API_BASE_URL]);

  const fetchReport = useCallback(async (groupId?: string) => {
    const currentGroupId = groupId || userGroupId;

    if (!currentGroupId) {
      setReport(null);
      setSections([]);
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reports/projects/${projectId}/groups/${currentGroupId}`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          setReport(null);
          setSections([]);
          return null;
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const reportData = result.data || result;

      setReport(reportData);

      if (reportData.sections && Array.isArray(reportData.sections)) {
        const sortedSections = reportData.sections.sort((a: ReportSection, b: ReportSection) => a.order - b.order);
        setSections(sortedSections);
      }

      return reportData;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        setReport(null);
        setSections([]);
        return null;
      }
      throw error;
    }
  }, [projectId, userGroupId, API_BASE_URL]);

  const fetchSections = useCallback(async (reportId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}/sections`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const sectionsData = extractArrayFromResponse(result, 'sections');

      const sortedSections = sectionsData.sort((a, b) => a.order - b.order);
      setSections(sortedSections);
      return sortedSections;
    } catch (error) {
      setSections([]);
      throw error;
    }
  }, [API_BASE_URL]);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const groupId = await fetchUserGroupId();

      if (!groupId) {
        setReport(null);
        setSections([]);
        setLoading(false);
        return;
      }

      const reportData = await fetchReport(groupId);

      if (reportData?.id && (!reportData.sections || reportData.sections.length === 0)) {
        await fetchSections(reportData.id);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchUserGroupId, fetchReport, fetchSections]);

  const createReport = useCallback(async (reportData: CreateReportData) => {
    if (!userGroupId) {
      throw new Error('Vous devez être assigné à un groupe pour créer un rapport');
    }

    try {
      setCreating(true);

      const response = await fetch(`${API_BASE_URL}/reports/projects/${projectId}/groups/${userGroupId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}
        throw new Error(errorData?.message || 'Erreur lors de la création du rapport');
      }

      const result = await response.json();
      const newReport = result.data || result;

      setReport(newReport);
      setSections(newReport.sections || []);
      toast.success('Rapport créé avec succès');

      return newReport;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du rapport';
      toast.error(errorMessage);
      throw error;
    } finally {
      setCreating(false);
    }
  }, [projectId, userGroupId, API_BASE_URL]);

const updateReport = useCallback(async (reportData: Partial<Report>) => {
  if (!report?.id) return;

  const isStatusUpdate = reportData.status !== undefined;
  const isContentUpdate = reportData.title !== undefined || reportData.description !== undefined;

  if (report.status !== 'draft' && isContentUpdate && !isStatusUpdate) {
    throw new Error('Impossible de modifier le contenu d\'un rapport déjà soumis');
  }

  try {
    setUpdating(true);

    const response = await fetch(`${API_BASE_URL}/reports/${report.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(reportData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {}
      throw new Error(errorData?.message || 'Erreur lors de la mise à jour du rapport');
    }

    const result = await response.json();
    const updatedReport = result.data || result;

    setReport(updatedReport);

    setForceUpdate(prev => prev + 1);

    return updatedReport;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du rapport';
    toast.error(errorMessage);
    throw error;
  } finally {
    setUpdating(false);
  }
}, [report, API_BASE_URL]);
  const addSection = useCallback(async (sectionData: CreateSectionData) => {
    if (!report?.id) {
      throw new Error('Aucun rapport actif');
    }

    if (report.status !== 'draft') {
      throw new Error('Impossible d\'ajouter une section à un rapport déjà soumis');
    }

    try {
      setCreating(true);

      const response = await fetch(`${API_BASE_URL}/reports/${report.id}/sections`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...sectionData,
          order: sections.length
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}
        throw new Error(errorData?.message || 'Erreur lors de la création de la section');
      }

      const result = await response.json();
      const newSection = result.data || result;

      setSections(prev => [...prev, newSection].sort((a, b) => a.order - b.order));

      return newSection;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de la section';
      toast.error(errorMessage);
      throw error;
    } finally {
      setCreating(false);
    }
  }, [report, sections.length, API_BASE_URL]);

  const updateSection = useCallback(async (sectionId: string, sectionData: UpdateSectionData, immediate = false) => {
    if (report?.status !== 'draft') {
      throw new Error('Impossible de modifier une section d\'un rapport déjà soumis');
    }

    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? { ...section, ...sectionData, updatedAt: new Date().toISOString() }
        : section
    ));

    const saveSection = async () => {
      try {
        setAutoSaveStatus('saving');

        const response = await fetch(`${API_BASE_URL}/reports/sections/${sectionId}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(sectionData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {}
          throw new Error(errorData?.message || 'Erreur lors de la mise à jour de la section');
        }

        const result = await response.json();
        const updatedSection = result.data || result;

        setSections(prev => prev.map(section =>
          section.id === sectionId ? updatedSection : section
        ));

        setAutoSaveStatus('saved');
        setLastSaved(new Date());

      } catch (error) {
        console.error('Erreur auto-save:', error);
        setAutoSaveStatus('error');
        setError(error instanceof Error ? error.message : 'Erreur de sauvegarde');

        setSections(prev => prev.map(section =>
          section.id === sectionId ? { ...section, ...sectionData } : section
        ));
      }
    };

    if (immediate) {
      await saveSection();
    } else {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }

      setAutoSaveStatus('saving');

      const timer = setTimeout(saveSection, 2000);
      setAutoSaveTimer(timer);
    }
  }, [autoSaveTimer, report, API_BASE_URL]);

  const deleteSection = useCallback(async (sectionId: string) => {
    if (!report?.id) return;

    if (report.status !== 'draft') {
      throw new Error('Impossible de supprimer une section d\'un rapport déjà soumis');
    }

    try {
      setUpdating(true);

      const response = await fetch(`${API_BASE_URL}/reports/sections/${sectionId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}
        throw new Error(errorData?.message || 'Erreur lors de la suppression de la section');
      }

      setSections(prev => prev.filter(section => section.id !== sectionId));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression de la section';
      toast.error(errorMessage);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [report, API_BASE_URL]);

  const reorderSections = useCallback(async (newSections: ReportSection[]) => {
    if (!report?.id) return;

    if (report.status !== 'draft') {
      throw new Error('Impossible de réorganiser les sections d\'un rapport déjà soumis');
    }

    try {
      setUpdating(true);

      const sectionIds = newSections.map(s => s.id);

      const response = await fetch(`${API_BASE_URL}/reports/${report.id}/sections/reorder`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ sectionIds })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}
        throw new Error(errorData?.message || 'Erreur lors de la réorganisation des sections');
      }

      const updatedSections = newSections.map((section, index) => ({
        ...section,
        order: index
      }));

      setSections(updatedSections);
      toast.success('Sections réorganisées avec succès');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la réorganisation des sections';
      toast.error(errorMessage);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [report, API_BASE_URL]);

  const submitReport = useCallback(async () => {
    if (!report?.id) return;

    if (report.status !== 'draft') {
      throw new Error('Ce rapport a déjà été soumis');
    }

    if (sections.length === 0) {
      throw new Error('Impossible de soumettre un rapport vide');
    }

    const emptySections = sections.filter(section => !section.content || section.content.trim() === '');
    if (emptySections.length > 0) {
      const sectionTitles = emptySections.map(s => s.title).join(', ');
      throw new Error(`Les sections suivantes sont vides : ${sectionTitles}`);
    }

    try {
      setUpdating(true);

      const response = await fetch(`${API_BASE_URL}/reports/${report.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          status: 'submitted',
          submittedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}
        throw new Error(errorData?.message || 'Erreur lors de la soumission du rapport');
      }

      const result = await response.json();
      const updatedReport = result.data || result;

      setReport(updatedReport);

      await fetchAllData();

      setForceUpdate(prev => prev + 1);

      toast.success('Rapport soumis avec succès ! Il ne peut plus être modifié.');
      return updatedReport;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la soumission du rapport';
      toast.error(errorMessage);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [report, sections, API_BASE_URL, fetchAllData]);

  const saveManually = useCallback(async () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      setAutoSaveTimer(null);
    }

    setAutoSaveStatus('saving');
    try {
      if (report?.id) {
        await updateReport({ updatedAt: new Date().toISOString() });
      }
      setAutoSaveStatus('saved');
      setLastSaved(new Date());
      toast.success('Sauvegarde manuelle effectuée');
    } catch (err) {
      console.error('Erreur sauvegarde manuelle:', err);
      setAutoSaveStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Erreur de sauvegarde';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [autoSaveTimer, report?.id, updateReport]);

  const canEditReport = useCallback(() => {
    if (!report) return false;
    if (!userGroupId) return false;
    if (report.status === 'published' || report.status === 'reviewed' || report.status === 'submitted') return false;
    return true;
  }, [report, userGroupId, forceUpdate]);

  const canSubmitReport = useCallback(() => {
    if (!report) return false;
    if (report.status !== 'draft') return false;
    if (sections.length === 0) return false;
    return sections.every(section => section.content && section.content.trim() !== '');
  }, [report, sections, forceUpdate]);

  const canCreateReport = useCallback(() => {
    return userGroupId !== null && report === null;
  }, [userGroupId, report, forceUpdate]);

  const isReportEditable = useCallback(() => {
    return report?.status === 'draft';
  }, [report?.status, forceUpdate]);

  const isReportSubmitted = useCallback(() => {
    return report?.status === 'submitted' || report?.status === 'reviewed' || report?.status === 'published';
  }, [report?.status, forceUpdate]);

  const hasUnsavedChanges = useCallback(() => {
    return autoSaveStatus === 'saving';
  }, [autoSaveStatus, forceUpdate]);

  const isNewReport = useCallback(() => {
    return !report?.id;
  }, [report?.id, forceUpdate]);

  const refreshData = useCallback(() => {
    return fetchAllData();
  }, [fetchAllData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const stats = {
    totalSections: sections.length,
    totalWords: sections.reduce((sum, section) => {
      const text = section.content.replace(/<[^>]*>/g, ''); // Enlever HTML
      return sum + text.split(/\s+/).filter(word => word.length > 0).length;
    }, 0),
    totalCharacters: sections.reduce((sum, section) => sum + section.content.length, 0),
    lastModified: sections.length > 0
      ? new Date(Math.max(...sections.map(s => new Date(s.updatedAt).getTime())))
      : null,
    status: report?.status || 'none',
    completedSections: sections.filter(s => s.content && s.content.trim() !== '').length,
    emptySections: sections.filter(s => !s.content || s.content.trim() === '').length
  };

  useEffect(() => {
    if (projectId && projectId !== 'undefined') {
      fetchAllData();
    } else {
      setLoading(false);
      setError('ID du projet invalide');
    }
  }, [projectId, fetchAllData]);

  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  return {
    report,
    sections,
    userGroupId,
    loading,
    creating,
    updating,
    autoSaveStatus,
    lastSaved,
    error,
    stats,

    createReport,
    updateReport,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
    submitReport,
    saveManually,
    refreshData,
    clearError,

    canEditReport,
    canSubmitReport,
    canCreateReport,

    hasUnsavedChanges: hasUnsavedChanges(),
    isNewReport: isNewReport(),
    isReportEditable: isReportEditable(),
    isReportSubmitted: isReportSubmitted()
  };
};
