import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { Calendar, Clock, Users, Download, FileText, GripVertical, Plus, Settings, AlertCircle, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../shared/components/ui/card';
import { Button } from '../../../../../shared/components/ui/button';
import { Badge } from '../../../../../shared/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../../../../shared/components/ui/dialog';
import { Input } from '../../../../../shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../shared/components/ui/select';
import { Alert, AlertDescription } from '../../../../../shared/components/ui/alert';
import { usePresentations } from '../../hooks/usePresentations';
import { PresentationSchedule } from '../../../../../domains/project/models/presentationModels';
import { toast } from 'sonner';

interface SortableItemProps {
  schedule: PresentationSchedule;
  formatDate: (timeString: string) => string;
  formatTime: (timeString: string) => string;
}

const SortableItem: React.FC<SortableItemProps> = ({ schedule, formatDate, formatTime }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: schedule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-4 p-4 border rounded-lg bg-white transition-all
        ${isDragging ? 'shadow-lg border-blue-300 opacity-50' : 'hover:shadow-md'}
      `}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="flex-1 grid grid-cols-4 gap-4 items-center">
        <div>
          <p className="font-medium">
            {schedule.group?.name || `Groupe ${schedule.groupId}`}
          </p>
          <p className="text-sm text-muted-foreground">
            Ordre: {schedule.order}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span className="text-sm">
            {formatDate(schedule.startTime)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-500" />
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
};

const TeacherProjectPresentationsTab: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    loading,
    error,
    createSchedule,
    updateSchedule,
    reorderSchedule,
    deleteSchedule,
    downloadSchedulePDF,
    downloadAttendanceSheet
  } = usePresentations(projectId || '');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    startTime: '',
    duration: 20,
    endTime: ''
  });
  const [scheduleMode, setScheduleMode] = useState<'duration' | 'endTime'>('duration');
  const [hasGroups, setHasGroups] = useState<boolean | null>(null);

  const checkGroups = async () => {
    try {
      const projectResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const projectResult = await projectResponse.json();

      if (projectResult.data && projectResult.data.groups) {
        setHasGroups(projectResult.data.groups.length > 0);
        return;
      }

      const groupsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/projects/${projectId}/groups`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const groupsResult = await groupsResponse.json();
      setHasGroups(groupsResult.data && groupsResult.data.length > 0);
    } catch (error) {
      console.error('Error checking groups:', error);
      setHasGroups(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      checkGroups();
    }
  }, [projectId]);

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
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return timeString;
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    try {
      const oldIndex = schedules.findIndex((item) => item.id === active.id);
      const newIndex = schedules.findIndex((item) => item.id === over.id);

      const newSchedules = arrayMove(schedules, oldIndex, newIndex);
      const groupOrder = newSchedules.map(item => item.groupId);

      await reorderSchedule(groupOrder);
    } catch (error) {
      console.error('Erreur lors du réordonnancement:', error);
      toast.error('Erreur lors du réordonnancement des soutenances');
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!projectId || projectId === 'undefined') {
        throw new Error('ID du projet invalide');
      }

      if (!scheduleForm.startTime) {
        throw new Error('Date et heure de début requises');
      }

      if (scheduleMode === 'duration' && (!scheduleForm.duration || scheduleForm.duration <= 0)) {
        throw new Error('Durée invalide');
      }

      if (scheduleMode === 'endTime' && !scheduleForm.endTime) {
        throw new Error('Heure de fin requise');
      }

      const scheduleData = scheduleMode === 'duration'
        ? { startTime: scheduleForm.startTime, duration: scheduleForm.duration }
        : { startTime: scheduleForm.startTime, endTime: scheduleForm.endTime };

      await createSchedule(scheduleData);
      setIsCreateDialogOpen(false);
      setScheduleForm({ startTime: '', duration: 20, endTime: '' });
    } catch (error) {
      console.error('Erreur lors de la création du planning:', error);
    }
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!scheduleForm.startTime) {
        throw new Error('Date et heure de début requises');
      }

      if (scheduleMode === 'duration' && (!scheduleForm.duration || scheduleForm.duration <= 0)) {
        throw new Error('Durée invalide');
      }

      if (scheduleMode === 'endTime' && !scheduleForm.endTime) {
        throw new Error('Heure de fin requise');
      }

      const scheduleData = scheduleMode === 'duration'
        ? { startTime: scheduleForm.startTime, duration: scheduleForm.duration }
        : { startTime: scheduleForm.startTime, endTime: scheduleForm.endTime };

      await updateSchedule(scheduleData);
      setIsUpdateDialogOpen(false);
      setScheduleForm({ startTime: '', duration: 20, endTime: '' });
    } catch (error) {
      console.error('Erreur lors de la modification du planning:', error);
    }
  };

  const openUpdateDialog = () => {
    try {
      if (schedules.length > 0) {
        const firstSchedule = schedules[0];
        setScheduleForm({
          startTime: new Date(firstSchedule.startTime).toISOString().slice(0, 16),
          duration: firstSchedule.duration || 20,
          endTime: new Date(firstSchedule.endTime).toISOString().slice(0, 16)
        });
        setScheduleMode('duration');
        setIsUpdateDialogOpen(true);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du dialog de modification:', error);
      toast.error('Erreur lors de l\'ouverture du formulaire de modification');
    }
  };

  const handleDeleteSchedule = async () => {
    try {
      await deleteSchedule();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

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
          <h2 className="text-2xl font-bold tracking-tight">Soutenances</h2>
          <p className="text-muted-foreground">
            Gérez le planning des soutenances de votre projet
          </p>
        </div>
        <div className="flex items-center gap-2">
          {schedules.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => downloadAttendanceSheet('group')}
                className="gap-2"
                disabled={loading}
              >
                <Users className="h-4 w-4" />
                Liste par groupes
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadAttendanceSheet('alphabetical')}
                className="gap-2"
                disabled={loading}
              >
                <FileText className="h-4 w-4" />
                Liste alphabétique
              </Button>
              <Button
                variant="outline"
                onClick={downloadSchedulePDF}
                className="gap-2"
                disabled={loading}
              >
                <Download className="h-4 w-4" />
                Télécharger PDF
              </Button>
              <Button
                variant="outline"
                onClick={openUpdateDialog}
                className="gap-2"
                disabled={loading}
              >
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Supprimer le planning</DialogTitle>
                    <DialogDescription>
                      Êtes-vous sûr de vouloir supprimer le planning des soutenances ?
                      Cette action est irréversible.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteSchedule}
                      disabled={loading}
                    >
                      Supprimer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2"
                disabled={hasGroups === false}
                title={hasGroups === false ? "Créez d'abord des groupes dans l'onglet Groupes" : ""}
              >
                <Plus className="h-4 w-4" />
                Créer un planning
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Créer un planning de soutenances</DialogTitle>
                <DialogDescription>
                  Configurez les horaires de présentation pour le projet.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSchedule} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Date et heure de début</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduleMode">Mode de planification</Label>
                  <Select
                    value={scheduleMode}
                    onValueChange={(value: 'duration' | 'endTime') => setScheduleMode(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="duration">Par durée</SelectItem>
                      <SelectItem value="endTime">Par heure de fin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {scheduleMode === 'duration' ? (
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée par présentation (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={scheduleForm.duration}
                      onChange={(e) => setScheduleForm({...scheduleForm, duration: parseInt(e.target.value)})}
                      min="5"
                      max="120"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Heure de fin</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({...scheduleForm, endTime: e.target.value})}
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">Créer le planning</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Modifier le planning de soutenances</DialogTitle>
                <DialogDescription>
                  Modifiez les horaires de présentation pour le projet.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateSchedule} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="updateStartTime">Date et heure de début</Label>
                  <Input
                    id="updateStartTime"
                    type="datetime-local"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="updateScheduleMode">Mode de planification</Label>
                  <Select
                    value={scheduleMode}
                    onValueChange={(value: 'duration' | 'endTime') => setScheduleMode(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="duration">Par durée</SelectItem>
                      <SelectItem value="endTime">Par heure de fin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {scheduleMode === 'duration' ? (
                  <div className="space-y-2">
                    <Label htmlFor="updateDuration">Durée par présentation (minutes)</Label>
                    <Input
                      id="updateDuration"
                      type="number"
                      value={scheduleForm.duration}
                      onChange={(e) => setScheduleForm({...scheduleForm, duration: parseInt(e.target.value)})}
                      min="5"
                      max="120"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="updateEndTime">Heure de fin</Label>
                    <Input
                      id="updateEndTime"
                      type="datetime-local"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({...scheduleForm, endTime: e.target.value})}
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUpdateDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Modifier le planning
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {hasGroups === false && (
        <Alert className="mb-6">
          <Users className="h-4 w-4" />
          <AlertDescription>
            <strong>Aucun groupe trouvé pour ce projet</strong>
            <br />
            Vous devez d'abord créer des groupes dans l'onglet "Groupes" avant de pouvoir organiser des soutenances.
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              Les soutenances nécessitent des groupes d'étudiants pour être organisées.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {schedules.length === 0 && !loading && !error && hasGroups !== false && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Prérequis pour créer un planning de soutenances :</strong>
            <br />
            • Le projet doit avoir des groupes créés
            <br />
            • Les étudiants doivent être assignés aux groupes
            <br />
            Vérifiez l'onglet "Groupes" avant de créer le planning.
          </AlertDescription>
        </Alert>
      )}

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun planning de soutenances</h3>
            <p className="text-muted-foreground text-center mb-6">
              Créez un planning pour organiser les présentations de vos groupes.
              <br />
              <span className="text-sm">
                Assurez-vous d'avoir créé des groupes dans l'onglet "Groupes" avant de continuer.
              </span>
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="gap-2"
              disabled={hasGroups === false}
              title={hasGroups === false ? "Créez d'abord des groupes dans l'onglet Groupes" : ""}
            >
              <Plus className="h-4 w-4" />
              Créer un planning
            </Button>
            {hasGroups === false && (
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Étape suivante :</strong> Allez dans l'onglet "Groupes" pour créer des groupes d'étudiants
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Planning des soutenances
              <Badge variant="secondary" className="ml-auto">
                {schedules.length} passage{schedules.length > 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <strong>Interface d'arrangement manuel :</strong> Glissez-déposez les éléments ci-dessous pour réorganiser l'ordre des passages
              </p>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={schedules.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <SortableItem
                      key={schedule.id}
                      schedule={schedule}
                      formatDate={formatDate}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherProjectPresentationsTab;
