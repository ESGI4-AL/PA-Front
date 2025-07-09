import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  GitBranch, 
  Archive, 
  Settings, 
  BarChart3,
  Users,
  FileText,
  AlertCircle,
  Target,
  Timer,
  Star,
  Save,
  Send
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
import { useDeliverables } from '../../hooks/useDeliverables';
import { useEvaluations } from '../../hooks/useEvaluations';
import { toast } from 'sonner';

const Switch = ({ checked, onCheckedChange, ...props }: any) => (
  <input
    type="checkbox"
    checked={checked || false}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    className="w-9 h-5 bg-gray-200 rounded-full relative appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 checked:bg-blue-600"
    {...props}
  />
);

const Progress = ({ value = 0, className = "", ...props }: any) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`} {...props}>
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

interface ValidationRule {
  id?: string;
  type: 'file_size' | 'file_presence' | 'folder_structure' | 'file_content';
  rule: any;
  description: string;
}

interface DeliverableForm {
  name: string;
  description: string;
  type: 'archive' | 'git';
  deadline: string;
  allowLateSubmission: boolean;
  latePenaltyPerHour: number;
  rules: ValidationRule[];
}

interface GradeInput {
  score: number;
  comment?: string;
  isPublished?: boolean;
}

const TeacherProjectDeliverablesTab: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  
  const {
    deliverables,
    loading,
    error,
    stats,
    createDeliverable,
    updateDeliverable,
    deleteDeliverable,
    analyzeSimilarity,
    getDeliverableSummary
  } = useDeliverables(projectId || '');

  const {
    criteria,
    grades,
    loading: evaluationLoading,
    gradeGroup,
    gradeStudent,
    createEvaluationCriteria
  } = useEvaluations(projectId || '');
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
  const [isCreateCriteriaDialogOpen, setIsCreateCriteriaDialogOpen] = useState(false);
  
  const [deliverableToEdit, setDeliverableToEdit] = useState<any>(null);
  const [deliverableToDelete, setDeliverableToDelete] = useState<string | null>(null);
  const [selectedDeliverableSummary, setSelectedDeliverableSummary] = useState<any>(null);
  const [selectedDeliverableForGrading, setSelectedDeliverableForGrading] = useState<any>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const [deliverableForm, setDeliverableForm] = useState<DeliverableForm>({
    name: '',
    description: '',
    type: 'archive',
    deadline: '',
    allowLateSubmission: false,
    latePenaltyPerHour: 0,
    rules: []
  });

  const [newRule, setNewRule] = useState<ValidationRule>({
    type: 'file_size',
    rule: {},
    description: ''
  });

  // État pour la création de critères
  const [newCriteria, setNewCriteria] = useState({
    name: '',
    description: '',
    weight: 1,
    type: 'group' as 'group' | 'individual',
    evaluationType: 'deliverable' as 'deliverable' | 'report' | 'presentation'
  });

  // État pour la notation
  const [gradeInputs, setGradeInputs] = useState<{[key: string]: GradeInput}>({});

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

  const handleCreateDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDeliverable(deliverableForm);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Livrable créé avec succès');
    } catch (error) {
      console.error('Erreur création livrable:', error);
      toast.error('Erreur lors de la création');
    }
  };

  const handleEditDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableToEdit) return;
    
    try {
      await updateDeliverable(deliverableToEdit.id, deliverableForm);
      setIsEditDialogOpen(false);
      setDeliverableToEdit(null);
      resetForm();
      toast.success('Livrable modifié avec succès');
    } catch (error) {
      console.error('Erreur modification livrable:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDeleteDeliverable = async () => {
    if (!deliverableToDelete) return;
    
    try {
      await deleteDeliverable(deliverableToDelete);
      setIsDeleteDialogOpen(false);
      setDeliverableToDelete(null);
      toast.success('Livrable supprimé avec succès');
    } catch (error) {
      console.error('Erreur suppression livrable:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleAnalyzeSimilarity = async (deliverableId: string) => {
    setAnalyzingId(deliverableId);
    try {
      const result = await analyzeSimilarity(deliverableId);
      toast.success(`Analyse terminée: ${result.suspiciousPairs?.length || 0} paires suspectes détectées`);
    } catch (error) {
      console.error('Erreur analyse similarité:', error);
      toast.error('Erreur lors de l\'analyse');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleViewSummary = async (deliverable: any) => {
    try {
      const summary = await getDeliverableSummary(deliverable.id);
      setSelectedDeliverableSummary(summary);
      setIsSummaryDialogOpen(true);
    } catch (error) {
      console.error('Erreur récupération résumé:', error);
      toast.error('Erreur lors de la récupération du résumé');
    }
  };

  const handleOpenGrading = async (deliverable: any) => {
    try {
      const summary = await getDeliverableSummary(deliverable.id);
      setSelectedDeliverableForGrading(summary);
      setIsGradingDialogOpen(true);
    } catch (error) {
      console.error('Erreur récupération données notation:', error);
      toast.error('Erreur lors de la récupération des données');
    }
  };

  const handleCreateCriteria = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEvaluationCriteria(newCriteria);
      setIsCreateCriteriaDialogOpen(false);
      setNewCriteria({
        name: '',
        description: '',
        weight: 1,
        type: 'group',
        evaluationType: 'deliverable'
      });
      toast.success('Critère créé avec succès');
    } catch (error) {
      console.error('Erreur création critère:', error);
      toast.error('Erreur lors de la création du critère');
    }
  };

  const handleGradeSubmit = async (criteriaId: string, groupId: string, studentId?: string) => {
    const gradeKey = `${criteriaId}-${groupId}${studentId ? `-${studentId}` : ''}`;
    const gradeData = gradeInputs[gradeKey];
    
    if (!gradeData || gradeData.score < 0 || gradeData.score > 20) {
      toast.error('Veuillez saisir une note valide (0-20)');
      return;
    }

    try {
      if (studentId) {
        await gradeStudent(criteriaId, studentId, gradeData);
      } else {
        await gradeGroup(criteriaId, groupId, gradeData);
      }
      
      // Réinitialiser le champ de saisie
      setGradeInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[gradeKey];
        return newInputs;
      });
      
      toast.success('Note enregistrée avec succès');
    } catch (error) {
      console.error('Erreur attribution note:', error);
      toast.error('Erreur lors de l\'attribution de la note');
    }
  };

  const openEditDialog = (deliverable: any) => {
    setDeliverableToEdit(deliverable);
    setDeliverableForm({
      name: deliverable.name,
      description: deliverable.description || '',
      type: deliverable.type,
      deadline: new Date(deliverable.deadline).toISOString().slice(0, 16),
      allowLateSubmission: deliverable.allowLateSubmission,
      latePenaltyPerHour: deliverable.latePenaltyPerHour || 0,
      rules: deliverable.rules || []
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setDeliverableForm({
      name: '',
      description: '',
      type: 'archive',
      deadline: '',
      allowLateSubmission: false,
      latePenaltyPerHour: 0,
      rules: []
    });
    setNewRule({
      type: 'file_size',
      rule: {},
      description: ''
    });
  };

  const addRule = () => {
    if (!newRule.description) return;
    
    setDeliverableForm(prev => ({
      ...prev,
      rules: [...prev.rules, { ...newRule, id: Date.now().toString() }]
    }));
    
    setNewRule({
      type: 'file_size',
      rule: {},
      description: ''
    });
  };

  const removeRule = (index: number) => {
    setDeliverableForm(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const getRuleSpecificFields = () => {
    switch (newRule.type) {
      case 'file_size':
        return (
          <div className="space-y-2">
            <Label>Taille maximale (en octets)</Label>
            <Input
              type="number"
              placeholder="10485760"
              value={newRule.rule.maxSize || ''}
              onChange={(e) => setNewRule(prev => ({
                ...prev,
                rule: { ...prev.rule, maxSize: parseInt(e.target.value) || 0 }
              }))}
            />
            <p className="text-xs text-muted-foreground">
              Exemple: 10485760 = 10 MB
            </p>
          </div>
        );
      case 'file_presence':
        return (
          <div className="space-y-2">
            <Label>Fichiers requis (un par ligne)</Label>
            <Textarea
              placeholder="README.md&#10;package.json&#10;src/index.js"
              value={newRule.rule.files?.join('\n') || ''}
              onChange={(e) => setNewRule(prev => ({
                ...prev,
                rule: { ...prev.rule, files: e.target.value.split('\n').filter(f => f.trim()) }
              }))}
            />
          </div>
        );
      case 'folder_structure':
        return (
          <div className="space-y-2">
            <Label>Structure de dossiers (JSON)</Label>
            <Textarea
              placeholder='{"src": ["index.js"], "docs": ["README.md"]}'
              value={JSON.stringify(newRule.rule.structure || {}, null, 2)}
              onChange={(e) => {
                try {
                  const structure = JSON.parse(e.target.value);
                  setNewRule(prev => ({
                    ...prev,
                    rule: { ...prev.rule, structure }
                  }));
                } catch (error) {
                 
                }
              }}
            />
          </div>
        );
      case 'file_content':
        return (
          <div className="space-y-2">
            <Label>Expression régulière</Label>
            <Input
              placeholder="^import.*React"
              value={newRule.rule.pattern || ''}
              onChange={(e) => setNewRule(prev => ({
                ...prev,
                rule: { ...prev.rule, pattern: e.target.value }
              }))}
            />
            <Label>Fichier à vérifier</Label>
            <Input
              placeholder="src/App.js"
              value={newRule.rule.filePath || ''}
              onChange={(e) => setNewRule(prev => ({
                ...prev,
                rule: { ...prev.rule, filePath: e.target.value }
              }))}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const getDeliverableIcon = (type: string) => {
    return type === 'git' ? <GitBranch className="h-4 w-4" /> : <Archive className="h-4 w-4" />;
  };

  const getStatusBadge = (deliverable: any) => {
    const now = new Date();
    const deadline = new Date(deliverable.deadline);
    const isExpired = now > deadline;
    
    if (isExpired) {
      return <Badge variant="destructive">Expiré</Badge>;
    } else if (deadline.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return <Badge variant="secondary">Bientôt</Badge>;
    } else {
      return <Badge variant="default">Actif</Badge>;
    }
  };

  const getDeliverableCriteria = () => {
    return criteria.filter(c => c.evaluationType === 'deliverable');
  };

  const getExistingGrade = (criteriaId: string, groupId: string, studentId?: string) => {
    const evaluationType = 'deliverable';
    const type = studentId ? 'individual' : 'group';
    const targetId = studentId || groupId;
    
    if (grades[evaluationType] && grades[evaluationType][type] && grades[evaluationType][type][targetId]) {
      const gradesForTarget = grades[evaluationType][type][targetId].grades;
      return gradesForTarget.find(g => g.criteriaId === criteriaId);
    }
    return null;
  };

  const safeDeliverables = Array.isArray(deliverables) ? deliverables : [];
  const safeStats = stats || { 
    totalDeliverables: 0, 
    activeDeliverables: 0, 
    expiredDeliverables: 0, 
    submissionsRate: 0 
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
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Livrables</h2>
          <p className="text-muted-foreground">
            Gérez les livrables et leurs règles de validation pour ce projet
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateCriteriaDialogOpen} onOpenChange={setIsCreateCriteriaDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Star className="h-4 w-4" />
                Créer critère
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Créer un critère de notation</DialogTitle>
                <DialogDescription>
                  Définissez un nouveau critère pour évaluer les livrables.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCriteria} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="criteriaName">Nom du critère</Label>
                  <Input
                    id="criteriaName"
                    placeholder="Qualité du code"
                    value={newCriteria.name}
                    onChange={(e) => setNewCriteria(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="criteriaDescription">Description</Label>
                  <Textarea
                    id="criteriaDescription"
                    placeholder="Description détaillée du critère..."
                    value={newCriteria.description}
                    onChange={(e) => setNewCriteria(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="criteriaWeight">Poids</Label>
                    <Input
                      id="criteriaWeight"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={newCriteria.weight}
                      onChange={(e) => setNewCriteria(prev => ({ ...prev, weight: parseFloat(e.target.value) || 1 }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="criteriaType">Type</Label>
                    <Select 
                      value={newCriteria.type} 
                      onValueChange={(value: 'group' | 'individual') => 
                        setNewCriteria(prev => ({ ...prev, type: value }))
                      }
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
                    onClick={() => setIsCreateCriteriaDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={evaluationLoading}>
                    Créer le critère
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Créer un livrable
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau livrable</DialogTitle>
                <DialogDescription>
                  Définissez les paramètres et règles de validation pour ce livrable.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateDeliverable} className="space-y-6">
                {/* Informations de base */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du livrable</Label>
                    <Input
                      id="name"
                      placeholder="TP1 - Application React"
                      value={deliverableForm.name}
                      onChange={(e) => setDeliverableForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select 
                      value={deliverableForm.type} 
                      onValueChange={(value: 'archive' | 'git') => 
                        setDeliverableForm(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="archive">
                          <div className="flex items-center gap-2">
                            <Archive className="h-4 w-4" />
                            Archive (.zip, .tar.gz)
                          </div>
                        </SelectItem>
                        <SelectItem value="git">
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4" />
                            Dépôt Git
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description détaillée du livrable..."
                    value={deliverableForm.description}
                    onChange={(e) => setDeliverableForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Date limite</Label>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={deliverableForm.deadline}
                      onChange={(e) => setDeliverableForm(prev => ({ ...prev, deadline: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="penalty">Malus par heure de retard</Label>
                    <Input
                      id="penalty"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="0.5"
                      value={deliverableForm.latePenaltyPerHour}
                      onChange={(e) => setDeliverableForm(prev => ({ 
                        ...prev, 
                        latePenaltyPerHour: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowLate"
                    checked={deliverableForm.allowLateSubmission}
                    onCheckedChange={(checked) => 
                      setDeliverableForm(prev => ({ ...prev, allowLateSubmission: checked }))
                    }
                  />
                  <Label htmlFor="allowLate">Autoriser les soumissions en retard</Label>
                </div>

                {/* Règles de validation */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Règles de validation</Label>
                    <Badge variant="secondary">
                      {deliverableForm.rules.length} règle{deliverableForm.rules.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {deliverableForm.rules.length > 0 && (
                    <div className="space-y-2">
                      {deliverableForm.rules.map((rule, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <Badge variant="outline" className="mb-1">
                              {rule.type.replace('_', ' ')}
                            </Badge>
                            <p className="text-sm">{rule.description}</p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeRule(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Card className="p-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Ajouter une règle</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Type de règle</Label>
                          <Select 
                            value={newRule.type} 
                            onValueChange={(value: any) => 
                              setNewRule(prev => ({ ...prev, type: value, rule: {} }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="file_size">Taille de fichier</SelectItem>
                              <SelectItem value="file_presence">Présence de fichiers</SelectItem>
                              <SelectItem value="folder_structure">Structure de dossiers</SelectItem>
                              <SelectItem value="file_content">Contenu de fichier</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            placeholder="Description de la règle"
                            value={newRule.description}
                            onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </div>

                      {getRuleSpecificFields()}

                      <Button
                        type="button"
                        size="sm"
                        onClick={addRule}
                        disabled={!newRule.description}
                        className="w-full"
                      >
                        Ajouter la règle
                      </Button>
                    </div>
                  </Card>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Créer le livrable
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total livrables</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalDeliverables}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{safeStats.activeDeliverables}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirés</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{safeStats.expiredDeliverables}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de soumission</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.submissionsRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Erreurs */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Liste des livrables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Liste des livrables
            <Badge variant="secondary" className="ml-auto">
              {safeDeliverables.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {safeDeliverables.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun livrable créé</h3>
              <p className="text-muted-foreground mb-6">
                Commencez par créer des livrables pour ce projet.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Créer le premier livrable
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {safeDeliverables.map((deliverable) => {
                const deadline = new Date(deliverable.deadline);
                const now = new Date();
                const isExpired = now > deadline;
                const timeLeft = deadline.getTime() - now.getTime();
                const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
                
                return (
                  <Card key={deliverable.id} className="border-2 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getDeliverableIcon(deliverable.type)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{deliverable.name}</CardTitle>
                            {deliverable.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {deliverable.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-4 w-4" />
                                {deadline.toLocaleDateString('fr-FR')} à {deadline.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              {!isExpired && (
                                <div className="flex items-center gap-1 text-sm text-orange-600">
                                  <Clock className="h-4 w-4" />
                                  {daysLeft > 0 ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''}` : 'Aujourd\'hui'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(deliverable)}
                          <Badge variant="outline">
                            {deliverable.type === 'git' ? 'Git' : 'Archive'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewSummary(deliverable)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Résumé
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenGrading(deliverable)}
                            className="gap-1"
                          >
                            <Star className="h-4 w-4" />
                            Noter
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAnalyzeSimilarity(deliverable.id)}
                            disabled={analyzingId === deliverable.id}
                            className="gap-1"
                          >
                            {analyzingId === deliverable.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : (
                              <BarChart3 className="h-4 w-4" />
                            )}
                            Analyser plagiat
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(deliverable)}
                            className="gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setDeliverableToDelete(deliverable.id);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer le livrable</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce livrable ? Cette action est irréversible et supprimera toutes les soumissions associées.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeliverableToDelete(null);
              }}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteDeliverable}
              disabled={loading}
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le livrable</DialogTitle>
            <DialogDescription>
              Modifiez les paramètres et règles de validation pour ce livrable.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditDeliverable} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Nom du livrable</Label>
                <Input
                  id="editName"
                  value={deliverableForm.name}
                  onChange={(e) => setDeliverableForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editType">Type</Label>
                <Select 
                  value={deliverableForm.type} 
                  onValueChange={(value: 'archive' | 'git') => 
                    setDeliverableForm(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="archive">
                      <div className="flex items-center gap-2">
                        <Archive className="h-4 w-4" />
                        Archive (.zip, .tar.gz)
                      </div>
                    </SelectItem>
                    <SelectItem value="git">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        Dépôt Git
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={deliverableForm.description}
                onChange={(e) => setDeliverableForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editDeadline">Date limite</Label>
                <Input
                  id="editDeadline"
                  type="datetime-local"
                  value={deliverableForm.deadline}
                  onChange={(e) => setDeliverableForm(prev => ({ ...prev, deadline: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPenalty">Malus par heure de retard</Label>
                <Input
                  id="editPenalty"
                  type="number"
                  min="0"
                  step="0.1"
                  value={deliverableForm.latePenaltyPerHour}
                  onChange={(e) => setDeliverableForm(prev => ({ 
                    ...prev, 
                    latePenaltyPerHour: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="editAllowLate"
                checked={deliverableForm.allowLateSubmission}
                onCheckedChange={(checked) => 
                  setDeliverableForm(prev => ({ ...prev, allowLateSubmission: checked }))
                }
              />
              <Label htmlFor="editAllowLate">Autoriser les soumissions en retard</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setDeliverableToEdit(null);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                Modifier le livrable
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de résumé */}
      <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Résumé des soumissions</DialogTitle>
            <DialogDescription>
              Détails des soumissions pour ce livrable
            </DialogDescription>
          </DialogHeader>
          {selectedDeliverableSummary && (
            <div className="space-y-6">
              {/* Informations du livrable */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedDeliverableSummary.deliverable.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {selectedDeliverableSummary.deliverable.type}
                    </div>
                    <div>
                      <span className="font-medium">Date limite:</span> {new Date(selectedDeliverableSummary.deliverable.deadline).toLocaleString('fr-FR')}
                    </div>
                    <div>
                      <span className="font-medium">Retard autorisé:</span> {selectedDeliverableSummary.deliverable.allowLateSubmission ? 'Oui' : 'Non'}
                    </div>
                    <div>
                      <span className="font-medium">Malus/heure:</span> {selectedDeliverableSummary.deliverable.latePenaltyPerHour} pts
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Règles de validation */}
              {selectedDeliverableSummary.rules && selectedDeliverableSummary.rules.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Règles de validation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedDeliverableSummary.rules.map((rule: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{rule.type.replace('_', ' ')}</Badge>
                          </div>
                          <p className="text-sm">{rule.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tableau des soumissions par groupe */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Soumissions par groupe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedDeliverableSummary.groupSummaries?.map((groupSummary: any) => (
                      <div key={groupSummary.group.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{groupSummary.group.name}</h4>
                          {groupSummary.submission ? (
                            <div className="flex items-center gap-2">
                              {groupSummary.submission.isLate ? (
                                <Badge variant="destructive">En retard ({groupSummary.submission.hoursLate}h)</Badge>
                              ) : (
                                <Badge variant="default">À temps</Badge>
                              )}
                              {groupSummary.submission.validationStatus === 'valid' ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">Valide</Badge>
                              ) : groupSummary.submission.validationStatus === 'invalid' ? (
                                <Badge variant="destructive">Invalide</Badge>
                              ) : (
                                <Badge variant="secondary">En attente</Badge>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline">Non soumis</Badge>
                          )}
                        </div>
                        
                        {groupSummary.submission && (
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Date de soumission:</span> {new Date(groupSummary.submission.submissionDate).toLocaleString('fr-FR')}
                            </div>
                            
                            {groupSummary.submission.similarityScore !== null && (
                              <div>
                                <span className="font-medium">Score de similarité:</span> 
                                <span className={`ml-2 font-medium ${
                                  groupSummary.submission.similarityScore > 0.8 ? 'text-red-600' :
                                  groupSummary.submission.similarityScore > 0.6 ? 'text-orange-600' :
                                  'text-green-600'
                                }`}>
                                  {(groupSummary.submission.similarityScore * 100).toFixed(1)}%
                                </span>
                              </div>
                            )}
                            
                            {groupSummary.submission.validationDetails && (
                              <div>
                                <span className="font-medium">Détails de validation:</span>
                                <div className="mt-2 space-y-1">
                                  {groupSummary.submission.validationDetails.details?.map((detail: any, index: number) => (
                                    <div key={index} className="flex items-center gap-2 text-xs">
                                      {detail.valid ? (
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                      ) : (
                                        <XCircle className="h-3 w-3 text-red-600" />
                                      )}
                                      <span>{detail.message}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )) || (
                      <p className="text-center text-muted-foreground py-4">
                        Aucune donnée de soumission disponible
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button onClick={() => setIsSummaryDialogOpen(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de notation */}
      <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notation du livrable</DialogTitle>
            <DialogDescription>
              Attribuez les notes selon les critères définis pour ce livrable.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDeliverableForGrading && (
            <div className="space-y-6">
              {/* Informations du livrable */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    {selectedDeliverableForGrading.deliverable.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {selectedDeliverableForGrading.deliverable.type}
                    </div>
                    <div>
                      <span className="font-medium">Date limite:</span> {new Date(selectedDeliverableForGrading.deliverable.deadline).toLocaleString('fr-FR')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Critères de notation disponibles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Critères de notation</CardTitle>
                </CardHeader>
                <CardContent>
                  {getDeliverableCriteria().length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Aucun critère de notation défini pour les livrables.</p>
                      <Button 
                        onClick={() => setIsCreateCriteriaDialogOpen(true)}
                        className="mt-4"
                      >
                        Créer un critère
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getDeliverableCriteria().map((criterion) => (
                        <div key={criterion.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-medium">{criterion.name}</h4>
                              <p className="text-sm text-muted-foreground">{criterion.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">
                                  {criterion.type === 'group' ? 'Groupe' : 'Individuel'}
                                </Badge>
                                <Badge variant="secondary">
                                  Poids: {criterion.weight}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Notation par groupe */}
                          <div className="space-y-3">
                            {selectedDeliverableForGrading.groupSummaries?.map((groupSummary: any) => (
                              <div key={groupSummary.group.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <p className="font-medium">{groupSummary.group.name}</p>
                                    {groupSummary.submission ? (
                                      <div className="flex items-center gap-2 mt-1">
                                        {groupSummary.submission.isLate ? (
                                          <Badge variant="destructive" className="text-xs">En retard</Badge>
                                        ) : (
                                          <Badge variant="default" className="text-xs">À temps</Badge>
                                        )}
                                        {groupSummary.submission.validationStatus === 'valid' ? (
                                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">Valide</Badge>
                                        ) : groupSummary.submission.validationStatus === 'invalid' ? (
                                          <Badge variant="destructive" className="text-xs">Invalide</Badge>
                                        ) : (
                                          <Badge variant="secondary" className="text-xs">En attente</Badge>
                                        )}
                                      </div>
                                    ) : (
                                      <Badge variant="outline" className="text-xs">Non soumis</Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {criterion.type === 'group' ? (
                                    <div className="flex items-center gap-2">
                                      {(() => {
                                        const existingGrade = getExistingGrade(criterion.id, groupSummary.group.id);
                                        const gradeKey = `${criterion.id}-${groupSummary.group.id}`;
                                        
                                        if (existingGrade) {
                                          return (
                                            <div className="flex items-center gap-2">
                                              <Badge variant="default" className="bg-green-100 text-green-800">
                                                {existingGrade.score}/20
                                              </Badge>
                                              {existingGrade.comment && (
                                                <span className="text-xs text-muted-foreground">
                                                  {existingGrade.comment}
                                                </span>
                                              )}
                                            </div>
                                          );
                                        }
                                        
                                        return (
                                          <div className="flex items-center gap-2">
                                            <Input
                                              type="number"
                                              placeholder="Note"
                                              min="0"
                                              max="20"
                                              step="0.5"
                                              className="w-20"
                                              value={gradeInputs[gradeKey]?.score || ''}
                                              onChange={(e) => setGradeInputs(prev => ({
                                                ...prev,
                                                [gradeKey]: {
                                                  ...prev[gradeKey],
                                                  score: parseFloat(e.target.value) || 0
                                                }
                                              }))}
                                            />
                                            <Input
                                              placeholder="Commentaire"
                                              className="w-40"
                                              value={gradeInputs[gradeKey]?.comment || ''}
                                              onChange={(e) => setGradeInputs(prev => ({
                                                ...prev,
                                                [gradeKey]: {
                                                  ...prev[gradeKey],
                                                  comment: e.target.value
                                                }
                                              }))}
                                            />
                                            <Button
                                              size="sm"
                                              onClick={() => handleGradeSubmit(criterion.id, groupSummary.group.id)}
                                              disabled={evaluationLoading || !gradeInputs[gradeKey]?.score}
                                            >
                                              <Save className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {groupSummary.group.students?.map((student: any) => {
                                        const existingGrade = getExistingGrade(criterion.id, groupSummary.group.id, student.id);
                                        const gradeKey = `${criterion.id}-${groupSummary.group.id}-${student.id}`;
                                        
                                        if (existingGrade) {
                                          return (
                                            <div key={student.id} className="flex items-center gap-2">
                                              <span className="text-sm w-24">{student.name}</span>
                                              <Badge variant="default" className="bg-green-100 text-green-800">
                                                {existingGrade.score}/20
                                              </Badge>
                                              {existingGrade.comment && (
                                                <span className="text-xs text-muted-foreground">
                                                  {existingGrade.comment}
                                                </span>
                                              )}
                                            </div>
                                          );
                                        }
                                        
                                        return (
                                          <div key={student.id} className="flex items-center gap-2">
                                            <span className="text-sm w-24">{student.name}</span>
                                            <Input
                                              type="number"
                                              placeholder="Note"
                                              min="0"
                                              max="20"
                                              step="0.5"
                                              className="w-20"
                                              value={gradeInputs[gradeKey]?.score || ''}
                                              onChange={(e) => setGradeInputs(prev => ({
                                                ...prev,
                                                [gradeKey]: {
                                                  ...prev[gradeKey],
                                                  score: parseFloat(e.target.value) || 0
                                                }
                                              }))}
                                            />
                                            <Input
                                              placeholder="Commentaire"
                                              className="w-32"
                                              value={gradeInputs[gradeKey]?.comment || ''}
                                              onChange={(e) => setGradeInputs(prev => ({
                                                ...prev,
                                                [gradeKey]: {
                                                  ...prev[gradeKey],
                                                  comment: e.target.value
                                                }
                                              }))}
                                            />
                                            <Button
                                              size="sm"
                                              onClick={() => handleGradeSubmit(criterion.id, groupSummary.group.id, student.id)}
                                              disabled={evaluationLoading || !gradeInputs[gradeKey]?.score}
                                            >
                                              <Save className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        );
                                      }) || (
                                        <p className="text-xs text-muted-foreground">Aucun étudiant dans ce groupe</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )) || (
                              <p className="text-center text-muted-foreground py-4">
                                Aucun groupe trouvé
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsGradingDialogOpen(false)}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherProjectDeliverablesTab;