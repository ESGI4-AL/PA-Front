import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Plus, UserPlus, Settings, AlertCircle, Shuffle, Download, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useGroups } from '../../hooks/useGroups';
import { toast } from 'sonner';

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

const TeacherProjectGroupsTab: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  
  const {
    groups,
    unassignedStudents,
    project,
    loading,
    error,
    stats,
    createGroup,
    updateGroup,
    deleteGroup,
    addMemberToGroup, 
    removeMemberFromGroup,
    assignRemainingStudents
  } = useGroups(projectId || '');
  
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false); 
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false); 
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<any>(null); 
  const [studentToAssign, setStudentToAssign] = useState<any>(null); 
  

  const [groupForm, setGroupForm] = useState({
    name: '',
    memberIds: [] as string[]
  });


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

 
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== DÉBUT handleCreateGroup ===');
    console.log('Données du formulaire:', groupForm);
    
    try {
      const newGroup = await createGroup(groupForm);
      console.log('Groupe créé dans handleCreateGroup, fermeture dialog');
      
      setIsCreateGroupDialogOpen(false);
      setGroupForm({ name: '', memberIds: [] });
      
      console.log('Dialog fermé et formulaire reset');
    } catch (error) {
      console.error('Erreur dans handleCreateGroup:', error);
      
    }
  };

  const openEditDialog = (group: any) => {
    console.log('✏️ Ouverture dialog modification:', group);
    setGroupToEdit(group);
    setGroupForm({
      name: group.name,
      memberIds: Array.isArray(group.members) ? group.members.map((m: any) => m.id) : []
    });
    setIsEditGroupDialogOpen(true);
  };

  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== DÉBUT handleEditGroup ===');
    console.log('Groupe à modifier:', groupToEdit);
    console.log('Nouvelles données:', groupForm);
    
    try {
      await updateGroup(groupToEdit.id, {
        name: groupForm.name,
        memberIds: groupForm.memberIds
      });
      
      setIsEditGroupDialogOpen(false);
      setGroupToEdit(null);
      setGroupForm({ name: '', memberIds: [] });
      
      console.log('Modification terminée avec succès');
    } catch (error) {
      console.error('Erreur dans handleEditGroup:', error);
    
    }
  };

  const openAssignDialog = (student: any) => {
    console.log('Ouverture dialog assignation:', student);
    setStudentToAssign(student);
    setIsAssignDialogOpen(true);
  };

  const handleAssignToGroup = async (groupId: string) => {
    if (studentToAssign) {
      try {
        await addMemberToGroup(groupId, studentToAssign.id);
        setIsAssignDialogOpen(false);
        setStudentToAssign(null);
      } catch (error) {
       
      }
    }
  };

  const openDeleteDialog = (groupId: string) => {
    setGroupToDelete(groupId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteGroup = async () => {
    if (groupToDelete) {
      try {
        await deleteGroup(groupToDelete);
        setIsDeleteDialogOpen(false);
        setGroupToDelete(null);
      } catch (error) {
       
      }
    }
  };

  const handleAssignRemainingStudents = async () => {
    try {
      await assignRemainingStudents();
    } catch (error) {
   
    }
  };

  const handleMemberSelection = (studentId: string, isSelected: boolean) => {
    console.log('👥 Sélection membre:', studentId, isSelected ? 'ajouté' : 'retiré');
    
    setGroupForm(prev => {
      const newMemberIds = isSelected 
        ? [...prev.memberIds, studentId]
        : prev.memberIds.filter(id => id !== studentId);
      
      console.log('👥 Membres sélectionnés:', newMemberIds);
      
      return {
        ...prev,
        memberIds: newMemberIds
      };
    });
  };

  const safeGroups = Array.isArray(groups) ? groups : [];
  const safeUnassignedStudents = Array.isArray(unassignedStudents) ? unassignedStudents : [];
  const safeStats = stats || { totalStudents: 0, totalGroups: 0, unassignedCount: 0, averageGroupSize: 0 };

  console.log('RENDER - État actuel:');
  console.log('Groups:', safeGroups.length, safeGroups);
  console.log('UnassignedStudents:', safeUnassignedStudents.length, safeUnassignedStudents);
  console.log('Loading:', loading);
  console.log('Error:', error);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Groupes</h2>
          <p className="text-muted-foreground">
            Gérez les groupes d'étudiants pour ce projet
          </p>
        </div>
        <div className="flex items-center gap-2">
          {safeGroups.length > 0 && (
            <>
            
              <Button 
                variant="outline" 
                onClick={handleAssignRemainingStudents}
                disabled={safeUnassignedStudents.length === 0}
                className="gap-2"
              >
                <Shuffle className="h-4 w-4" />
                Assigner automatiquement ({safeUnassignedStudents.length})
              </Button>
            </>
          )}
          <Dialog open={isCreateGroupDialogOpen} onOpenChange={setIsCreateGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Créer un groupe
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Créer un nouveau groupe</DialogTitle>
                <DialogDescription>
                  Créez un groupe et assignez-y des étudiants optionnellement.
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
                
                {safeUnassignedStudents.length > 0 && (
                  <div className="space-y-2">
                    <Label>Étudiants à ajouter (optionnel)</Label>
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2">
                      {safeUnassignedStudents.map((student) => (
                        <div key={student.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`student-${student.id}`}
                            checked={groupForm.memberIds.includes(student.id)}
                            onCheckedChange={(checked) => 
                              handleMemberSelection(student.id, checked as boolean)
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
                        {groupForm.memberIds.length} étudiant{groupForm.memberIds.length > 1 ? 's' : ''} sélectionné{groupForm.memberIds.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}
                
                {project && (
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription>
                      Taille de groupe autorisée : {project.minGroupSize} - {project.maxGroupSize} étudiants
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
                  <Button type="submit" disabled={loading}>
                    Créer le groupe
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {}
      <Dialog open={isEditGroupDialogOpen} onOpenChange={setIsEditGroupDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le groupe</DialogTitle>
            <DialogDescription>
              Modifiez le nom du groupe et ses membres.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditGroup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editGroupName">Nom du groupe</Label>
              <Input
                id="editGroupName"
                placeholder="Ex: Groupe 1"
                value={groupForm.name}
                onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            {}
            {groupToEdit && Array.isArray(groupToEdit.members) && groupToEdit.members.length > 0 && (
              <div className="space-y-2">
                <Label>Membres actuels</Label>
                <div className="border rounded-lg p-2 space-y-1">
                  {groupToEdit.members.map((member: any) => {
                    const isStillInGroup = groupForm.memberIds.includes(member.id);
                    return (
                      <div key={member.id} className={`flex items-center justify-between p-2 rounded ${isStillInGroup ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isStillInGroup ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm">{member.firstName} {member.lastName}</span>
                        </div>
                        {isStillInGroup ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setGroupForm(prev => ({
                                ...prev,
                                memberIds: prev.memberIds.filter(id => id !== member.id)
                              }));
                            }}
                          >
                            Retirer
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => {
                              setGroupForm(prev => ({
                                ...prev,
                                memberIds: [...prev.memberIds, member.id]
                              }));
                            }}
                          >
                            Remettre
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {}
            {safeUnassignedStudents.length > 0 && (
              <div className="space-y-2">
                <Label>Ajouter des étudiants</Label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2">
                  {safeUnassignedStudents.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-student-${student.id}`}
                        checked={groupForm.memberIds.includes(student.id)}
                        onCheckedChange={(checked) => 
                          handleMemberSelection(student.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`edit-student-${student.id}`} className="text-sm cursor-pointer">
                        {student.firstName} {student.lastName}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditGroupDialogOpen(false);
                  setGroupToEdit(null);
                  setGroupForm({ name: '', memberIds: [] });
                }}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                Modifier le groupe
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer le groupe</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce groupe ? Les étudiants seront remis dans la liste des non-assignés.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setGroupToDelete(null);
              }}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteGroup}
              disabled={loading}
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assigner l'étudiant</DialogTitle>
            <DialogDescription>
              Choisissez le groupe auquel assigner {studentToAssign?.firstName} {studentToAssign?.lastName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {safeGroups.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Aucun groupe disponible. Créez d'abord un groupe.
              </p>
            ) : (
              safeGroups.map((group) => {
                const safeMembers = Array.isArray(group.members) ? group.members : [];
                const canAddMember = project ? safeMembers.length < project.maxGroupSize : true;
                
                return (
                  <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{group.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {safeMembers.length} membre{safeMembers.length > 1 ? 's' : ''}
                        {project && ` (max: ${project.maxGroupSize})`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={!canAddMember}
                      onClick={() => handleAssignToGroup(group.id)}
                    >
                      {canAddMember ? 'Assigner' : 'Complet'}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAssignDialogOpen(false);
                setStudentToAssign(null);
              }}
            >
              Annuler
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total étudiants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalStudents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groupes créés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalGroups}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sans groupe</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{safeStats.unassignedCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taille moyenne</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.averageGroupSize.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {}
      {project && (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <strong>Configuration du projet :</strong> 
            Taille des groupes : {project.minGroupSize}-{project.maxGroupSize} étudiants | 
            Formation : {project.groupFormationMethod === 'manual' ? 'Manuelle' : 
                       project.groupFormationMethod === 'free' ? 'Libre' : 'Automatique'}
            {project.groupFormationDeadline && (
              <> | Échéance : {new Date(project.groupFormationDeadline).toLocaleDateString('fr-FR')}</>
            )}
          </AlertDescription>
        </Alert>
      )}

      {}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Étudiants sans groupe
              <Badge variant="secondary" className="ml-auto">
                {safeUnassignedStudents.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {safeUnassignedStudents.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">Aucun étudiant non assigné</h4>
                {safeStats.totalStudents === 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      La promotion est vide. Ajoutez des étudiants à la promotion pour pouvoir créer des groupes.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        
                        window.location.href = `/admin/promotions/${project?.promotionId || ''}/students`;
                      }}
                    >
                      Gérer la promotion
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Tous les étudiants sont assignés à des groupes.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {safeUnassignedStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openAssignDialog(student)}
                    >
                      Assigner
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Groupes créés
                <Badge variant="secondary" className="ml-auto">
                  {safeGroups.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {safeGroups.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Aucun groupe créé</h3>
                  <p className="text-muted-foreground mb-6">
                    Commencez par créer des groupes pour organiser vos étudiants.
                  </p>
                  <Button onClick={() => setIsCreateGroupDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Créer le premier groupe
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safeGroups.map((group) => {
                   
                    const safeMembers = Array.isArray(group.members) ? group.members : [];
                    
                    return (
                      <Card key={group.id} className="border-2 hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center justify-between">
                            {group.name}
                            <Badge variant="outline" className={
                              safeMembers.length < (project?.minGroupSize || 1) ? "border-red-200 text-red-600" :
                              safeMembers.length > (project?.maxGroupSize || 10) ? "border-orange-200 text-orange-600" :
                              "border-green-200 text-green-600"
                            }>
                              {safeMembers.length} membre{safeMembers.length > 1 ? 's' : ''}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 mb-4">
                            {safeMembers.length === 0 ? (
                              <p className="text-sm text-muted-foreground italic">Aucun membre assigné</p>
                            ) : (
                              safeMembers.map((member) => (
                                <div key={member.id} className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium truncate">
                                        {member.firstName} {member.lastName}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {member.email}
                                      </p>
                                    </div>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => removeMemberFromGroup(group.id, member.id)}
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))
                            )}
                          </div>
                          
                          {}
                          {project && (
                            <div className="mb-4">
                              {safeMembers.length < project.minGroupSize && (
                                <Alert variant="destructive" className="py-2">
                                  <AlertCircle className="h-3 w-3" />
                                  <AlertDescription className="text-xs">
                                    Groupe trop petit (min: {project.minGroupSize})
                                  </AlertDescription>
                                </Alert>
                              )}
                              {safeMembers.length > project.maxGroupSize && (
                                <Alert variant="destructive" className="py-2">
                                  <AlertCircle className="h-3 w-3" />
                                  <AlertDescription className="text-xs">
                                    Groupe trop grand (max: {project.maxGroupSize})
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => openEditDialog(group)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Modifier
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => openDeleteDialog(group.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Supprimer
                            </Button>
                          </div>
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

export default TeacherProjectGroupsTab;