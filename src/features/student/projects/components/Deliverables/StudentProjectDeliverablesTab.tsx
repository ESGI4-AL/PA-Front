import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Package,
  LibraryBig,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  GitBranch,
  AlertCircle,
  Timer,
  ArrowDownToLine,
  Link,
  Download,
  Trash2,
  RefreshCw,
  Dot,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useStudentDeliverables } from '../../hooks/useStudentDeliverables';
import { useStudentGroups } from '../../hooks/useStudentGroups';
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

  const {
    userGroup,
    loading: groupLoading
  } = useStudentGroups(projectId || '');

  // États pour le dialog de soumission
  const [selectedDeliverable, setSelectedDeliverable] = useState<StudentDeliverableView | null>(null);
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);

  // États pour le dialog de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<{
    id: string;
    deliverableName: string;
  } | null>(null);

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
      const now = new Date();
      const total = deliverables.length;
      const submitted = deliverables.filter(d => d.submission).length;

      // Calculer les expirés : tous les livrables dont la deadline est passée
      const expired = deliverables.filter(d => {
        const deadline = new Date(d.deadline);
        return now > deadline;
      }).length;

      // Calculer les en attente : livrables non soumis et non expirés
      const pending = deliverables.filter(d => {
        const deadline = new Date(d.deadline);
        return !d.submission && now <= deadline;
      }).length;

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
        toast.success(`Soumission réussie ! Le livrable "${deliverable?.name}" a été soumis avec succès !`);

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

  const handleDeleteSubmission = (submissionId: string, deliverableName: string) => {
    setSubmissionToDelete({ id: submissionId, deliverableName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSubmission = async () => {
    if (!submissionToDelete) return;

    try {
      await deleteSubmissionById(submissionToDelete.id);
      toast.success(`Soumission supprimée avec succès pour "${submissionToDelete.deliverableName}"`);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la soumission');
    } finally {
      setDeleteDialogOpen(false);
      setSubmissionToDelete(null);
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
      return <Badge variant="outline">Non soumis</Badge>;
    } else if (deadline.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return <Badge variant="secondary" className="bg-red-100 text-red-800">Urgent</Badge>;
    } else {
      return <Badge variant="outline">À faire</Badge>;
    }
  };

  const getDeliverableIcon = (type: string) => {
    return type === 'git' ? <GitBranch className="h-4 w-4" /> : <Package className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading || groupLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const isInGroup = !!userGroup;

  // Si l'étudiant n'est pas dans un groupe, afficher le message d'invitation
  if (!isInGroup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Mes livrables</h2>
            <p className="text-muted-foreground">
              Consultez et soumettez vos livrables pour ce projet
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Vous devez rejoindre un groupe</h3>
              <Alert className="mb-6 max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Pour accéder aux livrables de ce projet, vous devez d'abord faire partie d'un groupe. Rejoignez un groupe existant ou créez le vôtre dans l'onglet Groupes.
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
    );
  }

  return (
    <div className="space-y-6">
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
            <LibraryBig className="h-5 w-5" />
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
                          <div className="mt-[7px]">
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
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getStatusBadge(deliverable)}
                          <Badge variant="outline">
                            {deliverable.type === 'git' ? 'Git' : 'Archive'}
                          </Badge>
                          {isExpired && !deliverable.allowLateSubmission && (
                            <Badge variant="destructive">
                              Expiré
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="ml-6.5">
                      {/* Règles du livrable */}
                      {deliverable.rules && deliverable.rules.length > 0 && (
                        <div className="mt-3 mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">Règles :</h4>
                          <div className="space-y-1 text-xs text-blue-700">
                            {deliverable.rules.map((rule, index) => (
                              <div key={index} className="flex items-center gap-1">
                                <Dot className="h-6 w-6" />
                                {rule.description || `Règle ${rule.type.replace('_', ' ')}`}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Résumé de la soumission */}
                      {deliverable.submission && (
                        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                          <div className="flex items-center w-full gap-4">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-800">Soumis</span>
                            </div>

                            {/* Date et heure */}
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3.5 w-3.5 text-black-500" />
                              <span>{new Date(deliverable.submission.submissionDate!).toLocaleDateString('fr-FR')}</span>
                              <Clock className="h-3.5 w-3.5 text-black-500 ml-2" />
                              <span>{new Date(deliverable.submission.submissionDate!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            {/* Nom du fichier ou URL Git */}
                            <div
                              className="flex items-center gap-1 text-sm flex-1 min-w-0"
                            >
                              {deliverable.submission?.gitUrl ? (
                                <>
                                  <Link className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                                  <div className="group relative inline-block flex-1 min-w-0">
                                    <a
                                      href={deliverable.submission!.gitUrl!}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-purple-600 hover:text-purple-800 underline cursor-pointer font-medium truncate block"
                                    >
                                      {deliverable.submission!.gitUrl}
                                    </a>
                                    <div className="absolute bottom-full left-0 mb-2 px-3 py-1 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                      Ouvrir le lien GitHub dans une nouvelle fenêtre
                                      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  </div>
                                </>
                              ) : deliverable.submission?.fileName ? (
                                <>
                                  <ArrowDownToLine className="h-3.5 w-3.5 text-black-600 flex-shrink-0" />
                                  <div className="group relative inline-block flex-1 min-w-0">
                                    <button
                                      onClick={() => {
                                        handleDownloadSubmission(deliverable.submission!.id!, deliverable.submission!.fileName!);
                                      }}
                                      className="text-black-600 hover:text-black-800 underline cursor-pointer font-medium truncate bg-transparent border-none p-0 text-left block"
                                    >
                                      {deliverable.submission.fileName}
                                    </button>
                                    <div className="absolute bottom-full left-0 mb-2 px-3 py-1 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                                      Télécharger le fichier
                                      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  </div>
                                  {deliverable.submission.fileSize && (
                                    <span className="text-gray-500 text-xs flex-shrink-0">({formatFileSize(deliverable.submission.fileSize)})</span>
                                  )}
                                </>
                              ) : null}
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

                            {/* Bouton de suppression - Toujours activé si le livrable est modifiable */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-red-600 border-red-300 hover:bg-red-50 flex-shrink-0"
                              onClick={() => handleDeleteSubmission(deliverable.submission!.id!, deliverable.name)}
                              title="Supprimer cette soumission"
                            >
                              <Trash2 className="h-3 w-3" />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                       )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          {deliverable.allowLateSubmission && (
                            <div className="text-xs text-orange-600">
                              <AlertTriangle className="h-4 w-4 inline mr-1 mb-1" />
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
                          {/* Bouton modifier/soumettre pour les livrables expirés avec retards autorisés */}
                          {isExpired && deliverable.allowLateSubmission && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-orange-600 border-orange-300 hover:bg-orange-50"
                              onClick={() => handleOpenSubmission(deliverable)}
                              disabled={submitting}
                              title={deliverable.submission ? "Modifier la soumission (en retard)" : "Soumettre en retard"}
                            >
                              <AlertTriangle className="h-4 w-4" />
                              {deliverable.submission ? 'Modifier (retard)' : 'Soumettre en retard'}
                            </Button>
                          )}
                          {/* Bouton grisé si expiré et retards non autorisés */}
                          {isExpired && !deliverable.allowLateSubmission && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 opacity-50 cursor-not-allowed"
                              disabled={true}
                              title={deliverable.submission ? "Impossible de modifier : livrable expiré et retards non autorisés" : "Impossible de soumettre : livrable expiré et retards non autorisés"}
                            >
                              <Upload className="h-4 w-4" />
                              {deliverable.submission ? 'Modifier' : 'Soumettre'}
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

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader >
            <AlertDialogTitle className="flex items-center gap-2">
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-4">
              Êtes-vous sûr de vouloir supprimer votre soumission pour{' '}
              <span className="font-semibold">"{submissionToDelete?.deliverableName}"</span> ?
            </AlertDialogDescription>
            <div className="flex items-center gap-2 text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-200 mt-4">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>Cette action est irréversible et supprimera définitivement votre fichier.</span>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSubmission}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentProjectDeliverablesTab;
