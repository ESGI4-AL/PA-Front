import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Package,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  GitBranch,
  AlertCircle,
  Timer,
  FileText,
  HardDrive,
  FolderOpen,
  Code,
  FileArchive,
  Link,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { toast } from 'sonner';
import { useStudentDeliverables } from '../../hooks/useStudentDeliverables';
import { StudentDeliverableView } from '@/domains/project/models/deliverableModels';
import StudentSubmissionDialog from './StudentSubmissionDialog';

const StudentProjectDeliverablesTab: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const {
    deliverables,
    loading,
    error,
    submitting,
    uploadProgress,
    refetch,
    submitDeliverable,
    downloadSubmission,
    deleteSubmissionById
  } = useStudentDeliverables(projectId || '');

  // États pour le dialog de soumission
  const [selectedDeliverable, setSelectedDeliverable] = useState<StudentDeliverableView | null>(null);
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);

  // État pour le suivi des soumissions
  const [submissionCounts, setSubmissionCounts] = useState({
    total: 0,
    submitted: 0,
    pending: 0,
    expired: 0
  });

  // État pour indiquer une synchronisation en cours
  const [isSyncing, setIsSyncing] = useState(false);

  const analyzeFirebaseSubmissions = () => {
    const submissionsWithFirebase = deliverables
      .filter(d => d.submission)
      .map(d => ({
        deliverableName: d.name,
        submissionId: d.submission?.id,
        submissionType: d.submission?.type,
        fileName: d.submission?.fileName,
        fileSize: d.submission?.fileSize,
        submissionDate: d.submission?.submissionDate,
        validationStatus: d.submission?.validationStatus,
        isStoredOnFirebase: !!(d.submission?.filePath || d.submission?.gitUrl),
        firebasePath: d.submission?.filePath,
        gitUrl: d.submission?.gitUrl
      }));

    const firebaseCount = submissionsWithFirebase.filter(s => s.isStoredOnFirebase).length;
    const totalSubmissions = submissionsWithFirebase.length;

    return {
      submissions: submissionsWithFirebase,
      firebaseCount,
      totalSubmissions,
      syncPercentage: totalSubmissions > 0 ? Math.round((firebaseCount / totalSubmissions) * 100) : 0
    };
  };

  // Fonction pour actualiser les données et analyser Firebase
  const handleRefreshAndSync = async () => {
    setIsSyncing(true);
    try {
      // Recharger les données depuis l'API
      await refetch();

      // Analyser les soumissions Firebase après synchronisation
      const analysis = analyzeFirebaseSubmissions();

      if (analysis.totalSubmissions > 0) {
        toast.success(
          `Actualisation réussie ! ${analysis.firebaseCount}/${analysis.totalSubmissions} fichier(s) synchronisé(s)`
        );
      } else {
        toast.success('Actualisation réussie !');
      }
    } catch (error) {
      console.error('Erreur lors de l\'actualisation:', error);
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setIsSyncing(false);
    }
  };

  // Mettre à jour les compteurs quand les livrables changent
  useEffect(() => {
    const updateCounts = () => {
      const total = deliverables.length;
      const submitted = deliverables.filter(d => d.submission).length;
      const expired = deliverables.filter(d => d.isExpired && !d.submission).length;
      const pending = deliverables.filter(d => !d.submission && !d.isExpired).length;

      setSubmissionCounts({ total, submitted, pending, expired });
    };

    updateCounts();
  }, [deliverables]);

  if (!projectId) {
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

  const handleOpenSubmission = (deliverable: StudentDeliverableView) => {
    setSelectedDeliverable(deliverable);
    setIsSubmissionDialogOpen(true);
  };

  const handleSubmissionSuccess = async (deliverableId: string, submissionData: any) => {
    try {
      const result = await submitDeliverable(deliverableId, submissionData);

      if (result.success) {
        const deliverable = deliverables.find(d => d.id === deliverableId);
        toast.success(`Soumission réussie ! Le livrable "${deliverable?.name}" a été soumis avec succès sur Firebase Storage.`);

        // Fermer le dialog après un délai pour laisser voir la confirmation
        setTimeout(() => {
          setIsSubmissionDialogOpen(false);
          setSelectedDeliverable(null);
        }, 1000);
      } else {
        toast.error(result.message || "Une erreur est survenue lors de la soumission.");
      }

      return result;

    } catch (error) {
      toast.error("Une erreur inattendue est survenue lors de la soumission.");

      return {
        success: false,
        message: "Erreur inattendue"
      };
    }
  };

  const handleDownloadSubmission = async (submissionId: string, fileName: string) => {
    try {
      await downloadSubmission(submissionId, fileName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du téléchargement';
      toast.error(`Erreur: ${errorMessage}`);
    }
  };

  // Fonction pour supprimer une soumission
  const handleDeleteSubmission = async (submissionId: string, deliverableName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer votre soumission pour "${deliverableName}" ?\n\nCette action est irréversible.`)) {
      try {
        await deleteSubmissionById(submissionId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate.getTime() - now.getTime();

    if (diffMs <= 0) return null;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} heure${hours > 1 ? 's' : ''}`;
    return 'Moins d\'1 heure';
  };

  const getStatusBadge = (deliverable: any) => {
    const now = new Date();
    const deadline = new Date(deliverable.deadline);
    const isExpired = now > deadline;

    if (deliverable.submission) {
      if (deliverable.submission.validationStatus === 'valid') {
        return <Badge variant="default" className="bg-green-100 text-green-800">Soumis ✓</Badge>;
      } else if (deliverable.submission.validationStatus === 'invalid') {
        return <Badge variant="destructive">Soumis (erreurs)</Badge>;
      } else {
        return <Badge variant="secondary">En validation</Badge>;
      }
    }

    if (isExpired) {
      return <Badge variant="destructive">Expiré</Badge>;
    } else if (deadline.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Urgent</Badge>;
    } else {
      return <Badge variant="outline">À faire</Badge>;
    }
  };

  const getDeliverableIcon = (type: string) => {
    return type === 'git' ? <GitBranch className="h-4 w-4" /> : <Package className="h-4 w-4" />;
  };

  const getRuleTypeIcon = (ruleType: string) => {
    switch (ruleType) {
      case 'file_size':
        return <HardDrive className="h-3 w-3" />;
      case 'file_presence':
        return <FileText className="h-3 w-3" />;
      case 'folder_structure':
        return <FolderOpen className="h-3 w-3" />;
      case 'file_content':
        return <Code className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getSubmissionTypeIcon = (submission: any) => {
    if (submission.type === 'git') {
      return <GitBranch className="h-4 w-4 text-blue-600" />;
    } else if (submission.fileName?.endsWith('.zip')) {
      return <FileArchive className="h-4 w-4 text-purple-600" />;
    } else if (submission.fileName?.endsWith('.tar') || submission.fileName?.endsWith('.tar.gz')) {
      return <FileArchive className="h-4 w-4 text-orange-600" />;
    } else if (submission.filePath) {
      // Fallback pour les fichiers sans nom spécifique
      return <FileArchive className="h-4 w-4 text-purple-600" />;
    } else {
      return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <h2 className="text-2xl font-bold tracking-tight">Mes livrables</h2>
          <p className="text-muted-foreground">
            Consultez et soumettez vos livrables pour ce projet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefreshAndSync}
            variant="outline"
            size="sm"
            disabled={loading || isSyncing}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {isSyncing ? 'Actualisation...' : 'Actualiser'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistiques rapides - Mise à jour automatique */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissionCounts.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soumis</CardTitle>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {submissionCounts.submitted}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {submissionCounts.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirés</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {submissionCounts.expired}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des livrables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Livrables du projet
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deliverables.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun livrable disponible</h3>
              <p className="text-muted-foreground">
                Il n'y a pas encore de livrables définis pour ce projet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliverables.map((deliverable) => {
                const deadline = new Date(deliverable.deadline);
                const now = new Date();
                const isExpired = now > deadline;
                const timeRemaining = getTimeRemaining(deliverable.deadline);

                return (
                  <Card key={deliverable.id} className="border-2 hover:shadow-md transition-shadow">
                    <CardHeader className="w-full">
                      <div className="flex items-start justify-between w-full">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {getDeliverableIcon(deliverable.type)}
                          </div>
                          <div className="flex-1">
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
                              {!isExpired && timeRemaining && (
                                <div className="flex items-center gap-1 text-sm text-orange-600">
                                  <Clock className="h-4 w-4" />
                                  {timeRemaining} restant{timeRemaining.includes('s') ? 'es' : ''}
                                </div>
                              )}
                            </div>

                            {/* Règles du livrable */}
                            {deliverable.rules && deliverable.rules.length > 0 && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-900 mb-2">Règles :</h4>
                                <div className="space-y-1 text-xs text-blue-700">
                                  {deliverable.rules.map((rule, index) => (
                                    <div key={index} className="flex items-center gap-1">
                                      {getRuleTypeIcon(rule.type)}
                                      {rule.description || `Règle ${rule.type.replace('_', ' ')}`}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Résumé de la soumission */}
                            {deliverable.submission && (
                              <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                                <div className="flex items-center w-full gap-4">
                                  <div className="flex items-center gap-2">
                                    {getSubmissionTypeIcon(deliverable.submission)}
                                    <span className="text-sm font-semibold text-green-800">Soumis</span>
                                  </div>

                                  {/* Date et heure */}
                                  <div className="flex items-center gap-1 text-sm">
                                    <Calendar className="h-3 w-3 text-gray-500" />
                                    <span>{new Date(deliverable.submission.submissionDate!).toLocaleDateString('fr-FR')}</span>
                                    <Clock className="h-3 w-3 text-gray-500 ml-2" />
                                    <span>{new Date(deliverable.submission.submissionDate!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>

                                  {/* Nom du fichier ou URL Git */}
                                  <div
                                    className="flex items-center gap-1 text-sm flex-1 min-w-0"
                                  >
                                    {deliverable.submission?.gitUrl ? (
                                      <>
                                        <Link className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                        <a
                                          href={deliverable.submission!.gitUrl!}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-purple-600 hover:text-purple-800 underline cursor-pointer font-medium truncate"
                                          title="Ouvrir le lien GitHub dans une nouvelle fenêtre"
                                        >
                                          {deliverable.submission!.gitUrl}
                                        </a>
                                      </>
                                    ) : deliverable.submission?.fileName ? (
                                      <>
                                        <FileArchive className="h-3 w-3 text-purple-600 flex-shrink-0" />
                                        <button
                                          onClick={() => {
                                            handleDownloadSubmission(deliverable.submission!.id!, deliverable.submission!.fileName!);
                                          }}
                                          className="text-purple-600 hover:text-purple-800 underline cursor-pointer font-medium truncate bg-transparent border-none p-0 text-left"
                                          title="Télécharger le fichier"
                                        >
                                          {deliverable.submission.fileName}
                                        </button>
                                        {deliverable.submission.fileSize && (
                                          <span className="text-gray-500 text-xs flex-shrink-0">({formatFileSize(deliverable.submission.fileSize)})</span>
                                        )}
                                      </>
                                    ) : null}
                                  </div>

                                  {/* Statut de validation */}
                                  <div className="flex items-center gap-1 text-sm">
                                    {deliverable.submission.validationStatus === 'valid' ? (
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    ) : deliverable.submission.validationStatus === 'invalid' ? (
                                      <XCircle className="h-3 w-3 text-red-600" />
                                    ) : (
                                      <Clock className="h-3 w-3 text-orange-600" />
                                    )}
                                    <span className={`font-medium text-xs ${
                                      deliverable.submission.validationStatus === 'valid' ? 'text-green-600' :
                                      deliverable.submission.validationStatus === 'invalid' ? 'text-red-600' :
                                      'text-orange-600'
                                    }`}>
                                      {deliverable.submission.validationStatus === 'valid' ? 'Validé' :
                                      deliverable.submission.validationStatus === 'invalid' ? 'Erreurs' :
                                      'En validation'}
                                    </span>
                                  </div>

                                  {/* Indicateur de retard */}
                                  {deliverable.submission.isLate && (
                                    <div className="flex items-center gap-1 text-sm">
                                      <AlertTriangle className="h-3 w-3 text-orange-600" />
                                      <span className="text-orange-600 text-xs font-medium">
                                        +{deliverable.submission.hoursLate}h
                                      </span>
                                    </div>
                                  )}

                                  {/* Actions - Télécharger/Ouvrir */}
                                  <div className="flex items-center gap-2">
                                    {/* Bouton de téléchargement pour les fichiers */}
                                    {deliverable.submission.type === 'archive' && deliverable.submission.fileName && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                                        onClick={() => handleDownloadSubmission(deliverable.submission!.id!, deliverable.submission!.fileName!)}
                                      >
                                        <Download className="h-3 w-3" />
                                        Télécharger
                                      </Button>
                                    )}

                                    {/* Bouton pour ouvrir le lien Git */}
                                    {deliverable.submission.type === 'git' && deliverable.submission.gitUrl && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                                        onClick={() => window.open(deliverable.submission!.gitUrl!, '_blank')}
                                      >
                                        <Link className="h-3 w-3" />
                                        Ouvrir
                                      </Button>
                                    )}
                                  </div>

                                  {/* Bouton de suppression */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 text-red-600 border-red-300 hover:bg-red-50 flex-shrink-0"
                                    onClick={() => handleDeleteSubmission(deliverable.submission!.id!, deliverable.name)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Supprimer
                                  </Button>
                                </div>

                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
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
                          {deliverable.allowLateSubmission && (
                            <div className="text-xs text-orange-600">
                              <AlertTriangle className="h-3 w-3 inline mr-1" />
                              Retard autorisé (-{deliverable.latePenaltyPerHour} pts/h)
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {deliverable.canSubmit && !isExpired && (
                            <Button
                              size="sm"
                              className="gap-1"
                              onClick={() => handleOpenSubmission(deliverable)}
                              disabled={submitting}
                            >
                              <Upload className="h-4 w-4" />
                              {deliverable.submission ? 'Modifier' : 'Soumettre'}
                            </Button>
                          )}
                          {isExpired && deliverable.allowLateSubmission && !deliverable.submission && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-orange-600"
                              onClick={() => handleOpenSubmission(deliverable)}
                              disabled={submitting}
                            >
                              <AlertTriangle className="h-4 w-4" />
                              Soumettre en retard
                            </Button>
                          )}
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

      {/* Dialog de soumission */}
      {selectedDeliverable && (
        <StudentSubmissionDialog
          isOpen={isSubmissionDialogOpen}
          onClose={() => {
            setIsSubmissionDialogOpen(false);
            setSelectedDeliverable(null);
          }}
          deliverable={selectedDeliverable}
          onSubmit={(submissionData) => handleSubmissionSuccess(selectedDeliverable.id, submissionData)}
          isSubmitting={submitting}
          uploadProgress={uploadProgress}
        />
      )}
    </div>
  );
};

export default StudentProjectDeliverablesTab;
