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

interface UpdateGroupData {
  name?: string;
  memberIds?: string[];
}

interface AssignRemainingResponse {
  message: string;
  newGroups?: Group[];
  updatedGroups?: Group[];
}


const extractArrayFromResponse = (response: any, dataType: string): any[] => {
  console.log(`Extraction des données ${dataType}:`, response);


  if (Array.isArray(response)) {
    console.log(`${dataType} déjà un tableau:`, response.length, 'éléments');
    return response;
  }

  if (!response) {
    console.log(`⚠️ ${dataType} null/undefined`);
    return [];
  }


  if (typeof response === 'object') {

    if (response.data && Array.isArray(response.data)) {
      console.log(`${dataType} trouvé dans response.data:`, response.data.length, 'éléments');
      return response.data;
    }

    if (response.data && typeof response.data === 'object') {
      // Pour les étudiants
      if (dataType === 'students' && Array.isArray(response.data.students)) {
        console.log(`${dataType} trouvé dans response.data.students:`, response.data.students.length, 'éléments');
        return response.data.students;
      }

      if (dataType === 'groups' && Array.isArray(response.data.groups)) {
        console.log(`${dataType} trouvé dans response.data.groups:`, response.data.groups.length, 'éléments');
        return response.data.groups;
      }

      if (dataType === 'project' && response.data.project) {
        console.log(`${dataType} trouvé dans response.data.project`);
        return response.data.project;
      }
    }

    const possibleKeys = ['items', 'results', 'content', dataType];
    for (const key of possibleKeys) {
      if (Array.isArray(response[key])) {
        console.log(`${dataType} trouvé dans response.${key}:`, response[key].length, 'éléments');
        return response[key];
      }
    }

    if (response.error || response.message) {
      console.error(`Erreur dans la réponse ${dataType}:`, response.error || response.message);
      return [];
    }
  }

  console.warn(`Format de réponse ${dataType} non reconnu:`, response);
  console.warn(`Type:`, typeof response);
  if (response && typeof response === 'object') {
    console.warn(`Clés disponibles:`, Object.keys(response));
  }

  return [];
};

