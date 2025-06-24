import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, Users, AlertCircle, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../shared/components/ui/card';
import { Badge } from '../../../../../shared/components/ui/badge';
import { Alert, AlertDescription } from '../../../../../shared/components/ui/alert';
import { useStudentPresentations } from '../../hooks/useStudentPresentations';
import { PresentationSchedule } from '../../../../../domains/project/models/presentationModels';

const StudentProjectPresentationsTab: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();

  if (!projectId || projectId === 'undefined') {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur: ID du projet invalide ou manquant dans l'URL
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const {
    schedules,
    userGroup,
    loading,
    error
  } = useStudentPresentations(projectId || '');

  const formatTime = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur formatage time:', error);
      return timeString;
    }
  };

  const formatDate = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return timeString;
    }
  };

  const formatShortDate = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return timeString;
    }
  };

  const findUserSchedule = () => {
    if (!userGroup || !schedules.length) return null;
    return schedules.find(schedule => schedule.groupId === userGroup.id);
  };

  const userSchedule = findUserSchedule();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Planning des soutenances</h2>
          <p className="text-muted-foreground">
            Consultez les horaires de passage pour les soutenances
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!userGroup && !loading && !error && (
        <Alert className="mb-6">
          <Users className="h-4 w-4" />
          <AlertDescription>
            <strong>Vous n'êtes assigné à aucun groupe</strong>
            <br />
            Vous devez être assigné à un groupe pour voir votre créneau de soutenance.
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              Contactez votre enseignant ou consultez l'onglet "Groupes" pour plus d'informations.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {schedules.length === 0 && !loading && !error && userGroup && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Aucun planning de soutenances disponible</strong>
            <br />
            Le planning des soutenances n'a pas encore été créé par votre enseignant.
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              Revenez plus tard pour consulter les horaires de passage.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {}
      {userSchedule && userGroup && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <User className="h-5 w-5" />
              Votre créneau de soutenance
              <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-800">
                Ordre: {userSchedule.order}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">Informations du groupe</h4>
                <p className="text-sm">
                  <strong>Groupe:</strong> {userGroup.name}
                </p>
                <p className="text-sm">
                  <strong>Membres:</strong>
                </p>
                <ul className="text-sm ml-4 list-disc">
                  {userGroup.members?.map((member: any) => (
                    <li key={member.id}>
                      {member.firstName} {member.lastName}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">Horaires</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">
                      {formatDate(userSchedule.startTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">
                      {formatTime(userSchedule.startTime)} - {formatTime(userSchedule.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-orange-700 border-orange-300">
                      {userSchedule.duration} minutes
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {}
      {schedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Planning complet des soutenances
              <Badge variant="secondary" className="ml-auto">
                {schedules.length} passage{schedules.length > 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <strong>Information :</strong> Voici l'ordre de passage de tous les groupes pour les soutenances
              </p>
            </div>

            <div className="space-y-3">
              {schedules.map((schedule) => {
                const isUserGroup = userGroup && schedule.groupId === userGroup.id;
                
                return (
                  <div
                    key={schedule.id}
                    className={`
                      flex items-center gap-4 p-4 border rounded-lg transition-all
                      ${isUserGroup 
                        ? 'border-orange-300 bg-orange-50' 
                        : 'border-gray-200 bg-white hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <p className={`font-medium ${isUserGroup ? 'text-orange-800' : ''}`}>
                          {schedule.group?.name || `Groupe ${schedule.groupId}`}
                          {isUserGroup && (
                            <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
                              Votre groupe
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ordre: {schedule.order}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {formatShortDate(schedule.startTime)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {schedule.duration} min
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {schedules.length === 0 && !loading && !error && !userGroup && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun planning disponible</h3>
            <p className="text-muted-foreground text-center mb-4">
              Le planning des soutenances n'est pas encore disponible.
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Assurez-vous d'être assigné à un groupe et attendez que votre enseignant crée le planning.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentProjectPresentationsTab;