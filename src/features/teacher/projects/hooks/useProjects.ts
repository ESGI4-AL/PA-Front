import { useState, useCallback } from 'react';
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectById
} from '@/domains/project/services/projectService';
import {
  Project,
  CreateProjectData,
  UpdateProjectData,
  ProjectStatus
} from '@/domains/project/models/projectModels';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const fetchProjects = useCallback(async (filters: {
    teacherId?: string;
    promotionId?: string;
    status?: ProjectStatus;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    setLoading(true);
    try {
      const data = await getAllProjects(filters);
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setError(null);
      return data;
    } catch (err) {
      setError('Erreur lors du chargement des projets');
      console.error(err);
      return { projects: [], totalPages: 1, currentPage: 1 };
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

  const addProject = useCallback(async (projectData: CreateProjectData) => {
    setLoading(true);
    try {
      const newProject = await createProject(projectData);

      setProjects(prev => {
        if (!Array.isArray(prev)) {
          return [newProject];
        }
        return [...prev, newProject];
      });

      setError(null);
      return newProject;
    } catch (err) {
      setError('Erreur lors de la création du projet');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const editProject = useCallback(async (id: string, projectData: UpdateProjectData) => {
    setLoading(true);
    try {
      const updatedProject = await updateProject(id, projectData);

      setProjects(prev => {
        if (!Array.isArray(prev)) {
          return [updatedProject];
        }
        return prev.map(p => p.id === id ? updatedProject : p);
      });

      if (currentProject?.id === id) {
        setCurrentProject(updatedProject);
      }

      setError(null);
      return updatedProject;
    } catch (err) {
      setError('Erreur lors de la mise à jour du projet');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  const removeProject = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await deleteProject(id);

      setProjects(prev => {
        if (!Array.isArray(prev)) {
          return [];
        }
        return prev.filter(p => p.id !== id);
      });

      setError(null);
    } catch (err) {
      setError('Erreur lors de la suppression du projet');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    projects,
    loading,
    error,
    currentProject,
    fetchProjects,
    fetchProjectById,
    addProject,
    editProject,
    removeProject
  };
};
