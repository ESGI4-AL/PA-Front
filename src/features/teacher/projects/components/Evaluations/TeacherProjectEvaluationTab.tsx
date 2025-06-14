import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Calculator, 
  Plus, 
  Star, 
  Settings, 
  AlertCircle, 
  Edit, 
  Trash2, 
  Save,
  Eye,
  Award,
  BookOpen,
  Presentation,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useEvaluations } from '../../hooks/useEvaluations';

// Interfaces
interface EvaluationCriteria {
  id: string;
  name: string;
  description?: string;
  weight: number;
  type: 'group' | 'individual';
  evaluationType: 'deliverable' | 'report' | 'presentation';
}

interface Grade {
  id: string;
  score: number;
  comment?: string;
  isPublished: boolean;
  criteriaId: string;
  groupId?: string;
  studentId?: string;
  criteria: EvaluationCriteria;
  group?: any;
  student?: any;
}

const TeacherProjectEvaluationTab: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  
  const {
    loading,
    error,
    criteria,
    grades,
    createEvaluationCriteria,
    updateEvaluationCriteria,
    deleteEvaluationCriteria,
    gradeGroup,
    gradeStudent,
    publishProjectGrades,
    getStatistics
  } = useEvaluations(projectId || '');
  

  const [isCreateCriteriaDialogOpen, setIsCreateCriteriaDialogOpen] = useState(false);
  const [isEditCriteriaDialogOpen, setIsEditCriteriaDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  

  const [selectedCriteria, setSelectedCriteria] = useState<EvaluationCriteria | null>(null);
  const [selectedGradeTarget, setSelectedGradeTarget] = useState<any>(null);
  

  const [criteriaForm, setCriteriaForm] = useState({
    name: '',
    description: '',
    weight: 1,
    type: 'group' as 'group' | 'individual',
    evaluationType: 'deliverable' as 'deliverable' | 'report' | 'presentation'
  });
  
  const [gradeForm, setGradeForm] = useState({
    score: 0,
    comment: '',
    isPublished: false
  });


  const resetCriteriaForm = () => {
    setCriteriaForm({
      name: '',
      description: '',
      weight: 1,
      type: 'group',
      evaluationType: 'deliverable'
    });
  };

  const resetSelectedStates = () => {
    setSelectedCriteria(null);
    setSelectedGradeTarget(null);
  };


  const handleCreateCriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    

    if (!criteriaForm.name.trim()) {
      alert('Le nom du critère est obligatoire');
      return;
    }
    
    if (criteriaForm.weight <= 0) {
      alert('Le coefficient doit être positif');
      return;
    }
    
    try {
      await createEvaluationCriteria(criteriaForm);

      setIsCreateCriteriaDialogOpen(false);
      resetCriteriaForm();
    } catch (error) {
      console.error('Erreur création critère:', error);

    }
  };


  const handleEditCriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    

    if (!selectedCriteria) {
      console.error('Aucun critère sélectionné');
      return;
    }
    
    if (!criteriaForm.name.trim()) {
      alert('Le nom du critère est obligatoire');
      return;
    }
    
    if (criteriaForm.weight <= 0) {
      alert('Le coefficient doit être positif');
      return;
    }
    
    try {
      console.log('🔧 Modification du critère:', selectedCriteria.id, criteriaForm);
      
      await updateEvaluationCriteria(selectedCriteria.id, criteriaForm);
      
      console.log('✅ Modification réussie, fermeture du dialog');
      

      setIsEditCriteriaDialogOpen(false);
      resetSelectedStates();
      resetCriteriaForm();
      
      console.log('✅ États réinitialisés');
      
    } catch (error) {
      console.error('❌ Erreur modification critère:', error);

    }
  };

  const handleDeleteCriteria = async () => {
    if (!selectedCriteria) {
      console.error('Aucun critère sélectionné pour suppression');
      return;
    }
    
    try {
      await deleteEvaluationCriteria(selectedCriteria.id);
      setIsDeleteDialogOpen(false);
      resetSelectedStates();
    } catch (error) {
      console.error('Erreur suppression critère:', error);

    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCriteria || !selectedGradeTarget) {
      console.error('Critère ou cible manquant pour la notation');
      return;
    }
    
    if (gradeForm.score < 0 || gradeForm.score > 20) {
      alert('La note doit être entre 0 et 20');
      return;
    }
    
    try {
      const isGroup = selectedCriteria.type === 'group';
      
      if (isGroup) {
        await gradeGroup(selectedCriteria.id, selectedGradeTarget.id, gradeForm);
      } else {
        await gradeStudent(selectedCriteria.id, selectedGradeTarget.id, gradeForm);
      }
      
      setIsGradeDialogOpen(false);
      resetSelectedStates();
      setGradeForm({ score: 0, comment: '', isPublished: false });
    } catch (error) {
      console.error('Erreur attribution note:', error);

    }
  };

  const handlePublishGrades = async () => {
    try {
      await publishProjectGrades();
    } catch (error) {
      console.error('Erreur publication grades:', error);

    }
  };


  const openEditDialog = (criteria: EvaluationCriteria) => {
    console.log('🔧 Ouverture dialog modification pour:', criteria);
    
    if (!criteria || !criteria.id) {
      console.error('Critère invalide pour modification');
      return;
    }
    

    setSelectedCriteria(criteria);
    setCriteriaForm({
      name: criteria.name || '',
      description: criteria.description || '',
      weight: criteria.weight || 1,
      type: criteria.type || 'group',
      evaluationType: criteria.evaluationType || 'deliverable'
    });
    
    setIsEditCriteriaDialogOpen(true);
    
    console.log('✅ Dialog modification ouvert');
  };

  const openDeleteDialog = (criteria: EvaluationCriteria) => {
    if (!criteria || !criteria.id) {
      console.error('Critère invalide pour suppression');
      return;
    }
    
    setSelectedCriteria(criteria);
    setIsDeleteDialogOpen(true);
  };

  const openGradeDialog = (criteria: EvaluationCriteria, target: any) => {
    if (!criteria || !target) {
      console.error('Critère ou cible invalide pour notation');
      return;
    }
    
    setSelectedCriteria(criteria);
    setSelectedGradeTarget(target);
    
    const evaluationType = criteria.evaluationType;
    const targetType = criteria.type;
    const targetId = target.id;
    
    const existingGrade = targetType === 'group' 
      ? grades[evaluationType]?.group[targetId]?.grades?.find(g => g.criteriaId === criteria.id)
      : grades[evaluationType]?.individual[targetId]?.grades?.find(g => g.criteriaId === criteria.id);
    
    if (existingGrade) {
      setGradeForm({
        score: existingGrade.score || 0,
        comment: existingGrade.comment || '',
        isPublished: existingGrade.isPublished || false
      });
    } else {
      setGradeForm({ score: 0, comment: '', isPublished: false });
    }
    
    setIsGradeDialogOpen(true);
  };

  const closeEditDialog = () => {
    console.log('🔧 Fermeture dialog modification');
    setIsEditCriteriaDialogOpen(false);
    resetSelectedStates();
    resetCriteriaForm();
  };

  const getEvaluationTypeIcon = (type: string) => {
    switch (type) {
      case 'deliverable': return <BookOpen className="h-4 w-4" />;
      case 'report': return <Star className="h-4 w-4" />;
      case 'presentation': return <Presentation className="h-4 w-4" />;
      default: return <Calculator className="h-4 w-4" />;
    }
  };

  const getEvaluationTypeLabel = (type: string) => {
    switch (type) {
      case 'deliverable': return 'Livrable';
      case 'report': return 'Rapport';
      case 'presentation': return 'Soutenance';
      default: return type;
    }
  };

  const stats = getStatistics();


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

  if (loading && criteria.length === 0) {
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
          <h2 className="text-2xl font-bold tracking-tight">Évaluation</h2>
          <p className="text-muted-foreground">
            Gérez les critères d'évaluation et les notes du projet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handlePublishGrades}
            disabled={loading || criteria.length === 0}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Publier les notes
          </Button>
          <Dialog open={isCreateCriteriaDialogOpen} onOpenChange={setIsCreateCriteriaDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un critère
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Créer un critère d'évaluation</DialogTitle>
                <DialogDescription>
                  Définissez un nouveau critère de notation pour ce projet.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCriteria} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du critère</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Qualité du code"
                      value={criteriaForm.name}
                      onChange={(e) => setCriteriaForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Coefficient</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={criteriaForm.weight || ''}
                      onChange={(e) => setCriteriaForm(prev => ({ ...prev, weight: parseFloat(e.target.value) || 1 }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez les attentes pour ce critère..."
                    value={criteriaForm.description}
                    onChange={(e) => setCriteriaForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type d'évaluation</Label>
                    <Select 
                      value={criteriaForm.evaluationType} 
                      onValueChange={(value: any) => setCriteriaForm(prev => ({ ...prev, evaluationType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deliverable">Livrable</SelectItem>
                        <SelectItem value="report">Rapport</SelectItem>
                        <SelectItem value="presentation">Soutenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Portée</Label>
                    <Select 
                      value={criteriaForm.type} 
                      onValueChange={(value: any) => setCriteriaForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="group">Groupe</SelectItem>
                        <SelectItem value="individual">Individuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateCriteriaDialogOpen(false);
                      resetCriteriaForm();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Créer le critère
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ✅ DIALOG DE MODIFICATION AMÉLIORÉ */}
      <Dialog open={isEditCriteriaDialogOpen} onOpenChange={closeEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le critère</DialogTitle>
            <DialogDescription>
              Modifiez les paramètres de ce critère d'évaluation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCriteria} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Nom du critère</Label>
                <Input
                  id="editName"
                  value={criteriaForm.name}
                  onChange={(e) => setCriteriaForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editWeight">Coefficient</Label>
                <Input
                  id="editWeight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={criteriaForm.weight || ''}
                  onChange={(e) => setCriteriaForm(prev => ({ ...prev, weight: parseFloat(e.target.value) || 1 }))}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={criteriaForm.description}
                onChange={(e) => setCriteriaForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type d'évaluation</Label>
                <Select 
                  value={criteriaForm.evaluationType} 
                  onValueChange={(value: any) => setCriteriaForm(prev => ({ ...prev, evaluationType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deliverable">Livrable</SelectItem>
                    <SelectItem value="report">Rapport</SelectItem>
                    <SelectItem value="presentation">Soutenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Portée</Label>
                <Select 
                  value={criteriaForm.type} 
                  onValueChange={(value: any) => setCriteriaForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="group">Groupe</SelectItem>
                    <SelectItem value="individual">Individuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={closeEditDialog}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                Modifier
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer le critère</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce critère ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                resetSelectedStates();
              }}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCriteria}
              disabled={loading}
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de notation */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Noter : {selectedCriteria?.name}
            </DialogTitle>
            <DialogDescription>
              Attribuez une note pour {selectedCriteria?.type === 'group' ? 'le groupe' : 'l\'étudiant'} sélectionné.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGradeSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="score">Note (sur 20)</Label>
              <Input
                id="score"
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={gradeForm.score || ''}
                onChange={(e) => setGradeForm(prev => ({ ...prev, score: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire (optionnel)</Label>
              <Textarea
                id="comment"
                placeholder="Commentaires sur cette évaluation..."
                value={gradeForm.comment}
                onChange={(e) => setGradeForm(prev => ({ ...prev, comment: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={gradeForm.isPublished}
                onChange={(e) => setGradeForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="isPublished">Publier immédiatement cette note</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsGradeDialogOpen(false);
                  resetSelectedStates();
                  setGradeForm({ score: 0, comment: '', isPublished: false });
                }}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total critères</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCriteria}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livrables</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deliverableCriteria}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rapports</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reportCriteria}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soutenances</CardTitle>
            <Presentation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.presentationCriteria}</div>
          </CardContent>
        </Card>
      </div>

      {}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {}
      <Tabs defaultValue="criteria" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="criteria">Critères d'évaluation</TabsTrigger>
          <TabsTrigger value="grading">Attribution des notes</TabsTrigger>
        </TabsList>

        {}
        <TabsContent value="criteria" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Critères d'évaluation
                <Badge variant="secondary" className="ml-auto">
                  {criteria.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {criteria.length === 0 ? (
                <div className="text-center py-16">
                  <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Aucun critère défini</h3>
                  <p className="text-muted-foreground mb-6">
                    Commencez par créer des critères d'évaluation pour noter vos étudiants.
                  </p>
                  <Button onClick={() => setIsCreateCriteriaDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Créer le premier critère
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {['deliverable', 'report', 'presentation'].map((evaluationType) => {
                    const typeCriteria = criteria.filter(c => c.evaluationType === evaluationType);
                    if (typeCriteria.length === 0) return null;
                    
                    return (
                      <div key={evaluationType} className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                          {getEvaluationTypeIcon(evaluationType)}
                          <h4 className="font-semibold text-lg">
                            {getEvaluationTypeLabel(evaluationType)}
                          </h4>
                          <Badge variant="outline">
                            {typeCriteria.length} critère{typeCriteria.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {typeCriteria.map((criteriaItem) => (
                            <Card key={criteriaItem.id} className="border-2 hover:shadow-md transition-shadow">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center justify-between">
                                  <span className="truncate">{criteriaItem.name}</span>
                                  <Badge variant={criteriaItem.type === 'group' ? 'default' : 'secondary'} className="ml-2 shrink-0">
                                    {criteriaItem.type === 'group' ? (
                                      <Users className="h-3 w-3 mr-1" />
                                    ) : (
                                      <Award className="h-3 w-3 mr-1" />
                                    )}
                                    {criteriaItem.type === 'group' ? 'Groupe' : 'Individuel'}
                                  </Badge>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {criteriaItem.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {criteriaItem.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Coefficient:</span>
                                    <Badge variant="outline" className="font-mono">
                                      {criteriaItem.weight}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex gap-2 pt-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="flex-1"
                                      onClick={() => openEditDialog(criteriaItem)}
                                    >
                                      <Edit className="h-3 w-3 mr-1" />
                                      Modifier
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => openDeleteDialog(criteriaItem)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Attribution des notes */}
        <TabsContent value="grading" className="space-y-6">
          {criteria.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Aucun critère disponible</h3>
                  <p className="text-muted-foreground mb-6">
                    Vous devez d'abord créer des critères d'évaluation pour pouvoir attribuer des notes.
                  </p>
                  <Button onClick={() => setIsCreateCriteriaDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Créer des critères
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {['deliverable', 'report', 'presentation'].map((evaluationType) => {
                const typeCriteria = criteria.filter(c => c.evaluationType === evaluationType);
                const typeGrades = grades[evaluationType as keyof typeof grades];
                
                if (typeCriteria.length === 0) return null;
                
                return (
                  <Card key={evaluationType}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {getEvaluationTypeIcon(evaluationType)}
                        Notation - {getEvaluationTypeLabel(evaluationType)}
                        <Badge variant="outline" className="ml-auto">
                          {typeCriteria.length} critère{typeCriteria.length > 1 ? 's' : ''}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {}
                        {typeCriteria.some(c => c.type === 'group') && (
                          <div className="space-y-4">
                            <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Évaluation par groupe
                            </h5>
                            
                            {typeCriteria.filter(c => c.type === 'group').map((criteriaItem) => (
                              <div key={criteriaItem.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h6 className="font-medium">{criteriaItem.name}</h6>
                                    {criteriaItem.description && (
                                      <p className="text-sm text-muted-foreground">{criteriaItem.description}</p>
                                    )}
                                  </div>
                                  <Badge variant="outline">Coeff. {criteriaItem.weight}</Badge>
                                </div>
                                
                                <div className="space-y-2">
                                  {Object.values(typeGrades?.group || {}).length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                      <p className="text-sm">Aucun groupe disponible pour ce type d'évaluation</p>
                                    </div>
                                  ) : (
                                    Object.values(typeGrades?.group || {}).map((groupData: any) => {
                                      const groupGrade = groupData.grades?.find((g: Grade) => g.criteriaId === criteriaItem.id);
                                      const hasGrade = !!groupGrade;
                                      
                                      return (
                                        <div key={groupData.group?.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                          <div className="flex-1">
                                            <p className="font-medium">{groupData.group?.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                              {groupData.group?.members?.length || 0} membre{(groupData.group?.members?.length || 0) > 1 ? 's' : ''}
                                            </p>
                                            {hasGrade && groupGrade.comment && (
                                              <p className="text-xs text-blue-600 mt-1 bg-blue-50 p-1 rounded">
                                                💬 {groupGrade.comment}
                                              </p>
                                            )}
                                          </div>
                                          
                                          <div className="flex items-center gap-2">
                                            {hasGrade ? (
                                              <Badge 
                                                variant={groupGrade.isPublished ? "default" : "secondary"}
                                                className="mr-2"
                                              >
                                                {groupGrade.score}/20
                                                {groupGrade.isPublished && (
                                                  <Eye className="h-3 w-3 ml-1" />
                                                )}
                                              </Badge>
                                            ) : (
                                              <Badge variant="outline" className="mr-2">
                                                Non noté
                                              </Badge>
                                            )}
                                            
                                            <Button
                                              size="sm"
                                              variant={hasGrade ? "outline" : "default"}
                                              onClick={() => openGradeDialog(criteriaItem, groupData.group)}
                                            >
                                              {hasGrade ? 'Modifier' : 'Noter'}
                                            </Button>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Critères individuels */}
                        {typeCriteria.some(c => c.type === 'individual') && (
                          <div className="space-y-4">
                            <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              Évaluation individuelle
                            </h5>
                            
                            {typeCriteria.filter(c => c.type === 'individual').map((criteriaItem) => (
                              <div key={criteriaItem.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h6 className="font-medium">{criteriaItem.name}</h6>
                                    {criteriaItem.description && (
                                      <p className="text-sm text-muted-foreground">{criteriaItem.description}</p>
                                    )}
                                  </div>
                                  <Badge variant="outline">Coeff. {criteriaItem.weight}</Badge>
                                </div>
                                
                                <div className="space-y-2">
                                  {Object.values(typeGrades?.individual || {}).length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                      <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                      <p className="text-sm">Aucun étudiant disponible pour ce type d'évaluation</p>
                                    </div>
                                  ) : (
                                    Object.values(typeGrades?.individual || {}).map((studentData: any) => {
                                      const studentGrade = studentData.grades?.find((g: Grade) => g.criteriaId === criteriaItem.id);
                                      const hasGrade = !!studentGrade;
                                      
                                      return (
                                        <div key={studentData.student?.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                          <div className="flex-1">
                                            <p className="font-medium">
                                              {studentData.student?.firstName} {studentData.student?.lastName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                              {studentData.student?.email}
                                            </p>
                                            {hasGrade && studentGrade.comment && (
                                              <p className="text-xs text-blue-600 mt-1 bg-blue-50 p-1 rounded">
                                                💬 {studentGrade.comment}
                                              </p>
                                            )}
                                          </div>
                                          
                                          <div className="flex items-center gap-2">
                                            {hasGrade ? (
                                              <Badge 
                                                variant={studentGrade.isPublished ? "default" : "secondary"}
                                                className="mr-2"
                                              >
                                                {studentGrade.score}/20
                                                {studentGrade.isPublished && (
                                                  <Eye className="h-3 w-3 ml-1" />
                                                )}
                                              </Badge>
                                            ) : (
                                              <Badge variant="outline" className="mr-2">
                                                Non noté
                                              </Badge>
                                            )}
                                            
                                            <Button
                                              size="sm"
                                              variant={hasGrade ? "outline" : "default"}
                                              onClick={() => openGradeDialog(criteriaItem, studentData.student)}
                                            >
                                              {hasGrade ? 'Modifier' : 'Noter'}
                                            </Button>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherProjectEvaluationTab;