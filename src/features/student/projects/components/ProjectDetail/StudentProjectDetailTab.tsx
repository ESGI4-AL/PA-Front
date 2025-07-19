import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import {
  CalendarIcon,
  User,
  GraduationCap,
  BookOpen,
  FileText,
  Clock,
  Settings,
  Info
} from "lucide-react";
import { ProjectStatus, GroupFormationMethod } from '@/domains/project/models/projectModels';
import { useStudentProjects } from '../../hooks/useStudentProjects';
import { useStudentDeliverables } from '../../hooks/useStudentDeliverables';

interface StudentProjectDetailTabProps {
  projectId: string | undefined;
}

const StudentProjectDetailTab: React.FC<StudentProjectDetailTabProps> = ({ projectId }) => {
  const { fetchProjectById, loading: projectLoading, error: projectError } = useStudentProjects();
  const { deliverables, loading: deliverablesLoading, error: deliverablesError } = useStudentDeliverables(projectId || '');
  const [project, setProject] = useState<any>(null);

  const loading = projectLoading || deliverablesLoading;
  const error = projectError || deliverablesError;

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;

      try {
        const projectData = await fetchProjectById(projectId);
        setProject(projectData);
      } catch (err) {
        console.error('Error loading project:', err);
      }
    };

    loadProject();
  }, [projectId, fetchProjectById]);

  const getStatusBadge = (status: ProjectStatus) => {
    const statusConfig = {
      [ProjectStatus.DRAFT]: { label: 'Brouillon', variant: 'secondary' as const },
      [ProjectStatus.VISIBLE]: { label: 'Actif', variant: 'default' as const },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getGroupFormationMethodLabel = (method: GroupFormationMethod) => {
    const methods = {
      [GroupFormationMethod.MANUAL]: {
        label: 'Formation manuelle',
        description: 'L\'enseignant crée et assigne les groupes manuellement'
      },
      [GroupFormationMethod.FREE]: {
        label: 'Formation libre',
        description: 'Les étudiants forment leurs groupes librement'
      },
      [GroupFormationMethod.RANDOM]: {
        label: 'Formation aléatoire',
        description: 'Les groupes sont générés aléatoirement'
      }
    };
    return methods[method] || { label: method, description: '' };
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatGroupSize = () => {
    if (!project) return '';
    if (project.minGroupSize === project.maxGroupSize) {
      return `${project.minGroupSize} étudiant${project.minGroupSize > 1 ? 's' : ''}`;
    }
    return `${project.minGroupSize} à ${project.maxGroupSize} étudiants`;
  };

  const getDeliverableStatusBadges = (deliverable: any) => {
    const now = new Date();
    const deadline = new Date(deliverable.deadline);
    const isExpired = now > deadline;
    const badges = [];

    // Badge de soumission - toujours affiché
    if (deliverable.submission) {
      if (deliverable.submission.validationStatus === 'valid') {
        badges.push(
          <Badge key="submitted" variant="default" className="bg-green-100 text-green-800">
            Soumis ✓
          </Badge>
        );
      } else if (deliverable.submission.validationStatus === 'invalid') {
        badges.push(
          <Badge key="submitted" variant="destructive">
            Soumis (erreurs)
          </Badge>
        );
      } else {
        badges.push(
          <Badge key="submitted" variant="secondary">
            En validation
          </Badge>
        );
      }

      // Afficher la date de soumission si disponible
      if (deliverable.submission.submissionDate) {
        const submissionDate = new Date(deliverable.submission.submissionDate);
        badges.push(
          <Badge key="submission-date" variant="outline" className="text-xs">
            Soumis le {submissionDate.toLocaleDateString('fr-FR')}
          </Badge>
        );
      }
    } else {
      badges.push(
        <Badge key="not-submitted" variant="outline">
          Non soumis
        </Badge>
      );
    }

    // Badge d'expiration
    if (isExpired) {
      if (deliverable.allowLateSubmission) {
        badges.push(
          <Badge key="expired" variant="secondary" className="bg-orange-100 text-orange-800">
            Expiré (modifiable)
          </Badge>
        );
      } else {
        badges.push(
          <Badge key="expired" variant="destructive">
            Expiré
          </Badge>
        );
      }
    } else if (deadline.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      badges.push(
        <Badge key="urgent" variant="secondary" className="bg-red-100 text-red-800">
          Urgent
        </Badge>
      );
    }

    // Badge de retard si applicable
    if (deliverable.submission && deliverable.submission.isLate) {
      badges.push(
        <Badge key="late" variant="secondary" className="bg-yellow-100 text-yellow-800">
          En retard (+{deliverable.submission.hoursLate}h)
        </Badge>
      );
    }

    return badges;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!project) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Projet non trouvé</AlertTitle>
        <AlertDescription>
          Les détails du projet ne sont pas disponibles.
        </AlertDescription>
      </Alert>
    );
  }

  const groupFormationMethod = getGroupFormationMethodLabel(project.groupFormationMethod);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl flex items-center gap-3">
                <BookOpen className="h-6 w-6" />
                {project.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge(project.status)}
                <span className="text-sm text-muted-foreground">
                  Créé le {formatDate(project.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        {project.description && (
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Description du projet</h4>
              <p className="text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Enseignant responsable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.teacher ? (
              <>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nom complet</p>
                  <p className="font-medium">
                    {project.teacher.firstName} {project.teacher.lastName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-primary">
                    {project.teacher.email}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Informations non disponibles</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5" />
              Promotion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.promotion ? (
              <>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nom de la promotion</p>
                  <p className="font-medium">{project.promotion.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Année</p>
                  <p className="font-medium">{project.promotion.year}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Informations non disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Configuration des groupes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Taille des groupes</p>
                <p className="font-medium">{formatGroupSize()}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Méthode de formation</p>
                <div className="space-y-1">
                  <p className="font-medium">{groupFormationMethod.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {groupFormationMethod.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Date limite de formation</p>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {formatDate(project.groupFormationDeadline)}
                  </p>
                </div>
              </div>

              {project.groupFormationDeadline && (
                <div className="p-3 bg-muted rounded-lg border ">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 " />
                    <p className="text-sm font-medium">
                      Temps restant pour former les groupes :
                    </p>
                  </div>
                  <p className="text-sm text-primary ml-6 mt-1">
                    {new Date(project.groupFormationDeadline) > new Date()
                      ? `Jusqu'au ${formatDate(project.groupFormationDeadline)}`
                      : 'La période de formation des groupes est terminée'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {deliverables && deliverables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Livrables du projet ({deliverables.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deliverables.map((deliverable: any, index: number) => (
                <div key={deliverable.id}>
                  <div className="flex justify-between items-start p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-2 flex-1">
                      <h4 className="font-medium">{deliverable.name}</h4>
                      {deliverable.description && (
                        <p className="text-sm text-muted-foreground">
                          {deliverable.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {getDeliverableStatusBadges(deliverable)}
                      </div>
                    </div>
                    <div className="text-right space-y-1 ml-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {formatDate(deliverable.deadline)}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {deliverable.type === 'git' ? 'Git' : 'Archive'}
                      </Badge>
                    </div>
                  </div>
                  {index < deliverables.length - 1 && (
                    <Separator className="my-3" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentProjectDetailTab;
