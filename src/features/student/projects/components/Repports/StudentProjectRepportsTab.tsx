import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/shared/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/shared/components/ui/alert-dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import {
  FileText,
  Plus,
  Edit3,
  Save,
  Cloud,
  CloudOff,
  Trash2,
  Send,
  AlertCircle,
  Clock,
  CheckCircle,
  Eye,
  Type,
  BarChart3,
  Users,
  Calendar,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCcw,
  TriangleAlert
} from 'lucide-react';
import { useStudentReports } from '../../hooks/useStudentReports';
import { toast } from 'sonner';
import WYSIWYGEditor from './WYSIWYGEditor';
interface WYSIWYGEditorProps {
  content: string;
  onChange: (content: string) => void;
  contentType: 'html' | 'markdown' | 'plain';
  placeholder?: string;
  disabled?: boolean;
}

/*const WYSIWYGEditor = ({ content, onChange, contentType, placeholder = "Commencez à rédiger...", disabled = false }: WYSIWYGEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleContentChange = (e: React.FormEvent<HTMLDivElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    const target = e.target as HTMLDivElement | HTMLTextAreaElement;
    const newContent = (target as HTMLTextAreaElement).value || (target as HTMLDivElement).innerHTML;
    onChange(newContent);
  };

  if (contentType === 'html') {
    return (
      <div className="border rounded-lg">
        <div className="border-b p-2 bg-gray-50 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Éditeur HTML (WYSIWYG)</span>
          <Badge variant="outline" className="text-xs">
            <Code className="w-3 h-3 mr-1" />
            HTML
          </Badge>
          {disabled && (
            <Badge variant="secondary" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Lecture seule
            </Badge>
          )}
        </div>
        <div
          ref={editorRef}
          contentEditable={!disabled}
          className={`min-h-[200px] p-4 prose max-w-none ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'focus:outline-none'}`}
          dangerouslySetInnerHTML={{ __html: content }}
          onInput={handleContentChange}
          onBlur={handleContentChange}
          style={{ minHeight: '200px' }}
        />
      </div>
    );
  }

  if (contentType === 'markdown') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span>Format Markdown</span>
          {disabled && (
            <Badge variant="secondary" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Lecture seule
            </Badge>
          )}
        </div>
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={disabled ? "" : `${placeholder}\n\n# Titre principal\n## Sous-titre\n- Liste à puces\n**Texte en gras**\n*Texte en italique*`}
          className="min-h-[200px] font-mono text-sm"
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Type className="w-4 h-4" />
        <span>Texte brut</span>
        {disabled && (
          <Badge variant="secondary" className="text-xs">
            <Eye className="w-3 h-3 mr-1" />
            Lecture seule
          </Badge>
        )}
      </div>
      <Textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={disabled ? "" : placeholder}
        className="min-h-[200px]"
        disabled={disabled}
      />
    </div>
  );
};*/

