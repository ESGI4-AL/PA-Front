import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface ReportSection {
  id: string;
  title: string;
  content: string;
  contentType: 'html' | 'markdown' | 'plain';
  contentMarkdown?: string;
  isRequired?: boolean;
  maxLength?: number;
  minLength?: number;
  order: number;
  isVisible?: boolean;
  allowedFormats?: string[];
  sectionType?: 'text' | 'image' | 'table' | 'code' | 'mixed';
  lastEditedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface GroupMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Group {
  id: string;
  name: string;
  members: GroupMember[];
}

interface Project {
  id: string;
  name: string;
  description: string;
}

interface Report {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'submitted' | 'reviewed' | 'published';
  isTemplate?: boolean;
  templateStructure?: any;
  lastEditedBy?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  project: Project;
  group: Group;
  sections: ReportSection[];
  projectId: string;
  groupId: string;
}

interface ReportNavigation {
  current: {
    index: number;
    total: number;
    report: Report;
  };
  previous: Report | null;
  next: Report | null;
  all: Array<{
    id: string;
    title: string;
    groupName: string;
    index: number;
    isCurrent: boolean;
  }>;
}

interface CreateReportData {
  title: string;
  description?: string;
  sections?: Array<{
    title: string;
    content?: string;
    contentType?: 'html' | 'markdown' | 'plain';
  }>;
}

interface UpdateReportData {
  title?: string;
  description?: string;
}

interface CreateSectionData {
  title: string;
  content?: string;
  contentType?: 'html' | 'markdown' | 'plain';
}

interface UpdateSectionData {
  title?: string;
  content?: string;
  contentType?: 'html' | 'markdown' | 'plain';
}

const extractDataFromResponse = (response: any, dataType: string): any => {
  console.log(`🔍 Extraction des données ${dataType}:`, response);
  
  if (Array.isArray(response) && dataType.includes('[]')) {
    console.log(`✅ ${dataType} déjà un tableau:`, response.length, 'éléments');
    return response;
  }
  
  if (!response) {
    console.log(`⚠️ ${dataType} null/undefined`);
    return dataType.includes('[]') ? [] : null;
  }
  
  if (typeof response === 'object') {
    if (response.data !== undefined) {
      console.log(`✅ ${dataType} trouvé dans response.data`);
      return response.data;
    }
    
    if (response.id && !dataType.includes('[]')) {
      console.log(`✅ ${dataType} semble être l'objet directement`);
      return response;
    }
  }
  
  console.warn(`❌ Format de réponse ${dataType} non reconnu:`, response);
  return dataType.includes('[]') ? [] : null;
};

export const useReports = (projectId?: string) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [navigation, setNavigation] = useState<ReportNavigation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  });


  const createReport = useCallback(async (
    projectId: string,
    groupId: string,
    reportData: CreateReportData
  ): Promise<Report> => {
    try {
      console.log('🆕 === DÉBUT CRÉATION RAPPORT ===');
      console.log('📝 Project ID:', projectId);
      console.log('📝 Group ID:', groupId);
      console.log('📝 Données:', reportData);
      
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/reports/projects/${projectId}/groups/${groupId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(reportData),
      });

      console.log('📡 Statut réponse:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}
        
        throw new Error(errorData?.message || 'Erreur lors de la création du rapport');
      }

      const result = await response.json();
      console.log('📡 Réponse succès:', result);
      
      const newReport = extractDataFromResponse(result, 'report');
      console.log('✅ Nouveau rapport créé:', newReport);

      if (projectId) {
        setReports(prev => [...prev, newReport]);
      }

      toast.success('Rapport créé avec succès');
      console.log('✅ === FIN CRÉATION RAPPORT (SUCCÈS) ===');
      return newReport;
      
    } catch (err) {
      console.error('❌ === ERREUR CRÉATION RAPPORT ===', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du rapport';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchReportById = useCallback(async (reportId: string): Promise<Report> => {
    try {
      console.log('🔍 === RÉCUPÉRATION RAPPORT PAR ID ===', reportId);
      
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
        headers: getHeaders()
      });

      console.log('📡 Statut réponse:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP:', errorText);
        
        if (response.status === 404) {
          throw new Error('Rapport non trouvé');
        } else if (response.status === 403) {
          throw new Error('Accès non autorisé à ce rapport');
        }
        
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📡 Réponse rapport:', result);
      
      const report = extractDataFromResponse(result, 'report');
      console.log('✅ Rapport récupéré:', report);
      
      setCurrentReport(report);
      return report;
      
    } catch (err) {
      console.error('❌ === ERREUR RÉCUPÉRATION RAPPORT ===', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du rapport';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchGroupReport = useCallback(async (
    projectId: string,
    groupId: string
  ): Promise<Report> => {
    try {
      console.log('🔍 === RÉCUPÉRATION RAPPORT GROUPE ===');
      console.log('📝 Project ID:', projectId);
      console.log('📝 Group ID:', groupId);
      
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/reports/projects/${projectId}/groups/${groupId}`, {
        headers: getHeaders()
      });

      console.log('📡 Statut réponse:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP:', errorText);
        
        if (response.status === 404) {
          throw new Error('Aucun rapport trouvé pour ce groupe');
        }
        
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📡 Réponse rapport groupe:', result);
      
      const report = extractDataFromResponse(result, 'report');
      console.log('✅ Rapport groupe récupéré:', report);
      
      setCurrentReport(report);
      return report;
      
    } catch (err) {
      console.error('❌ === ERREUR RÉCUPÉRATION RAPPORT GROUPE ===', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du rapport';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchProjectReports = useCallback(async (projectId: string): Promise<Report[]> => {
    try {
      console.log('🔍 === RÉCUPÉRATION RAPPORTS PROJET ===', projectId);
      
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/reports/projects/${projectId}`, {
        headers: getHeaders()
      });

      console.log('📡 Statut réponse:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP:', errorText);
        
        if (response.status === 403) {
          throw new Error('Accès non autorisé à ces rapports');
        }
        
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📡 Réponse rapports projet:', result);
      
      const reportsData = extractDataFromResponse(result, 'reports[]');
      console.log('✅ Rapports projet récupérés:', reportsData.length, reportsData);
      
      setReports(reportsData);
      return reportsData;
      
    } catch (err) {
      console.error('❌ === ERREUR RÉCUPÉRATION RAPPORTS PROJET ===', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des rapports';
      setError(errorMessage);
      setReports([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const updateReport = useCallback(async (
    reportId: string,
    updateData: UpdateReportData
  ): Promise<Report> => {
    try {
      console.log('✏️ === DÉBUT MODIFICATION RAPPORT ===');
      console.log('📝 Report ID:', reportId);
      console.log('📝 Données de modification:', updateData);
      
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updateData),
      });

      console.log('📡 Statut modification:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur modification:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}
        
        throw new Error(errorData?.message || 'Erreur lors de la modification du rapport');
      }

      const result = await response.json();
      console.log('📡 Réponse modification:', result);
      
      const updatedReport = extractDataFromResponse(result, 'report');
      console.log('✅ Rapport modifié:', updatedReport);

      setReports(prev => prev.map(report => 
        report.id === reportId ? updatedReport : report
      ));
      
      if (currentReport?.id === reportId) {
        setCurrentReport(updatedReport);
      }

      toast.success('Rapport modifié avec succès');
      console.log('✅ === FIN MODIFICATION RAPPORT (SUCCÈS) ===');
      return updatedReport;
      
    } catch (err) {
      console.error('❌ === ERREUR MODIFICATION RAPPORT ===', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification du rapport';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, currentReport]);


  const fetchReportSections = useCallback(async (
    reportId: string,
    sectionIds?: string[]
  ) => {
    try {
      console.log('🔍 === RÉCUPÉRATION SECTIONS RAPPORT ===');
      console.log('📝 Report ID:', reportId);
      console.log('📝 Section IDs:', sectionIds);
      
      setLoading(true);
      setError(null);
      
      const queryParam = sectionIds ? `?sectionIds=${sectionIds.join(',')}` : '';
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}/sections${queryParam}`, {
        headers: getHeaders()
      });

      console.log('📡 Statut réponse sections:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📡 Réponse sections:', result);
      
      const sectionsData = extractDataFromResponse(result, 'sections');
      console.log('✅ Sections récupérées:', sectionsData);
      
      return sectionsData;
      
    } catch (err) {
      console.error('❌ === ERREUR RÉCUPÉRATION SECTIONS ===', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des sections';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const addReportSection = useCallback(async (
    reportId: string,
    sectionData: CreateSectionData
  ): Promise<ReportSection> => {
    try {
      console.log('➕ === AJOUT SECTION RAPPORT ===');
      console.log('📝 Report ID:', reportId);
      console.log('📝 Section Data:', sectionData);
      
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}/sections`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(sectionData),
      });

      console.log('📡 Statut ajout section:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur ajout section:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}
        
        throw new Error(errorData?.message || 'Erreur lors de l\'ajout de la section');
      }

      const result = await response.json();
      console.log('📡 Réponse ajout section:', result);
      
      const newSection = extractDataFromResponse(result, 'section');
      console.log('✅ Section ajoutée:', newSection);

      if (currentReport?.id === reportId) {
        setCurrentReport(prev => prev ? {
          ...prev,
          sections: [...prev.sections, newSection]
        } : null);
      }

      toast.success('Section ajoutée avec succès');
      console.log('✅ === FIN AJOUT SECTION (SUCCÈS) ===');
      return newSection;
      
    } catch (err) {
      console.error('❌ === ERREUR AJOUT SECTION ===', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la section';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, currentReport]);

  const updateReportSection = useCallback(async (
    sectionId: string,
    updateData: UpdateSectionData
  ): Promise<ReportSection> => {
    try {
      console.log('✏️ === MODIFICATION SECTION ===');
      console.log('📝 Section ID:', sectionId);
      console.log('📝 Update Data:', updateData);
      
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/reports/sections/${sectionId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updateData),
      });

      console.log('📡 Statut modification section:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur modification section:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}
        
        throw new Error(errorData?.message || 'Erreur lors de la modification de la section');
      }

      const result = await response.json();
      console.log('📡 Réponse modification section:', result);
      
      const updatedSection = extractDataFromResponse(result, 'section');
      console.log('✅ Section modifiée:', updatedSection);

      if (currentReport) {
        setCurrentReport(prev => prev ? {
          ...prev,
          sections: prev.sections.map(section => 
            section.id === sectionId ? updatedSection : section
          )
        } : null);
      }

      toast.success('Section modifiée avec succès');
      console.log('✅ === FIN MODIFICATION SECTION (SUCCÈS) ===');
      return updatedSection;
      
    } catch (err) {
      console.error('❌ === ERREUR MODIFICATION SECTION ===', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification de la section';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, currentReport]);


  const deleteReportSection = useCallback(async (sectionId: string): Promise<void> => {
    try {
      console.log('🗑️ === SUPPRESSION SECTION ===', sectionId);
      
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/reports/sections/${sectionId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      console.log('📡 Statut suppression section:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur suppression section:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}
        
        throw new Error(errorData?.message || 'Erreur lors de la suppression de la section');
      }

      if (currentReport) {
        setCurrentReport(prev => prev ? {
          ...prev,
          sections: prev.sections.filter(section => section.id !== sectionId)
        } : null);
      }

      toast.success('Section supprimée avec succès');
      console.log('✅ === FIN SUPPRESSION SECTION (SUCCÈS) ===');
      
    } catch (err) {
      console.error('❌ === ERREUR SUPPRESSION SECTION ===', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la section';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, currentReport]);

  const reorderReportSections = useCallback(async (
    reportId: string,
    sectionOrder: string[]
  ): Promise<Report> => {
    try {
      console.log('🔄 === RÉORGANISATION SECTIONS ===');
      console.log('📝 Report ID:', reportId);
      console.log('📝 Section Order:', sectionOrder);
      
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}/sections/reorder`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ sectionOrder }),
      });

      console.log('📡 Statut réorganisation:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur réorganisation:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}
        
        throw new Error(errorData?.message || 'Erreur lors de la réorganisation des sections');
      }

      const result = await response.json();
      console.log('📡 Réponse réorganisation:', result);
      
      const updatedReport = extractDataFromResponse(result, 'report');
      console.log('✅ Sections réorganisées:', updatedReport);

      if (currentReport?.id === reportId) {
        setCurrentReport(updatedReport);
      }
      
      setReports(prev => prev.map(report => 
        report.id === reportId ? updatedReport : report
      ));

      toast.success('Sections réorganisées avec succès');
      console.log('✅ === FIN RÉORGANISATION SECTIONS (SUCCÈS) ===');
      return updatedReport;
      
    } catch (err) {
      console.error('❌ === ERREUR RÉORGANISATION SECTIONS ===', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la réorganisation des sections';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, currentReport]);

  // ===== NAVIGATION =====

  const fetchReportNavigation = useCallback(async (
    projectId: string,
    reportId: string
  ): Promise<ReportNavigation> => {
    try {
      console.log('🧭 === RÉCUPÉRATION NAVIGATION RAPPORT ===');
      console.log('📝 Project ID:', projectId);
      console.log('📝 Report ID:', reportId);
      
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/reports/projects/${projectId}/${reportId}/navigation`, {
        headers: getHeaders()
      });

      console.log('📡 Statut navigation:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur navigation:', errorText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📡 Réponse navigation:', result);
      
      const navigationData = extractDataFromResponse(result, 'navigation');
      console.log('✅ Navigation récupérée:', navigationData);
      
      setNavigation(navigationData);
      return navigationData;
      
    } catch (err) {
      console.error('❌ === ERREUR RÉCUPÉRATION NAVIGATION ===', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération de la navigation';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchNextReport = useCallback(async (
    projectId: string,
    reportId: string
  ): Promise<Report> => {
    try {
      console.log('➡️ === RÉCUPÉRATION RAPPORT SUIVANT ===');
      
      const response = await fetch(`${API_BASE_URL}/reports/projects/${projectId}/${reportId}/next`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Aucun rapport suivant disponible');
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const nextReport = extractDataFromResponse(result, 'report');
      
      setCurrentReport(nextReport);
      return nextReport;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du rapport suivant';
      toast.error(errorMessage);
      throw err;
    }
  }, [API_BASE_URL]);

  const fetchPreviousReport = useCallback(async (
    projectId: string,
    reportId: string
  ): Promise<Report> => {
    try {
      console.log('⬅️ === RÉCUPÉRATION RAPPORT PRÉCÉDENT ===');
      
      const response = await fetch(`${API_BASE_URL}/reports/projects/${projectId}/${reportId}/previous`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Aucun rapport précédent disponible');
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const previousReport = extractDataFromResponse(result, 'report');
      
      setCurrentReport(previousReport);
      return previousReport;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du rapport précédent';
      toast.error(errorMessage);
      throw err;
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    console.log('🚀 === MONTAGE DU HOOK useReports ===');
    console.log('📝 Project ID:', projectId);
    
    if (projectId && projectId !== 'undefined') {
      fetchProjectReports(projectId).catch(console.error);
    } else {
      console.warn('⚠️ Project ID invalide ou non fourni:', projectId);
    }
  }, [projectId, fetchProjectReports]);

  const refreshData = useCallback(() => {
    console.log('🔄 === RAFRAÎCHISSEMENT DES DONNÉES ===');
    if (projectId) {
      return fetchProjectReports(projectId);
    }
    return Promise.resolve([]);
  }, [projectId, fetchProjectReports]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const stats = {
    totalReports: reports.length,
    draftReports: reports.filter(r => r.status === 'draft').length,
    submittedReports: reports.filter(r => r.status === 'submitted').length,
    reviewedReports: reports.filter(r => r.status === 'reviewed').length,
    publishedReports: reports.filter(r => r.status === 'published').length,
  };

  console.log('📊 === STATISTIQUES RAPPORTS ===');
  console.log('📊 Stats:', stats);
  console.log('📊 Loading:', loading);
  console.log('📊 Error:', error);

  return {
    reports,
    currentReport,
    navigation,
    loading,
    error,
    stats,

    createReport,
    fetchReportById,
    fetchGroupReport,
    fetchProjectReports,
    updateReport,

    fetchReportSections,
    addReportSection,
    updateReportSection,
    deleteReportSection,
    reorderReportSections,

    fetchReportNavigation,
    fetchNextReport,
    fetchPreviousReport,

    refreshData,
    clearError,
    setCurrentReport,
  };
};