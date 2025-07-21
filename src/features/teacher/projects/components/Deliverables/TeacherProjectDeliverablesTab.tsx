import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Package,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  GitBranch,
  Archive,
  BarChart3,
  Users,
  AlertCircle,
  Star,
  Save,
  LibraryBig,
  MoreHorizontal,
  Download,
  Link,
  ArrowDownToLine,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { useDeliverables } from '../../hooks/useDeliverables';
import { useEvaluations } from '../../hooks/useEvaluations';
import { downloadSubmissionFile } from '@/domains/project/services/deliverableService';
import { toast } from 'sonner';
import SimilarityAnalysisDialog from './SimilarityAnalysisDialog';
import { BackendSimilarityAnalysisResult } from '../../types/backend.types';

const Switch = ({ checked, onCheckedChange, ...props }: any) => (
  <input
    type="checkbox"
    checked={checked || false}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    className="w-9 h-5 bg-gray-200 rounded-full relative appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 checked:bg-blue-600"
    {...props}
  />
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
    getDeliverableSummary,
    getSubmissionContent,
    analyzeArchivesDetailed,
    refetch
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
  const [isSimilarityDialogOpen, setIsSimilarityDialogOpen] = useState(false);

  const [deliverableToEdit, setDeliverableToEdit] = useState<any>(null);
  const [deliverableToDelete, setDeliverableToDelete] = useState<string | null>(null);
  const [selectedDeliverableSummary, setSelectedDeliverableSummary] = useState<any>(null);
  const [selectedDeliverableForGrading, setSelectedDeliverableForGrading] = useState<any>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [deliverableGroups, setDeliverableGroups] = useState<{[key: string]: any}>({});
  const [selectedDeliverableForSimilarity, setSelectedDeliverableForSimilarity] = useState<any>(null);

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

  const shouldShowSimilarityButton = (deliverable: any) => {
  // Don't show button for git deliverables
  if (deliverable.type === 'git') {
    return false;
  }

  // Get deliverable data
  const deliverableData = deliverableGroups[deliverable.id];

  if (!deliverableData || !deliverableData.groupSummaries) {
    return false; // No data loaded yet
  }

  // Check if all groups have submitted (non-git submissions)
  const allGroupsSubmitted = deliverableData.groupSummaries.every((groupSummary: any) => {
    const submission = groupSummary.submission;
    return submission && submission.fileName && submission.fileExists !== false;
  });

  return allGroupsSubmitted;
};

  const handleAnalyzeSimilarity = async (deliverableId: string) => {
    // Trouver le livrable pour stocker les informations
    const deliverable = safeDeliverables.find(d => d.id === deliverableId);
    if (!deliverable) {
      toast.error('Livrable non trouvé');
      return;
    }

    setSelectedDeliverableForSimilarity(deliverable);
    setIsSimilarityDialogOpen(true);
  };

  const handleRefreshDeliverables = async () => {
    try {
      await refetch();
      toast.success('La liste des livrables a été actualisée !');
    } catch (error) {
      console.error('Erreur actualisation:', error);
      toast.error('Erreur lors de l\'actualisation');
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

  // TODO : a modifier pour ouvrir la feuille de notation dans le tab evaluation
  const handleOpenGradingSheet = (group: any, deliverable: any) => {
  };

  const handleCloseSimilarityDialog = () => {
    setIsSimilarityDialogOpen(false);
    setSelectedDeliverableForSimilarity(null);
  };

  // Wrapper pour adapter les types de la fonction analyzeSimilarity vers BackendSimilarityAnalysisResult
  const handleAnalyzeSimilarityForDialog = async (deliverableId: string): Promise<BackendSimilarityAnalysisResult> => {
    try {
      // Utilise directement ton hook qui retourne déjà le bon format
      const result = await analyzeSimilarity(deliverableId);

      // Si ton hook retourne le type du hook (SimilarityAnalysisResult), on l'adapte
      const deliverable = safeDeliverables.find(d => d.id === deliverableId);

      // Adaptation simple vers le type Backend attendu par le dialog
      const adaptedResult: BackendSimilarityAnalysisResult = {
        deliverableId: result.deliverableId,
        deliverableName: deliverable?.name || result.deliverableName || 'Livrable inconnu',
        submissionsCount: result.submissionsCount,
        validSubmissionsCount: result.validSubmissionsCount || result.submissionsCount,
        comparisons: result.comparisons.map((comp: any) => ({
          submission1Id: comp.submission1Id,
          submission2Id: comp.submission2Id,
          group1: comp.group1,
          group2: comp.group2,
          similarityScore: comp.similarityScore,
          similarityPercentage: comp.similarityPercentage,
          method: comp.method,
          algorithms: comp.algorithms || [],
          details: comp.details || {
            file1: 'file1.txt',
            file2: 'file2.txt',
            type1: 'text',
            type2: 'text',
            timestamp: new Date().toISOString()
          },
          isSuspicious: comp.isSuspicious,
          comparedAt: comp.comparedAt
        })),
        suspiciousPairs: result.suspiciousPairs || [],
        similarityMatrix: result.similarityMatrix || {},
        statistics: result.statistics || {
          totalComparisons: result.comparisons?.length || 0,
          successfulComparisons: result.comparisons?.length || 0,
          errorCount: 0,
          suspiciousCount: result.suspiciousPairs?.length || 0,
          averageSimilarity: 0,
          maxSimilarity: 0
        },
        threshold: result.threshold || 0.8,
        submissions: result.submissions?.map((sub: any) => ({
          id: sub.id,
          groupId: sub.groupId,
          groupName: sub.groupName,
          fileName: sub.fileName,
          fileSize: sub.fileSize,
          filePath: sub.filePath,
          gitUrl: sub.gitUrl,
          submissionDate: sub.submissionDate,
          isLate: sub.isLate,
          validationStatus: sub.validationStatus as 'pending' | 'valid' | 'invalid', // CORRECTION du type
          similarityScore: sub.similarityScore
        })) || [],
        processedAt: result.processedAt || new Date().toISOString()
      };

      return adaptedResult;
    } catch (error) {
      console.error('Erreur lors de l\'analyse de similarité:', error);
      throw error;
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

  const handleAccordionChange = async (value: string, deliverableId: string) => {
    // Si l'accordion s'ouvre et qu'on n'a pas encore les données des groupes
    if (value === `groups-${deliverableId}` && !deliverableGroups[deliverableId]) {
      try {
        const summary = await getDeliverableSummary(deliverableId);
        setDeliverableGroups(prev => ({
          ...prev,
          [deliverableId]: summary
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des groupes:', error);
      }
    }
  };

  // Fonction pour télécharger une soumission de groupe
  const handleDownloadSubmission = async (submissionId: string, fileName: string) => {
    try {
      await downloadSubmissionFile(submissionId, fileName);
      toast.success(`Fichier "${fileName}" téléchargé avec succès !`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du téléchargement';
      toast.error(`Erreur: ${errorMessage}`);
    }
  };

  // Fonction pour ouvrir un lien Git
  const handleOpenGitUrl = (gitUrl: string) => {
    try {
      window.open(gitUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error('Erreur lors de l\'ouverture du lien');
    }
  };

  // Fonction pour formater la taille de fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    return type === 'git' ? <GitBranch className="h-4 w-4" /> : <Package className="h-4 w-4" />;
  };

  const getStatusBadge = (deliverable: any) => {
    const now = new Date();
    const deadline = new Date(deliverable.deadline);
    const isExpired = now > deadline;

    if (isExpired) {
      return <Badge variant="destructive">Expiré</Badge>;
    } else if (deadline.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">Bientôt</Badge>;
    } else {
      return <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">Actif</Badge>;
    }
  };

  const getLateSubmissionBadge = (deliverable: any) => {
    if (deliverable.allowLateSubmission) {
      const penalty = deliverable.latePenaltyPerHour || 0;
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-700 bg-orange-50">
          Retard autorisé (-{penalty}pts/h)
        </Badge>
      );
    }
    return null;
  };

  // Fonction pour obtenir le badge de statut de soumission
  const getSubmissionStatusBadge = (submission: any, deliverable: any, isSmall = false) => {
    const sizeClass = isSmall ? "text-xs" : "";

    if (!submission) {
      return <Badge variant="outline" className={`border-gray-400 text-gray-600 bg-gray-50 ${sizeClass}`}>Non Soumis</Badge>;
    }

    // Vérifier si le fichier existe (pour les soumissions non-Git)
    const hasValidFile = submission.gitUrl || (submission.fileName && submission.fileExists !== false);

    // Si la soumission n'a pas de fichier valide, considérer comme invalide
    if (!hasValidFile) {
      return <Badge variant="destructive" className={sizeClass}>Fichier manquant</Badge>;
    }

    const deadline = new Date(deliverable.deadline);
    const submissionDate = new Date(submission.submissionDate);

    // Si la soumission est validée
    if (submission.validationStatus === 'valid') {
      return <Badge variant="outline" className={`border-emerald-500 text-emerald-700 bg-emerald-50 ${sizeClass}`}>Validé</Badge>;
    }

    // Si la soumission est invalide
    if (submission.validationStatus === 'invalid') {
      return <Badge variant="destructive" className={sizeClass}>Invalide</Badge>;
    }

    // Si la soumission est en attente de validation
    if (submission.validationStatus === 'pending') {
      return <Badge variant="outline" className={`border-amber-500 text-amber-700 bg-amber-50 ${sizeClass}`}>En attente</Badge>;
    }

    // Si la soumission est en retard
    if (submissionDate > deadline || submission.isLate) {
      const hoursLate = submission.hoursLate ? ` (${submission.hoursLate}h)` : '';
      return <Badge variant="outline" className={`border-red-600 text-red-700 bg-red-50 ${sizeClass}`}>En retard{hoursLate}</Badge>;
    }

    // Si la soumission est à temps
    return <Badge variant="outline" className={`border-blue-500 text-blue-700 bg-blue-50 ${sizeClass}`}>À temps</Badge>;
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
      const grade = gradesForTarget.find(g => g.criteriaId === criteriaId);
      // S'assurer que le grade existe et a un score valide
      if (grade && typeof grade.score === 'number') {
        return grade;
      }
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
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleRefreshDeliverables}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Dialog open={isCreateCriteriaDialogOpen} onOpenChange={setIsCreateCriteriaDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                Créer un critère de notation
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
                    onCheckedChange={(checked: boolean) =>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <LibraryBig className="h-5 w-5" />
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
                          <div className="mt-[7px]">
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
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(deliverable)}
                            {getLateSubmissionBadge(deliverable)}
                            <Badge variant="outline">
                              {deliverable.type === 'git' ? 'Git' : 'Archive'}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openEditDialog(deliverable)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setDeliverableToDelete(deliverable.id);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600 focus:text-red-500"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Bouton d'analyse de similarité */}
                          {shouldShowSimilarityButton(deliverable) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                              onClick={() => handleAnalyzeSimilarity(deliverable.id)}
                              disabled={analyzingId === deliverable.id}
                            >
                              {analyzingId === deliverable.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                              ) : (
                                <BarChart3 className="h-4 w-4" />
                              )}
                              Analyser similarité
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Boutons d'actions */}
                        <div className="flex items-center justify-between border-t">
                        </div>

                        {/* Section accordion pour les groupes */}
                        <div className="w-full">
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full border-b border-zinc-200 py-2"
                            onValueChange={(value) => handleAccordionChange(value, deliverable.id)}
                          >
                            <AccordionItem value={`groups-${deliverable.id}`} className='grid gap-2'>
                              <AccordionTrigger className='p-2 rounded-md hover:bg-zinc-100'>
                                <span className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Groupes
                                </span>
                              </AccordionTrigger>
                              <AccordionContent className="flex flex-col gap-3">
                                {deliverableGroups[deliverable.id] ? (
                                  deliverableGroups[deliverable.id].groupSummaries?.map((groupSummary: any) => (
                                    <div key={groupSummary.group.id} className="p-3 border rounded-lg bg-white shadow-sm">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                          <h4 className="font-medium text-sm">{groupSummary.group.name}</h4>
                                        </div>

                                        {/* Status badges à droite */}
                                        <div className="flex items-center gap-2">
                                          {getSubmissionStatusBadge(groupSummary.submission, deliverable)}

                                          {/* Bouton pour ouvrir le sheet de notation - utilise le même handler */}
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-6 px-2 text-xs"
                                            title="Noter ce groupe"
                                            onClick={() => handleOpenGradingSheet(groupSummary.group, deliverable)}
                                          >
                                            <Star className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>

                                      {groupSummary.submission && (groupSummary.submission.gitUrl || (groupSummary.submission.fileName && groupSummary.submission.fileExists !== false)) && (
                                        <div className="space-y-1 text-xs text-muted-foreground">
                                          <div>
                                            <span className="font-medium">Soumis le:</span> {' '}
                                            {new Date(groupSummary.submission.submissionDate).toLocaleDateString('fr-FR')} à {' '}
                                            {new Date(groupSummary.submission.submissionDate).toLocaleTimeString('fr-FR', {
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </div>

                                          {/* Affichage du fichier ou lien Git - seulement si le fichier existe */}
                                          {groupSummary.submission.gitUrl ? (
                                            <div className="flex items-center gap-2 mt-2">
                                              <GitBranch className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                                              <div className="group relative inline-block flex-1 min-w-0">
                                                <button
                                                  onClick={() => handleOpenGitUrl(groupSummary.submission.gitUrl)}
                                                  className="text-purple-600 hover:text-purple-800 underline cursor-pointer font-medium truncate bg-transparent border-none p-0 text-left block"
                                                >
                                                  {groupSummary.submission.gitUrl}
                                                </button>
                                                <div className="absolute bottom-full left-0 mb-2 px-3 py-1 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                                  Ouvrir le lien GitHub dans une nouvelle fenêtre
                                                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                                </div>
                                              </div>
                                            </div>
                                          ) : groupSummary.submission.fileName && groupSummary.submission.fileExists !== false ? (
                                            <div className="flex items-center gap-2 mt-2">
                                              <Download className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                                              <div className="group relative inline-block flex-1 min-w-0">
                                                <button
                                                  onClick={() => handleDownloadSubmission(groupSummary.submission.id, groupSummary.submission.fileName)}
                                                  className="text-blue-600 hover:text-blue-800 underline cursor-pointer font-medium truncate bg-transparent border-none p-0 text-left block"
                                                >
                                                  {groupSummary.submission.fileName}
                                                  {groupSummary.submission.fileSize && (
                                                    <span className="text-gray-500 ml-2">({formatFileSize(groupSummary.submission.fileSize)})</span>
                                                  )}
                                                </button>
                                                <div className="absolute bottom-full left-0 mb-2 px-3 py-1 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                                  Télécharger le fichier
                                                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                                </div>
                                              </div>
                                            </div>
                                          ) : null}

                                          {groupSummary.submission.similarityScore !== null && (
                                            <div>
                                              <span className="font-medium">Similarité:</span> {' '}
                                              <span className={`font-medium ${
                                                groupSummary.submission.similarityScore > 0.8 ? 'text-red-600' :
                                                groupSummary.submission.similarityScore > 0.6 ? 'text-orange-600' :
                                                'text-green-600'
                                              }`}>
                                                {(groupSummary.submission.similarityScore * 100).toFixed(1)}%
                                              </span>
                                            </div>
                                          )}

                                          {groupSummary.group.students && groupSummary.group.students.length > 0 && (
                                            <div>
                                              <span className="font-medium">Étudiants:</span> {' '}
                                              {groupSummary.group.students.map((student: any, index: number) => (
                                                <span key={student.id}>
                                                  {student.name}
                                                  {index < groupSummary.group.students.length - 1 ? ', ' : ''}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )) || (
                                    <div className="text-sm text-muted-foreground text-center py-6">
                                      Aucun groupe trouvé pour ce livrable
                                    </div>
                                  )
                                ) : (
                                  <div className="text-sm text-muted-foreground text-center py-6">
                                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    Chargement des informations des groupes...
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
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
                onCheckedChange={(checked: boolean) =>
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
                              {getSubmissionStatusBadge(groupSummary.submission, selectedDeliverableSummary.deliverable)}
                            </div>
                          ) : (
                            <Badge variant="outline" className="border-gray-400 text-gray-600 bg-gray-50">Non Soumis</Badge>
                          )}
                        </div>

                        {groupSummary.submission && (groupSummary.submission.gitUrl || (groupSummary.submission.fileName && groupSummary.submission.fileExists !== false)) && (
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Date de soumission:</span> {new Date(groupSummary.submission.submissionDate).toLocaleString('fr-FR')}
                            </div>

                            {/* Affichage du fichier ou lien Git dans le dialog de résumé - seulement si le fichier existe */}
                            {groupSummary.submission.gitUrl ? (
                              <div className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                <div className="group relative inline-block flex-1 min-w-0">
                                  <button
                                    onClick={() => handleOpenGitUrl(groupSummary.submission.gitUrl)}
                                    className="text-purple-600 hover:text-purple-800 underline cursor-pointer font-medium truncate bg-transparent border-none p-0 text-left block"
                                  >
                                    {groupSummary.submission.gitUrl}
                                  </button>
                                  <div className="absolute bottom-full left-0 mb-2 px-3 py-1 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                    Ouvrir le lien GitHub dans une nouvelle fenêtre
                                    <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 text-purple-600 border-purple-300 hover:bg-purple-50"
                                  onClick={() => handleOpenGitUrl(groupSummary.submission.gitUrl)}
                                >
                                  <Link className="h-4 w-4" />
                                  Ouvrir
                                </Button>
                              </div>
                            ) : groupSummary.submission.fileName && groupSummary.submission.fileExists !== false ? (
                              <div className="flex items-center gap-2">
                                <ArrowDownToLine className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                <div className="group relative inline-block flex-1 min-w-0">
                                  <button
                                    onClick={() => handleDownloadSubmission(groupSummary.submission.id, groupSummary.submission.fileName)}
                                    className="text-blue-600 hover:text-blue-800 underline cursor-pointer font-medium truncate bg-transparent border-none p-0 text-left block"
                                  >
                                    {groupSummary.submission.fileName}
                                  </button>
                                  <div className="absolute bottom-full left-0 mb-2 px-3 py-1 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                    Télécharger le fichier
                                    <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                </div>
                                {groupSummary.submission.fileSize && (
                                  <span className="text-gray-500 text-sm flex-shrink-0">({formatFileSize(groupSummary.submission.fileSize)})</span>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                                  onClick={() => handleDownloadSubmission(groupSummary.submission.id, groupSummary.submission.fileName)}
                                >
                                  <Download className="h-4 w-4" />
                                  Télécharger
                                </Button>
                              </div>
                            ) : null}

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

      {/* Dialog de notation - Gardé pour compatibilité avec le bouton "Noter" principal */}
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
                                        {getSubmissionStatusBadge(groupSummary.submission, selectedDeliverableForGrading.deliverable, true)}
                                      </div>
                                    ) : (
                                      <Badge variant="outline" className="border-gray-400 text-gray-600 bg-gray-50 text-xs">Non Soumis</Badge>
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

      {/* Dialog d'analyse de similarité */}
      <SimilarityAnalysisDialog
        isOpen={isSimilarityDialogOpen}
        onClose={handleCloseSimilarityDialog}
        deliverableId={selectedDeliverableForSimilarity?.id || ''}
        deliverableName={selectedDeliverableForSimilarity?.name || ''}
        onAnalyze={handleAnalyzeSimilarityForDialog}
        getSubmissionContent={getSubmissionContent}
        analyzeArchivesDetailed={analyzeArchivesDetailed}
      />
    </div>
  );
};

export default TeacherProjectDeliverablesTab;