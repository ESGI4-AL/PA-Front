import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Plus, UserPlus, Settings, AlertCircle, Info, Calendar, Lock, UserMinus, RefreshCcw, TriangleAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useStudentGroups } from '../../hooks/useStudentGroups';
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

const Checkbox = ({ id, checked, onCheckedChange, ...props }: any) => (
  <input
    type="checkbox"
    id={id}
    checked={checked || false}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
    {...props}
  />
);

const StudentProjectGroupsTab: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();

  const {
    project,
    groups,
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
  } = useStudentGroups(projectId || '');

  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [isJoinGroupDialogOpen, setIsJoinGroupDialogOpen] = useState(false);
  const [isLeaveGroupDialogOpen, setIsLeaveGroupDialogOpen] = useState(false);
  const [groupToJoin, setGroupToJoin] = useState<Group | null>(null);

  const [groupForm, setGroupForm] = useState({
    name: '',
    memberIds: [] as string[]
  });

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupForm.name.trim()) {
      toast.error('Le nom du groupe est requis');
      return;
    }

    const totalMembers = 1 + groupForm.memberIds.length; // +1 pour l'utilisateur actuel

    if (project && totalMembers > project.maxGroupSize) {
      toast.error(`Le groupe ne peut pas avoir plus de ${project.maxGroupSize} membres`);
      return;
    }

    try {
      await createGroup(groupForm);
      toast.success('Groupe créé avec succès');
      setIsCreateGroupDialogOpen(false);
      setGroupForm({ name: '', memberIds: [] });
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du groupe');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!groupId) {
      toast.error('Groupe non spécifié');
      return;
    }

    try {
      await joinGroupAction(groupId);
      toast.success('Vous avez rejoint le groupe avec succès');
      setIsJoinGroupDialogOpen(false);
      setGroupToJoin(null);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout au groupe');
    }
  };

  const handleLeaveGroup = async () => {
    if (!userGroup) {
      toast.error('Vous n\'êtes dans aucun groupe');
      return;
    }

    try {
      await leaveGroupAction();
      toast.success('Vous avez quitté le groupe avec succès');
      setIsLeaveGroupDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sortie du groupe');
    }
  };

  const handleMemberSelection = (studentId: string, isSelected: boolean) => {
    setGroupForm(prev => {
      const newMemberIds = isSelected
        ? [...prev.memberIds, studentId]
        : prev.memberIds.filter(id => id !== studentId);

      return {
        ...prev,
        memberIds: newMemberIds
      };
    });
  };

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

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
          <h2 className="text-2xl font-bold tracking-tight">Groupes</h2>
          <p className="text-muted-foreground">
            Consultez et gérez votre participation aux groupes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await refreshData();
                toast.success('Groupes actualisés avec succès');
              } catch (error) {
                toast.error('Erreur lors de l\'actualisation des données');
              }
            }}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>

          {/* Quitter le groupe */}
          {userGroup && canModifyGroup() && (
            <Dialog open={isLeaveGroupDialogOpen} onOpenChange={setIsLeaveGroupDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2" disabled={leaving}>
                  <UserMinus className="h-4 w-4" />
                  {leaving ? 'Quitter...' : 'Quitter le groupe'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Quitter le groupe</DialogTitle>
                  <DialogDescription>
                    Êtes-vous sûr de vouloir quitter le groupe "{userGroup.name}" ?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Cette action est irréversible. Vous devrez demander à rejoindre un autre groupe ou en créer un nouveau.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsLeaveGroupDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleLeaveGroup}
                      disabled={leaving}
                    >
                      {leaving ? 'Quitter...' : 'Quitter le groupe'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Créer un groupe */}
          {canCreateGroup() && (
            <Dialog open={isCreateGroupDialogOpen} onOpenChange={setIsCreateGroupDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" disabled={creating}>
                  <Plus className="h-4 w-4" />
                  {creating ? 'Création...' : 'Créer un groupe'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau groupe</DialogTitle>
                  <DialogDescription>
                    Créez votre groupe et invitez d'autres étudiants.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Nom du groupe</Label>
                    <Input
                      id="groupName"
                      placeholder="Ex: Groupe 1"
                      value={groupForm.name}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  {availableStudents && availableStudents.length > 0 && (
                    <div className="space-y-2">
                      <Label>Inviter des étudiants (optionnel)</Label>
                      <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2">
                        {availableStudents
                          .filter(student => student.id !== currentUser.id)
                          .map((student) => (
                            <div key={student.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`student-${student.id}`}
                                checked={groupForm.memberIds.includes(student.id)}
                                onCheckedChange={(checked: boolean) =>
                                  handleMemberSelection(student.id, checked)
                                }
                              />
                              <Label htmlFor={`student-${student.id}`} className="text-sm cursor-pointer">
                                {student.firstName} {student.lastName}
                              </Label>
                            </div>
                          ))}
                      </div>
                      {groupForm.memberIds.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {groupForm.memberIds.length + 1} étudiant{(groupForm.memberIds.length + 1) > 1 ? 's' : ''} au total (vous inclus)
                        </p>
                      )}
                    </div>
                  )}

                  {project && (
                    <Alert>
                      <Settings className="h-4 w-4" />
                      <AlertDescription>
                        Taille de groupe autorisée : {project.minGroupSize} - {project.maxGroupSize} étudiants<br/>
                        Taille actuelle : {groupForm.memberIds.length + 1} étudiant{(groupForm.memberIds.length + 1) > 1 ? 's' : ''}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateGroupDialogOpen(false);
                        setGroupForm({ name: '', memberIds: [] });
                      }}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={loading || creating}>
                      {creating ? 'Création...' : 'Créer le groupe'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Joindre le groupe */}
      <Dialog open={isJoinGroupDialogOpen} onOpenChange={setIsJoinGroupDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rejoindre le groupe</DialogTitle>
            <DialogDescription>
              Voulez-vous rejoindre le groupe "{groupToJoin?.name}" ?
            </DialogDescription>
          </DialogHeader>
          {groupToJoin && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium">{groupToJoin.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {groupToJoin.members?.length || 0} membre{(groupToJoin.members?.length || 0) > 1 ? 's' : ''}
                  {project && ` (max: ${project.maxGroupSize})`}
                </p>
                <div className="mt-2 space-y-1">
                  {groupToJoin.members?.map(member => (
                    <p key={member.id} className="text-xs text-muted-foreground">
                      • {member.firstName} {member.lastName}
                    </p>
                  )) || <p className="text-xs text-muted-foreground">Aucun membre</p>}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsJoinGroupDialogOpen(false);
                    setGroupToJoin(null);
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={() => handleJoinGroup(groupToJoin.id)} disabled={joining}>
                  {joining ? 'Rejoindre...' : 'Rejoindre'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Configuration du projet */}
      {project && (
        <Alert>
          <Settings className="!h-5 !w-5" style={{ width: '24px', height: '24px' }} />
          <AlertDescription>
            <span className="text-black text-base font-semibold">Configurations du projet</span>
            Taille des groupes : {project.minGroupSize}-{project.maxGroupSize} étudiants |
            Formation : {project.groupFormationMethod === 'manual' ? 'Manuelle (par le professeur)' :
                       project.groupFormationMethod === 'free' ? 'Libre' : 'Automatique'}
            {project.groupFormationDeadline && (
              <> | Échéance : {new Date(project.groupFormationDeadline).toLocaleDateString('fr-FR')}</>
            )}
          </AlertDescription>
        </Alert>
      )}

      {project && project.groupFormationMethod !== 'free' && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            {project.groupFormationMethod === 'manual'
              ? 'Les groupes sont formés par le professeur. Vous ne pouvez pas créer ou rejoindre de groupes.'
              : 'Les groupes sont formés automatiquement par le système. Vous ne pouvez pas créer ou rejoindre de groupes.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Deadline Alert */}
      {project && project.groupFormationDeadline && new Date() > new Date(project.groupFormationDeadline) && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>
            La date limite de formation des groupes est passée ({new Date(project.groupFormationDeadline).toLocaleDateString('fr-FR')}).
            Vous ne pouvez plus modifier les groupes.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Étudiants sans groupe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Étudiants sans groupe
              <Badge variant="secondary" className="ml-auto">
                {stats.unassignedCount}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!availableStudents || availableStudents.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">
                  {stats.totalStudents === 0 ? 'Aucun étudiant' : 'Tous les étudiants sont assignés'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {stats.totalStudents === 0
                    ? 'Aucun étudiant trouvé dans cette promotion.'
                    : 'Tous les étudiants de la promotion sont dans des groupes.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium">
                        {student.firstName} {student.lastName}
                        {student.id === currentUser.id && (
                          <span className="text-xs text-muted-foreground ml-1">(vous)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tous les groupes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tous les groupes
                <Badge variant="secondary" className="ml-auto">
                  {stats.totalGroups}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!groups || groups.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Aucun groupe créé</h3>
                  <p className="text-muted-foreground mb-6">
                    Aucun groupe n'a encore été créé pour ce projet.
                  </p>
                  {canCreateGroup() && (
                    <Button onClick={() => setIsCreateGroupDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Créer le premier groupe
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groups.map((group) => {
                    const memberCount = group.members?.length || 0;
                    const canJoin = canJoinGroup() &&
                                   !userGroup &&
                                   project &&
                                   memberCount < project.maxGroupSize;

                    return (
                      <Card key={group.id} className="border-2 hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center justify-between">
                            {group.name}
                            <Badge variant="outline" className={
                              project && memberCount < project.minGroupSize ? "border-red-200 text-red-600" :
                              project && memberCount > project.maxGroupSize ? "border-orange-200 text-orange-600" :
                              "border-green-200 text-green-600"
                            }>
                              {memberCount} membre{memberCount > 1 ? 's' : ''}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 mb-4">
                            {!group.members || group.members.length === 0 ? (
                              <p className="text-sm text-muted-foreground italic">Aucun membre</p>
                            ) : (
                              group.members.map((member) => (
                                <div key={member.id} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">
                                      {member.firstName} {member.lastName}
                                      {member.id === currentUser.id && (
                                        <span className="text-xs text-muted-foreground ml-1">(vous)</span>
                                      )}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {member.email}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Indicateurs de taille de groupe */}
                          {project && (
                            <div className="mb-4">
                              {memberCount < project.minGroupSize && (
                                <Alert variant="destructive" className="py-2">
                                  <AlertCircle className="h-3 w-3" />
                                  <AlertDescription className="text-xs">
                                    Groupe incomplet ({memberCount}/{project.minGroupSize} min)
                                  </AlertDescription>
                                </Alert>
                              )}
                              {memberCount > project.maxGroupSize && (
                                <Alert variant="destructive" className="py-2">
                                  <AlertCircle className="h-3 w-3" />
                                  <AlertDescription className="text-xs">
                                    Groupe trop grand ({memberCount}/{project.maxGroupSize} max)
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          )}

                          {canJoin && (
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setGroupToJoin(group);
                                setIsJoinGroupDialogOpen(true);
                              }}
                              disabled={joining}
                            >
                              {joining ? 'Rejoindre...' : 'Rejoindre ce groupe'}
                            </Button>
                          )}

                          {userGroup?.id === group.id && (
                            <Badge variant="secondary" className="w-full justify-center">
                              Votre groupe
                            </Badge>
                          )}

                          {!canJoin && !userGroup && project && memberCount >= project.maxGroupSize && (
                            <Badge variant="outline" className="w-full justify-center">
                              Groupe complet
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentProjectGroupsTab;