export const useGroups = (projectId: string) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  });

  const fetchProject = useCallback(async () => {
    try {
      console.log('Récupération du projet:', projectId);
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur HTTP projet:', response.status, errorText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Réponse projet brute:', result);

      let projectData;
      if (result.data) {
        projectData = result.data;
      } else if (result.id) {
        projectData = result;
      } else {
        throw new Error('Format de réponse projet invalide');
      }

      console.log('Projet récupéré:', projectData);
      setProject(projectData);

      return projectData;
    } catch (error) {
      console.error('Erreur fetchProject:', error);
      throw error;
    }
  }, [projectId, API_BASE_URL]);

  const fetchGroups = useCallback(async () => {
    try {
      console.log('Récupération des groupes pour le projet:', projectId);
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/groups`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur HTTP groupes:', response.status, errorText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Réponse groupes brute:', result);

      const groupsData = extractArrayFromResponse(result, 'groups');
      console.log('Groupes récupérés:', groupsData.length, groupsData);

      setGroups(groupsData);
      return groupsData;
    } catch (error) {
      console.error('Erreur fetchGroups:', error);
      setGroups([]);
      throw error;
    }
  }, [projectId, API_BASE_URL]);

  const fetchAllStudents = useCallback(async (promotionId: string) => {
    try {
      console.log('Récupération des étudiants pour la promotion:', promotionId);

      if (!promotionId || promotionId === 'undefined' || promotionId === 'null') {
        throw new Error('ID de promotion invalide');
      }

      const url = `${API_BASE_URL}/projects/promotions/${promotionId}/students`;
      console.log('URL étudiants:', url);

      const response = await fetch(url, {
        headers: getHeaders()
      });

      console.log('Statut réponse étudiants:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur HTTP étudiants:', response.status, errorText);

        if (response.status === 404) {
          throw new Error('Promotion non trouvée ou aucun étudiant dans cette promotion');
        } else if (response.status === 403) {
          throw new Error('Accès non autorisé à cette promotion');
        } else {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }

      const result = await response.json();
      console.log('Réponse étudiants brute:', result);

      const studentsData = extractArrayFromResponse(result, 'students');
      console.log('Étudiants récupérés:', studentsData.length, studentsData);

      const validStudents = studentsData.filter(student => {
        const isValid = student &&
          typeof student === 'object' &&
          student.id &&
          student.firstName &&
          student.lastName &&
          student.email;

        if (!isValid) {
          console.warn('Étudiant invalide détecté:', student);
        }

        return isValid;
      });

      console.log('Étudiants valides:', validStudents.length, 'sur', studentsData.length);

      setAllStudents(validStudents);
      return validStudents;
    } catch (error) {
      console.error('Erreur fetchAllStudents:', error);
      setAllStudents([]);
      throw error;
    }
  }, [API_BASE_URL]);

  const calculateUnassignedStudents = useCallback((allStudents: Student[], groups: Group[]) => {
    console.log('Calcul des étudiants non assignés...');
    console.log('Tous les étudiants:', allStudents?.length || 0);
    console.log('Groupes:', groups?.length || 0);

    if (!Array.isArray(allStudents) || allStudents.length === 0) {
      console.warn('Aucun étudiant à traiter');
      setUnassignedStudents([]);
      return [];
    }

    if (!Array.isArray(groups)) {
      console.warn('Groupes invalides, tous les étudiants sont non assignés');
      setUnassignedStudents(allStudents);
      return allStudents;
    }

    const assignedStudentIds = new Set<string>();
    groups.forEach(group => {
      if (group && Array.isArray(group.members)) {
        console.log(`Groupe "${group.name}":`, group.members.length, 'membres');
        group.members.forEach(member => {
          if (member && member.id) {
            assignedStudentIds.add(member.id);
          }
        });
      }
    });

    const unassigned = allStudents.filter(student =>
      student && student.id && !assignedStudentIds.has(student.id)
    );

    console.log('Étudiants assignés:', assignedStudentIds.size);
    console.log('Étudiants non assignés:', unassigned.length, unassigned);

    setUnassignedStudents(unassigned);
    return unassigned;
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('=== DÉBUT DU CHARGEMENT DES DONNÉES ===');
      console.log('Project ID:', projectId);

      console.log('Étape 1: Récupération du projet...');
      const projectData = await fetchProject();

      if (!projectData) {
        throw new Error('Impossible de récupérer les données du projet');
      }

      console.log('Projet récupéré, promotionId:', projectData.promotionId);

      console.log('Étape 2: Récupération des groupes...');
      const groupsData = await fetchGroups();

      if (projectData.promotionId) {
        console.log('Étape 3: Récupération des étudiants...');
        const studentsData = await fetchAllStudents(projectData.promotionId);

        console.log('Étape 4: Calcul des non assignés...');
        calculateUnassignedStudents(studentsData, groupsData);
      } else {
        console.warn('Pas d\'ID de promotion trouvé dans le projet');
        setAllStudents([]);
        setUnassignedStudents([]);
      }

      console.log('=== CHARGEMENT TERMINÉ AVEC SUCCÈS ===');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données';
      console.error('=== ERREUR LORS DU CHARGEMENT ===', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchProject, fetchGroups, fetchAllStudents, calculateUnassignedStudents]);

  const createGroup = useCallback(async (groupData: CreateGroupData) => {
    try {
      console.log('=== DÉBUT CRÉATION GROUPE ===');
      console.log('Données reçues:', groupData);
      console.log('Project ID:', projectId);
      console.log('URL:', `${API_BASE_URL}/projects/${projectId}/groups`);

      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/groups`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(groupData)
      });

      console.log('Statut réponse:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Réponse d\'erreur:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}

        throw new Error(errorData?.message || 'Erreur lors de la création du groupe');
      }

      const result = await response.json();
      console.log('Réponse succès:', result);

      const newGroup = result.data || result;
      console.log('Nouveau groupe créé:', newGroup);

      console.log('Rechargement des données pour actualiser l\'affichage...');
      await fetchAllData();

      toast.success('Groupe créé avec succès');
      console.log('=== FIN CRÉATION GROUPE (SUCCÈS) ===');
      return newGroup;

    } catch (error) {
      console.error('=== ERREUR CRÉATION GROUPE ===', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du groupe';
      toast.error(errorMessage);
      throw error;
    }
  }, [projectId, API_BASE_URL, fetchAllData]);

  const updateGroup = useCallback(async (groupId: string, updateData: UpdateGroupData) => {
    try {
      console.log('=== DÉBUT MODIFICATION GROUPE ===');
      console.log('Groupe ID:', groupId);
      console.log('Données de modification:', updateData);
      console.log('URL:', `${API_BASE_URL}/groups/${groupId}`);

      const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updateData)
      });

      console.log('Statut modification:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur modification:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}

        throw new Error(errorData?.message || 'Erreur lors de la modification du groupe');
      }

      const result = await response.json();
      console.log('Réponse modification:', result);

      const updatedGroup = result.data || result;
      console.log('Groupe modifié:', updatedGroup);

      setGroups(prev => {
        const updated = Array.isArray(prev) ? prev.map(group =>
          group.id === groupId ? updatedGroup : group
        ) : [];
        console.log('Groupes après modification:', updated.length);
        return updated;
      });

      console.log('Recalcul des étudiants non assignés après modification');
      const updatedGroups = groups.map(g => g.id === groupId ? updatedGroup : g);
      calculateUnassignedStudents(allStudents, updatedGroups);

      toast.success('Groupe modifié avec succès');
      console.log('=== FIN MODIFICATION GROUPE (SUCCÈS) ===');
      return updatedGroup;

    } catch (error) {
      console.error('=== ERREUR MODIFICATION GROUPE ===', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la modification du groupe';
      toast.error(errorMessage);
      throw error;
    }
  }, [API_BASE_URL, groups, allStudents, calculateUnassignedStudents]);

  const deleteGroup = useCallback(async (groupId: string) => {
    try {
      console.log('=== DÉBUT SUPPRESSION GROUPE ===', groupId);

      const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      console.log('Statut suppression:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;

        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          }
        } catch (parseError) {
          if (response.status === 404) {
            errorMessage = 'Groupe non trouvé';
          } else if (response.status === 403) {
            errorMessage = 'Vous n\'avez pas l\'autorisation de supprimer ce groupe';
          } else if (response.status === 401) {
            errorMessage = 'Non autorisé - vérifiez votre connexion';
          }
        }

        throw new Error(errorMessage);
      }

      // Recharger toutes les données pour avoir les informations à jour
      console.log('Rechargement des données après suppression du groupe...');
      await fetchAllData();

      console.log('=== FIN SUPPRESSION GROUPE (SUCCÈS) ===');

    } catch (error) {
      console.error('=== ERREUR SUPPRESSION GROUPE ===', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la suppression du groupe';
      toast.error(errorMessage);
      throw error;
    }
  }, [API_BASE_URL, fetchAllData]);

  const addMemberToGroup = useCallback(async (groupId: string, memberId: string) => {
    try {
      console.log('=== AJOUT MEMBRE AU GROUPE ===');
      console.log('Groupe ID:', groupId);
      console.log('Membre ID:', memberId);

      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members/${memberId}`, {
        method: 'POST',
        headers: getHeaders()
      });

      console.log('Statut ajout membre:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur ajout membre:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}

        throw new Error(errorData?.message || 'Erreur lors de l\'ajout du membre');
      }

      // Recharger toutes les données pour avoir les informations à jour
      console.log('Rechargement des données après ajout membre...');
      await fetchAllData();

      toast.success('Étudiant ajouté au groupe');
      console.log('=== FIN AJOUT MEMBRE (SUCCÈS) ===');

    } catch (error) {
      console.error('=== ERREUR AJOUT MEMBRE ===', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'ajout du membre';
      toast.error(errorMessage);
      throw error;
    }
  }, [API_BASE_URL, fetchAllData]);

  const removeMemberFromGroup = useCallback(async (groupId: string, memberId: string) => {
    try {
      console.log('=== RETRAIT MEMBRE DU GROUPE ===');
      console.log('Groupe ID:', groupId);
      console.log('Membre ID:', memberId);

      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members/${memberId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      console.log('Statut retrait membre:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur retrait membre:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}

        throw new Error(errorData?.message || 'Erreur lors du retrait du membre');
      }

      console.log('Rechargement des données après retrait membre...');
      await fetchAllData();

      toast.success('Étudiant retiré du groupe');
      console.log('=== FIN RETRAIT MEMBRE (SUCCÈS) ===');

    } catch (error) {
      console.error('=== ERREUR RETRAIT MEMBRE ===', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du retrait du membre';
      toast.error(errorMessage);
      throw error;
    }
  }, [API_BASE_URL, fetchAllData]);

  const assignRemainingStudents = useCallback(async () => {
    try {
      console.log('=== ASSIGNATION AUTOMATIQUE ===');

      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/groups/assign-remaining`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {}
        throw new Error(errorData?.message || 'Erreur lors de l\'assignation automatique');
      }

      const result: AssignRemainingResponse = await response.json();
      console.log('Résultat assignation:', result);

      await fetchAllData();

      toast.success(result.message || 'Étudiants assignés automatiquement');
      console.log('=== FIN ASSIGNATION AUTOMATIQUE (SUCCÈS) ===');
      return result;
    } catch (error) {
      console.error('=== ERREUR ASSIGNATION AUTOMATIQUE ===', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'assignation automatique';
      toast.error(errorMessage);
      throw error;
    }
  }, [projectId, API_BASE_URL, fetchAllData]);

  const refreshData = useCallback(() => {
    console.log('=== RAFRAÎCHISSEMENT DES DONNÉES ===');
    return fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    console.log('=== MONTAGE DU HOOK useGroups ===');
    console.log('Project ID:', projectId);

    if (projectId && projectId !== 'undefined') {
      fetchAllData();
    } else {
      console.warn('⚠️ Project ID invalide:', projectId);
      setLoading(false);
      setError('ID du projet invalide');
    }
  }, [projectId, fetchAllData]);

  const stats = {
    totalStudents: Array.isArray(allStudents) ? allStudents.length : 0,
    totalGroups: Array.isArray(groups) ? groups.length : 0,
    unassignedCount: Array.isArray(unassignedStudents) ? unassignedStudents.length : 0,
    averageGroupSize: Array.isArray(groups) && groups.length > 0 ?
      groups.reduce((sum, group) => sum + (Array.isArray(group.members) ? group.members.length : 0), 0) / groups.length : 0
  };

  console.log('=== STATISTIQUES ACTUELLES ===');
  console.log('Stats:', stats);
  console.log('Loading:', loading);
  console.log('Error:', error);

  return {
    groups,
    unassignedStudents,
    allStudents,
    project,
    loading,
    error,
    stats,

    createGroup,
    updateGroup,
    deleteGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    assignRemainingStudents,
    refreshData
  };
};