import { useState, useCallback } from 'react';
import {
  getMyProjects,
  getProjectById
} from '@/domains/project/services/projectService';
import {
  StudentProject,
  Project
} from '@/domains/project/models/projectModels';

export const useStudentProjects = () => {
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchMyProjects = useCallback(async (filters: {
    search?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    setLoading(true);
    try {
      const data = await getMyProjects(filters);
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setTotalItems(data.totalItems || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
      setError(null);
      return data;
    } catch (err) {
      setError('Erreur lors du chargement de vos projets');
      console.error(err);
      return { projects: [], totalItems: 0, totalPages: 1, currentPage: 1 };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjectById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const project = await getProjectById(id);
      setCurrentProject(project);
      setError(null);
      return project;
    } catch (err) {
      setError('Erreur lors du chargement du projet');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUpcomingDeadlines = useCallback(() => {
    const now = new Date();
    const allDeadlines: Array<{
      projectId: string;
      projectName: string;
      deliverable: {
        id: string;
        name: string;
        deadline: Date;
        type: string;
      };
    }> = [];

    projects.forEach(project => {
      if (project.deliverables) {
        project.deliverables.forEach(deliverable => {
          const deadline = new Date(deliverable.deadline);
          if (deadline > now) {
            allDeadlines.push({
              projectId: project.id,
              projectName: project.name,
              deliverable: {
                id: deliverable.id,
                name: deliverable.name,
                deadline,
                type: deliverable.type
              }
            });
          }
        });
      }
    });

    return allDeadlines.sort((a, b) =>
      a.deliverable.deadline.getTime() - b.deliverable.deadline.getTime()
    );
  }, [projects]);

  const getProjectStats = useCallback(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'visible').length;
    const upcomingDeadlines = getUpcomingDeadlines();
    const nextDeadline = upcomingDeadlines[0] || null;

    return {
      totalProjects,
      activeProjects,
      upcomingDeadlinesCount: upcomingDeadlines.length,
      nextDeadline
    };
  }, [projects, getUpcomingDeadlines]);

  const clearCurrentProject = useCallback(() => {
    setCurrentProject(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    projects,
    loading,
    error,
    currentProject,
    totalItems,
    totalPages,
    currentPage,

    fetchMyProjects,
    fetchProjectById,
    clearCurrentProject,
    clearError,

    getUpcomingDeadlines,
    getProjectStats
  };
};