const StudentProjectReportsTab = () => {
  const { id: projectId } = useParams();

  const {
    report,
    sections,
    userGroupId,
    loading,
    creating,
    updating,
    autoSaveStatus,
    lastSaved,
    stats,
    createReport,
    updateReport,
    addSection,
    updateSection,
    deleteSection,
    submitReport,
    saveManually,
    refreshData,
    canEditReport,
    canSubmitReport,
    canCreateReport,
    hasUnsavedChanges,
    isReportEditable,
    isReportSubmitted
  } = useStudentReports(projectId || '');

  const [isCreateReportDialogOpen, setIsCreateReportDialogOpen] = useState(false);
  const [isCreateSectionDialogOpen, setIsCreateSectionDialogOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [newReport, setNewReport] = useState({ title: '', description: '' });
  const [newSection, setNewSection] = useState<{
    title: string;
    content: string;
    contentType: 'html' | 'markdown' | 'plain';
    sectionType: 'text' | 'image' | 'table' | 'code' | 'mixed';
  }>({
    title: '',
    content: '',
    contentType: 'html',
    sectionType: 'text'
  });

  interface SectionEdit {
    title?: string;
    content?: string;
    contentType?: 'html' | 'markdown' | 'plain';
    sectionType?: 'text' | 'image' | 'table' | 'code' | 'mixed';
  }
  const [sectionEdits, setSectionEdits] = useState<Record<string, SectionEdit>>({});

  const [isEditingReport, setIsEditingReport] = useState(false);
  const [reportEdits, setReportEdits] = useState({ title: '', description: '' });

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReport(newReport);
      setIsCreateReportDialogOpen(false);
      setNewReport({ title: '', description: '' });
      toast.success('Rapport créé avec succès !');
    } catch (error) {
      console.error('Erreur création rapport:', error);
    }
  };

  const handleEditReport = () => {
    if (report) {
      setReportEdits({
        title: report.title || '',
        description: report.description || ''
      });
      setIsEditingReport(true);
    }
  };

  const handleSaveReportEdit = async () => {
    if (!report) return;

    try {
      await updateReport({
        ...report,
        title: reportEdits.title,
        description: reportEdits.description
      });
      setIsEditingReport(false);
      toast.success('Rapport mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur mise à jour rapport:', error);
      toast.error('Erreur lors de la mise à jour du rapport');
    }
  };

  const handleCancelReportEdit = () => {
    setIsEditingReport(false);
    setReportEdits({ title: '', description: '' });
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSection(newSection);
      setIsCreateSectionDialogOpen(false);
      setNewSection({
        title: '',
        content: '',
        contentType: 'html',
        sectionType: 'text'
      });
      toast.success('Section ajoutée avec succès !');
    } catch (error) {
      console.error('Erreur création section:', error);
    }
  };

  const handleSectionEdit = (sectionId: string, field: string, value: any) => {
    setSectionEdits(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [field]: value
      }
    }));

    const updateData = {
      ...sectionEdits[sectionId],
      [field]: value
    };

    updateSection(sectionId, updateData, false);
  };

  const handleSectionSave = async (sectionId: string) => {
    try {
      const updateData = sectionEdits[sectionId] || {};
      await updateSection(sectionId, updateData, true);
      setEditingSectionId(null);
      setSectionEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits[sectionId];
        return newEdits;
      });
      toast.success('Section sauvegardée !');
    } catch (error) {
      console.error('Erreur sauvegarde section:', error);
    }
  };

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; sectionId: string | null; loading: boolean }>({ open: false, sectionId: null, loading: false });

  const handleDeleteSection = (sectionId: string) => {
    setDeleteDialog({ open: true, sectionId, loading: false });
  };

  const confirmDeleteSection = async () => {
    if (!deleteDialog.sectionId) return;
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      await deleteSection(deleteDialog.sectionId);
      setDeleteDialog({ open: false, sectionId: null, loading: false });
      toast.success('Section supprimée');
    } catch (error) {
      setDeleteDialog({ open: false, sectionId: null, loading: false });
      console.error('Erreur suppression section:', error);
    }
  };

  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReport = async () => {
    setIsSubmitDialogOpen(true);
  };

  const confirmSubmitReport = async () => {
    setSubmitting(true);
    try {
      await submitReport();
      setIsSubmitDialogOpen(false);
      setSubmitting(false);
      setTimeout(() => {
        refreshData();
      }, 100);
    } catch (error) {
      setSubmitting(false);
      setIsSubmitDialogOpen(false);
      console.error('Erreur soumission rapport:', error);
    }
  };

  const getAutoSaveStatusIcon = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return <Cloud className="h-4 w-4 animate-pulse text-blue-600" />;
      case 'saved':
        return <Cloud className="h-4 w-4 text-green-600" />;
      case 'error':
        return <CloudOff className="h-4 w-4 text-red-600" />;
      default:
        return <Cloud className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, any> = {
      draft: { variant: 'outline', label: 'Brouillon', icon: Edit3, color: 'text-gray-600' },
      submitted: { variant: 'secondary', label: 'Soumis', icon: Send, color: 'text-blue-600' },
      reviewed: { variant: 'default', label: 'Évalué', icon: CheckCircle, color: 'text-orange-600' },
      published: { variant: 'default', label: 'Publié', icon: Eye, color: 'text-green-600' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`gap-1 ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getSectionCompletionBadge = (section: any) => {
    const hasContent = section.content && section.content.trim() !== '';
    if (hasContent) {
      return (
        <Badge variant="outline" className="text-xs text-green-600 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Complète
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Vide
        </Badge>
      );
    }
  };

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du rapport...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statut */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rapport du projet</h2>
          <p className="text-muted-foreground">
            {isReportSubmitted
              ? "Votre rapport a été soumis et ne peut plus être modifié"
              : "Rédigez et gérez le rapport de votre groupe"
            }
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Statut auto-save */}
          {report && isReportEditable && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getAutoSaveStatusIcon()}
              <span>
                {autoSaveStatus === 'saving' && 'Sauvegarde...'}
                {autoSaveStatus === 'saved' && lastSaved && `Sauvé à ${lastSaved.toLocaleTimeString()}`}
                {autoSaveStatus === 'error' && 'Erreur de sauvegarde'}
              </span>
            </div>
          )}

          {/* Actions */}
          {report && canEditReport() && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={saveManually}
                disabled={updating}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Sauvegarder
              </Button>

      {canSubmitReport() && (
        <>
          <Button
            onClick={handleSubmitReport}
            disabled={updating || hasUnsavedChanges}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Soumettre
          </Button>
          <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Confirmer la soumission</DialogTitle>
                <DialogDescription>
                  Êtes-vous sûr de vouloir soumettre le rapport ? Vous ne pourrez plus le modifier après soumission.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSubmitDialogOpen(false)}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={confirmSubmitReport}
                  disabled={submitting}
                  className="gap-2"
                >
                  {submitting ? 'Soumission...' : 'Confirmer'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {report && isReportSubmitted && (
        <Alert>
          <TriangleAlert className="h-4 w-4" style={{ color: '#ff3333' }} />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Ce rapport a été soumis
                {report.submittedAt && (() => {
                  const date = new Date(report.submittedAt);
                  return ` le ${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
                })()}
                {' '}et ne peut plus être modifié.
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistiques */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Statut</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {getStatusBadge(stats.status)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sections</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSections}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedSections} complètes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mots</CardTitle>
              <Type className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWords}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalCharacters} caractères
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dernière modification</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {stats.lastModified
                  ? stats.lastModified.toLocaleDateString('fr-FR')
                  : 'Jamais'
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!userGroupId ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Users className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-semibold mb-4">Vous devez rejoindre un groupe</h3>
                <Alert className="mb-6 max-w-md mx-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Pour accéder au rapport de projet, vous devez d'abord faire partie d'un groupe. Rejoignez un groupe existant ou créez le vôtre dans l'onglet Groupes.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => {
                    const event = new CustomEvent('changeTab', { detail: 'group' });
                    window.dispatchEvent(event);
                  }}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  Rejoindre un groupe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : !report ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Aucun rapport créé</h3>
              <p className="text-muted-foreground mb-6">
                {canCreateReport()
                  ? "Commencez par créer un rapport pour votre groupe."
                  : "Un rapport existe peut-être déjà mais n'est pas encore accessible."
                }
              </p>

              {canCreateReport() && (
                <Dialog open={isCreateReportDialogOpen} onOpenChange={setIsCreateReportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Créer un rapport
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Créer un nouveau rapport</DialogTitle>
                      <DialogDescription>
                        Créez le rapport de votre groupe pour ce projet.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateReport} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Titre du rapport</Label>
                        <Input
                          id="title"
                          placeholder="Rapport de projet - Groupe X"
                          value={newReport.title}
                          onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description (optionnel)</Label>
                        <Textarea
                          id="description"
                          placeholder="Description du rapport..."
                          value={newReport.description}
                          onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateReportDialogOpen(false)}
                        >
                          Annuler
                        </Button>
                        <Button type="submit" disabled={creating}>
                          {creating ? 'Création...' : 'Créer le rapport'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Rapport existant */
        <div className="space-y-6">
          {/* Informations du rapport */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  {isEditingReport ? (
                    /* Mode édition */
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="reportTitle" className="text-sm font-medium">
                          Titre du rapport
                        </Label>
                        <Input
                          id="reportTitle"
                          value={reportEdits.title}
                          onChange={(e) => setReportEdits(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Titre du rapport"
                          className="text-xl font-semibold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reportDescription" className="text-sm font-medium">
                          Description (optionnel)
                        </Label>
                        <Textarea
                          id="reportDescription"
                          value={reportEdits.description}
                          onChange={(e) => setReportEdits(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Description du rapport..."
                          rows={2}
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={handleSaveReportEdit}
                          disabled={updating}
                          className="gap-2"
                        >
                          <Save className="h-3 w-3" />
                          Sauvegarder
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelReportEdit}
                          disabled={updating}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Mode affichage */
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{report.title}</CardTitle>
                        {canEditReport() && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleEditReport}
                            className="gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <Edit3 className="h-3 w-3" />
                            Modifier
                          </Button>
                        )}
                      </div>
                      {report.description && (
                        <CardDescription>{report.description}</CardDescription>
                      )}
                      {!report.description && canEditReport() && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleEditReport}
                          className="text-muted-foreground hover:text-foreground justify-start p-0 h-auto"
                        >
                          + Ajouter une description
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(report.status)}
                  {report.submittedAt && (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {(() => {
                        const date = new Date(report.submittedAt);
                        return `Soumis le ${date.toLocaleDateString('fr-FR')} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
                      })()}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            {report.group && (
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Groupe: {report.group.name}</span>
                  {report.group.members && (
                    <span>• {report.group.members.length} membre(s)</span>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Sections du rapport */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Sections du rapport
                </CardTitle>

                {canEditReport() && (
                  <Dialog open={isCreateSectionDialogOpen} onOpenChange={setIsCreateSectionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Ajouter une section
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[90vh] max-h-[90vh] overflow-auto">
                      <DialogHeader>
                        <DialogTitle>Ajouter une section</DialogTitle>
                        <DialogDescription>
                          Créez une nouvelle section pour votre rapport.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateSection} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="sectionTitle">Titre de la section*</Label>
                          <Input
                            id="sectionTitle"
                            placeholder="Introduction, Méthodologie, Résultats..."
                            value={newSection.title}
                            onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contentType">Format de contenu</Label>
                            <Select
                              value={newSection.contentType}
                              onValueChange={(value: 'html' | 'markdown' | 'plain') => setNewSection(prev => ({ ...prev, contentType: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="html">HTML (WYSIWYG)</SelectItem>
                                <SelectItem value="markdown">Markdown</SelectItem>
                                <SelectItem value="plain">Texte brut</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sectionContent">Contenu initial (optionnel)</Label>
                          <WYSIWYGEditor
                            content={newSection.content}
                            onChange={(content) => setNewSection(prev => ({ ...prev, content }))}
                            contentType={newSection.contentType}
                            placeholder="Commencez à rédiger le contenu de cette section..."
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateSectionDialogOpen(false)}
                          >
                            Annuler
                          </Button>
                          <Button type="submit" disabled={creating}>
                            {creating ? 'Ajout...' : 'Ajouter la section'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {sections.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h4 className="text-lg font-semibold mb-2">Aucune section</h4>
                  <p className="text-muted-foreground mb-4">
                    {canEditReport()
                      ? "Commencez par ajouter une section à votre rapport."
                      : "Ce rapport ne contient aucune section."
                    }
                  </p>
                  {canEditReport() && (
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateSectionDialogOpen(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter une section
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {sections
                    .sort((a, b) => a.order - b.order)
                    .map((section, index) => (
                      <div key={section.id} className="border rounded-lg p-4 space-y-4">
                        {/* Header de section */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Section {index + 1}
                              </span>
                            </div>

                            {editingSectionId === section.id ? (
                              <Input
                                value={sectionEdits[section.id]?.title ?? section.title}
                                onChange={(e) => handleSectionEdit(section.id, 'title', e.target.value)}
                                className="font-semibold"
                                placeholder="Titre de la section"
                              />
                            ) : (
                              <h4 className="font-semibold text-lg">{section.title}</h4>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {section.contentType}
                            </Badge>

                            {canEditReport() && (
                              <div className="flex items-center gap-1">
                                {editingSectionId === section.id ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSectionSave(section.id)}
                                      className="gap-1"
                                      disabled={updating}
                                    >
                                      <Save className="h-3 w-3" />
                                      Sauver
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingSectionId(null);
                                        setSectionEdits(prev => {
                                          const newEdits = { ...prev };
                                          delete newEdits[section.id];
                                          return newEdits;
                                        });
                                      }}
                                    >
                                      <XCircle className="h-3 w-3" />
                                      Annuler
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingSectionId(section.id);
                                        setSectionEdits(prev => ({
                                          ...prev,
                                          [section.id]: {
                                            title: section.title,
                                            content: section.content,
                                            contentType: section.contentType
                                          }
                                        }));
                                      }}
                                      className="gap-1"
                                    >
                                      <Edit3 className="h-3 w-3" />
                                      Éditer
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteSection(section.id)}
                                      className="gap-1 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      Supprimer
                                    </Button>
                                    <AlertDialog open={deleteDialog.open} onOpenChange={open => setDeleteDialog(prev => ({ ...prev, open, sectionId: open ? prev.sectionId : null, loading: false }))}>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="flex items-center gap-2">
                                            Confirmer la suppression
                                          </AlertDialogTitle>
                                          <AlertDialogDescription className="pt-4">
                                            Êtes-vous sûr de vouloir supprimer la section{' '}
                                            <span className="font-semibold">"{sections.find(s => s.id === deleteDialog.sectionId)?.title || ''}"</span> ?
                                          </AlertDialogDescription>
                                          <div className="flex items-center gap-2 text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-200 mt-4">
                                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                            <span>Cette action est irréversible et supprimera définitivement cette section.</span>
                                          </div>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="pt-6">
                                          <AlertDialogCancel
                                            onClick={() => setDeleteDialog({ open: false, sectionId: null, loading: false })}
                                            disabled={deleteDialog.loading}
                                          >
                                            Annuler
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={confirmDeleteSection}
                                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                            disabled={deleteDialog.loading}
                                          >
                                            {deleteDialog.loading ? 'Suppression...' : 'Supprimer'}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                              </div>
                            )}

                            {!canEditReport() && (
                              <Badge variant="secondary" className="text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                Lecture seule
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {editingSectionId === section.id ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Label className="text-sm">Format:</Label>
                                <Select
                                  value={sectionEdits[section.id]?.contentType ?? section.contentType}
                                  onValueChange={(value) => handleSectionEdit(section.id, 'contentType', value)}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="html">HTML (WYSIWYG)</SelectItem>
                                    <SelectItem value="markdown">Markdown</SelectItem>
                                    <SelectItem value="plain">Texte brut</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <WYSIWYGEditor
                                content={sectionEdits[section.id]?.content ?? section.content}
                                onChange={(content) => handleSectionEdit(section.id, 'content', content)}
                                contentType={sectionEdits[section.id]?.contentType ?? section.contentType}
                                placeholder="Rédigez le contenu de cette section..."
                              />
                            </div>
                          ) : (
                            <div className="prose max-w-none p-4 bg-gray-50 rounded-lg">
                              {section.content && section.content.trim() !== '' ? (
                                <>
                                  {section.contentType === 'html' ? (
                                    <div dangerouslySetInnerHTML={{ __html: section.content }} />
                                  ) : section.contentType === 'markdown' ? (
                                    <div className="whitespace-pre-wrap font-mono text-sm">
                                      {section.content}
                                    </div>
                                  ) : (
                                    <div className="whitespace-pre-wrap">
                                      {section.content}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-center py-8">
                                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                                  <p className="text-muted-foreground italic">
                                    {canEditReport()
                                      ? "Cette section est vide. Cliquez sur 'Éditer' pour ajouter du contenu."
                                      : "Cette section est vide."
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <div className="flex items-center gap-4">
                              <span>
                                Dernière modification: {new Date(section.updatedAt).toLocaleString('fr-FR')}
                              </span>
                              {section.content && (
                                <span>
                                  {section.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length} mots
                                </span>
                              )}
                              {section.content && (
                                <span>
                                  {section.content.length} caractères
                                </span>
                              )}
                            </div>

                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {(updating || creating) && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>
              {creating ? 'Création en cours...' :
               updating ? 'Sauvegarde en cours...' :
               'Traitement...'}
            </span>
          </div>
        </div>
      )}

      {report && isReportEditable && autoSaveStatus === 'saving' && (
        <div className="fixed bottom-4 left-4 bg-blue-100 text-blue-800 px-3 py-2 rounded-lg shadow-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm">
            <Cloud className="h-4 w-4 animate-pulse" />
            <span>Sauvegarde automatique...</span>
          </div>
        </div>
      )}

      {report && isReportEditable && autoSaveStatus === 'error' && (
        <div className="fixed bottom-4 left-4 bg-red-100 text-red-800 px-3 py-2 rounded-lg shadow-lg border border-red-200">
          <div className="flex items-center gap-2 text-sm">
            <CloudOff className="h-4 w-4" />
            <span>Erreur de sauvegarde</span>
            <Button
              size="sm"
              variant="outline"
              onClick={saveManually}
              className="ml-2 h-6 px-2 text-xs"
            >
              Réessayer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProjectReportsTab;
