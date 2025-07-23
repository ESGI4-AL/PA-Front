import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  promotionId?: string;
}

interface Group {
  id: string;
  name: string;
  projectId: string;
  members: Student[];
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
  minGroupSize: number;
  maxGroupSize: number;
  groupFormationMethod: 'manual' | 'free' | 'automatic';
  groupFormationDeadline?: string;
  promotionId: string;
  promotion?: {
    id: string;
    name: string;
  };
}

interface CreateGroupData {
  name: string;
  memberIds?: string[];
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
      if (dataType === 'students' && Array.isArray(response.data.students)) {
        return response.data.students;
      }

      if (dataType === 'groups' && Array.isArray(response.data.groups)) {
        return response.data.groups;
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

export const useStudentGroups = (projectId: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [promotionStudents, setPromotionStudents] = useState<Student[]>([]);
  const [userGroup, setUserGroup] = useState<Group | null>(null);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  });

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  };

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const projectData = result.data || result;

      setProject(projectData);
      return projectData;
    } catch (error) {
      throw error;
    }
  }, [projectId, API_BASE_URL]);

  const fetchGroups = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/groups`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const groupsData = extractArrayFromResponse(result, 'groups');

      setGroups(groupsData);
      return groupsData;
    } catch (error) {
      setGroups([]);
      throw error;
    }
  }, [projectId, API_BASE_URL]);

  const fetchPromotionStudents = useCallback(async (promotionId: string) => {
    try {
      if (!promotionId || promotionId === 'undefined' || promotionId === 'null') {
        throw new Error('ID de promotion invalide');
      }

      const response = await fetch(`${API_BASE_URL}/projects/promotions/${promotionId}/students`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Promotion non trouvée ou aucun étudiant dans cette promotion');
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const studentsData = extractArrayFromResponse(result, 'students');

      setPromotionStudents(studentsData);
      return studentsData;
    } catch (error) {
      setPromotionStudents([]);
      throw error;
    }
  }, [API_BASE_URL]);

  const fetchUserGroup = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/groups/project/${projectId}/user-group`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const groupData = result.data;

      setUserGroup(groupData);
      return groupData;
    } catch (error) {
      setUserGroup(null);
      return null;
    }
  }, [projectId, API_BASE_URL]);

  const calculateAvailableStudents = useCallback((allStudents: Student[], groups: Group[]) => {
    if (!Array.isArray(allStudents) || allStudents.length === 0) {
      setAvailableStudents([]);
      return [];
    }

    if (!Array.isArray(groups)) {
      setAvailableStudents(allStudents);
      return allStudents;
    }

    const assignedStudentIds = new Set<string>();
    groups.forEach(group => {
      if (group && Array.isArray(group.members)) {
        group.members.forEach(member => {
          if (member && member.id) {
            assignedStudentIds.add(member.id);
          }
        });
      }
    });

    const available = allStudents.filter(student =>
      student && student.id && !assignedStudentIds.has(student.id)
    );

    setAvailableStudents(available);
    return available;
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Recuper projects
      const projectData = await fetchProject();

      if (!projectData) {
        throw new Error('Impossible de récupérer les données du projet');
      }

      // Step 2: Recuper groups
      const groupsData = await fetchGroups();

      // Step 3: Recuper user's group
      await fetchUserGroup();

      // Step 4: Recuper promotion students
      if (projectData.promotionId) {
        const studentsData = await fetchPromotionStudents(projectData.promotionId);

        // Step 5: Calculer etudiants disponibles
        calculateAvailableStudents(studentsData, groupsData);
      } else {
        setPromotionStudents([]);
        setAvailableStudents([]);
      }


    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchProject, fetchGroups, fetchUserGroup, fetchPromotionStudents, calculateAvailableStudents]);

  const createGroup = useCallback(async (groupData: CreateGroupData) => {
    try {
      setCreating(true);

      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/groups/student`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(groupData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}
        throw new Error(errorData?.message || 'Erreur lors de la création du groupe');
      }

      const result = await response.json();
      const newGroup = result.data || result;

      await fetchAllData();

      return newGroup;

    } catch (error) {
      throw error;
    } finally {
      setCreating(false);
    }
  }, [projectId, API_BASE_URL, fetchAllData]);

  const joinGroupAction = useCallback(async (groupId: string) => {
    try {
      setJoining(true);

      const currentUser = getCurrentUser();
      if (!currentUser.id) {
        throw new Error('Utilisateur non identifié');
      }

      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members/${currentUser.id}`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}
        throw new Error(errorData?.message || 'Erreur lors de l\'ajout au groupe');
      }

      // Refresh all data to get updated state
      await fetchAllData();

    } catch (error) {
      throw error;
    } finally {
      setJoining(false);
    }
  }, [API_BASE_URL, fetchAllData]);

  const leaveGroupAction = useCallback(async () => {
    try {
      setLeaving(true);

      const currentUser = getCurrentUser();
      if (!currentUser.id) {
        throw new Error('Utilisateur non identifié');
      }

      if (!userGroup) {
        throw new Error('Vous n\'êtes dans aucun groupe');
      }

      const response = await fetch(`${API_BASE_URL}/groups/${userGroup.id}/members/${currentUser.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}
        throw new Error(errorData?.message || 'Erreur lors de la sortie du groupe');
      }

      // Refresh all data to get updated state
      await fetchAllData();

    } catch (error) {
      throw error;
    } finally {
      setLeaving(false);
    }
  }, [userGroup, API_BASE_URL, fetchAllData]);

  const canCreateGroup = useCallback(() => {
    if (!project) return false;
    if (project.groupFormationMethod !== 'free') return false;
    if (project.groupFormationDeadline && new Date() > new Date(project.groupFormationDeadline)) return false;
    if (userGroup) return false;
    return true;
  }, [project, userGroup]);

  const canJoinGroup = useCallback(() => {
    if (!project) return false;
    if (project.groupFormationMethod !== 'free') return false;
    if (project.groupFormationDeadline && new Date() > new Date(project.groupFormationDeadline)) return false;
    if (userGroup) return false;
    return true;
  }, [project, userGroup]);

  const canModifyGroup = useCallback(() => {
    if (!project) return false;
    if (project.groupFormationMethod !== 'free') return false;
    if (project.groupFormationDeadline && new Date() > new Date(project.groupFormationDeadline)) return false;
    if (!userGroup) return false;
    return true;
  }, [project, userGroup]);

  const refreshData = useCallback(() => {
    return fetchAllData();
  }, [fetchAllData]);

  const stats = {
    totalStudents: Array.isArray(promotionStudents) ? promotionStudents.length : 0,
    totalGroups: Array.isArray(groups) ? groups.length : 0,
    unassignedCount: Array.isArray(availableStudents) ? availableStudents.length : 0,
    averageGroupSize: Array.isArray(groups) && groups.length > 0 ?
      groups.reduce((sum, group) => sum + (Array.isArray(group.members) ? group.members.length : 0), 0) / groups.length : 0
  };

  useEffect(() => {

    if (projectId && projectId !== 'undefined') {
      fetchAllData();
    } else {
      setLoading(false);
      setError('ID du projet invalide');
    }
  }, [projectId, fetchAllData]);

  return {
    project,
    groups,
    promotionStudents,
    userGroup,
    availableStudents,

    loading,
    creating,
    joining,
    leaving,

    error,

    stats,

    createGroup,
    joinGroupAction,
    leaveGroupAction,
    refreshData,

    canCreateGroup,
    canJoinGroup,
    canModifyGroup
  };
};
