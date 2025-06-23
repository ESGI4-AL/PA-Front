// features/student/projects/hooks/useStudentPresentations.ts
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PresentationSchedule } from '../../../../domains/project/models/presentationModels';
import * as presentationService from '../../../../domains/project/services/presentationService';

interface UserGroup {
  id: string;
  name: string;
  members?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

export const useStudentPresentations = (projectId: string) => {
  const [schedules, setSchedules] = useState<PresentationSchedule[]>([]);
  const [userGroup, setUserGroup] = useState<UserGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction simplifiée pour récupérer le groupe de l'utilisateur
  const fetchUserGroup = async () => {
    if (!projectId) return;

    try {
      console.log('🔍 Récupération du groupe utilisateur pour le projet:', projectId);
      
      // Appel direct à l'endpoint qui retourne le groupe de l'utilisateur pour ce projet
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/groups/project/${projectId}/user-group`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Groupe utilisateur récupéré:', result.data);
        setUserGroup(result.data);
      } else if (response.status === 404) {
        // L'utilisateur n'est pas dans un groupe pour ce projet
        console.log('ℹ️ Utilisateur non assigné à un groupe');
        setUserGroup(null);
      } else {
        console.error('❌ Erreur lors de la récupération du groupe:', response.status);
        setUserGroup(null);
      }
    } catch (err: any) {
      console.error('❌ Erreur réseau lors de la récupération du groupe:', err);
      setUserGroup(null);
    }
  };

  // Fonction alternative si l'endpoint user-group n'existe pas
  const fetchUserGroupAlternative = async () => {
    if (!projectId) return;

    try {
      console.log('🔍 Récupération alternative du groupe utilisateur');
      
      // 1. Récupérer l'utilisateur actuel
      const userResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/me`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (!userResponse.ok) {
        console.error('❌ Impossible de récupérer les infos utilisateur');
        return;
      }

      const userResult = await userResponse.json();
      const currentUserId = userResult.data?.id;

      if (!currentUserId) {
        console.error('❌ ID utilisateur non trouvé');
        return;
      }

      console.log('👤 Utilisateur actuel ID:', currentUserId);

      // 2. Récupérer tous les groupes du projet avec leurs membres
      const groupsResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/projects/${projectId}/groups`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (!groupsResponse.ok) {
        console.error('❌ Impossible de récupérer les groupes du projet');
        return;
      }

      const groupsResult = await groupsResponse.json();
      const groups = groupsResult.data || [];

      console.log('📋 Groupes du projet:', groups.length);

      // 3. Chercher le groupe contenant l'utilisateur actuel
      for (const group of groups) {
        try {
          const groupDetailResponse = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/groups/${group.id}`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
              }
            }
          );

          if (groupDetailResponse.ok) {
            const groupDetailResult = await groupDetailResponse.json();
            const groupData = groupDetailResult.data;

            console.log(`🔍 Vérification du groupe ${groupData.name}:`, groupData.members?.length || 0, 'membres');

            // Vérifier si l'utilisateur actuel est membre de ce groupe
            if (groupData.members && groupData.members.some((member: any) => member.id === currentUserId)) {
              console.log('✅ Groupe trouvé:', groupData.name);
              setUserGroup(groupData);
              return;
            }
          }
        } catch (err) {
          console.error(`❌ Erreur lors de la récupération du groupe ${group.id}:`, err);
        }
      }

      // Si aucun groupe trouvé
      console.log('ℹ️ Aucun groupe trouvé pour cet utilisateur');
      setUserGroup(null);

    } catch (err: any) {
      console.error('❌ Erreur lors de la récupération alternative du groupe:', err);
      setUserGroup(null);
    }
  };

  // Récupérer les plannings de présentation
  const fetchSchedules = async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('📅 Récupération des plannings de présentation');
      const data = await presentationService.getPresentationSchedule(projectId);
      console.log('✅ Plannings récupérés:', data.length);
      setSchedules(data);
    } catch (err: any) {
      console.log('ℹ️ Aucun planning trouvé ou erreur:', err.message);
      if (err.message && !err.message.includes('No presentation schedule found')) {
        setError(err.message || 'Erreur lors du chargement des soutenances');
      }
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      console.log('🚀 Initialisation pour le projet:', projectId);
      
      // Essayer d'abord l'endpoint direct, sinon utiliser l'alternative
      fetchUserGroup().catch(() => {
        console.log('🔄 Tentative avec méthode alternative');
        fetchUserGroupAlternative();
      });
      
      fetchSchedules();
    }
  }, [projectId]);

  return {
    schedules,
    userGroup,
    loading,
    error,
    refreshSchedules: fetchSchedules,
    refreshUserGroup: () => {
      fetchUserGroup().catch(() => fetchUserGroupAlternative());
    }
  };
};