import React, { useState, useCallback } from 'react';
import {
  Upload,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  FileArchive,
  HardDrive,
  Info
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { StudentDeliverableView, SubmitDeliverableData } from '@/domains/project/models/deliverableModels';

const Progress = ({ value = 0, className = "" }: { value?: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

interface StudentSubmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deliverable: StudentDeliverableView;
  onSubmit: (data: SubmitDeliverableData) => Promise<{ success: boolean; validation?: any; message?: string }>;
  isSubmitting: boolean;
  uploadProgress?: number;
}

const StudentSubmissionDialog: React.FC<StudentSubmissionDialogProps> = ({
  isOpen,
  onClose,
  deliverable,
  onSubmit,
  isSubmitting,
  uploadProgress = 0
}) => {
  const submissionType = deliverable.type;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState('');
  const [gitUrl, setGitUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState<any>(null);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        setFileSizeError(`Fichier trop volumineux. Taille maximum: 100MB, taille du fichier: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }

      setSelectedFile(file);
      setCustomFileName('');
      setValidationResult(null);
      setFileSizeError(null);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file && (file.type.includes('zip') || file.name.endsWith('.zip') || file.name.endsWith('.tar.gz'))) {
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        setFileSizeError(`Fichier trop volumineux. Taille maximum: 100MB, taille du fichier: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }
      setSelectedFile(file);
      setValidationResult(null);
      setFileSizeError(null);
    }
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submissionType === 'archive' && !selectedFile) {
      return;
    }
    if (submissionType === 'git' && !gitUrl.trim()) {
      return;
    }

    const submissionData: SubmitDeliverableData = {
      deliverableId: deliverable.id,
      type: submissionType,
      ...(submissionType === 'archive' ? {
        file: selectedFile!,
        fileName: customFileName.trim() || selectedFile!.name
      } : { gitUrl: gitUrl.trim() })
    };

    try {
      const result = await onSubmit(submissionData);

      if (result.success) {
        setSubmitSuccess(true);
        setValidationResult(result.validation);
        setSubmissionDetails({
          filePath: submissionType === 'archive' ? 'Fichier uploadé sur Firebase Storage' : undefined,
          fileName: customFileName.trim(),
          fileSize: submissionType === 'archive' ? selectedFile?.size : undefined,
          gitUrl: gitUrl,
          submissionDate: new Date(),
          type: submissionType
        });

        handleClose();

      } else {
        setValidationResult({
          valid: false,
          details: [{ rule: 'general', valid: false, message: result.message || 'Erreur lors de la soumission' }]
        });
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        details: [{ rule: 'general', valid: false, message: 'Erreur inattendue' }]
      });
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedFile(null);
      setCustomFileName('');
      setGitUrl('');
      setValidationResult(null);
      setSubmitSuccess(false);
      setSubmissionDetails(null);
      setFileSizeError(null);
      onClose();
    }
  };

  const isDeadlinePassed = new Date() > new Date(deliverable.deadline);
  const canSubmit = submissionType === 'archive'
    ? (selectedFile && customFileName.trim())
    : (gitUrl.trim() && customFileName.trim());
  const fileSize = selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : null;

  return (
    <Dialog open={isOpen} onOpenChange={!isSubmitting ? handleClose : undefined}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {deliverable.submission ? 'Modifier ma soumission' : 'Soumettre le livrable'}
          </DialogTitle>
          <DialogDescription>
            {deliverable.name}
          </DialogDescription>
        </DialogHeader>

        {/* Informations du livrable */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Deadline: {new Date(deliverable.deadline).toLocaleString('fr-FR')}
            </div>
            {isDeadlinePassed && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Deadline dépassée
              </Badge>
            )}
          </div>
          {deliverable.allowLateSubmission && isDeadlinePassed && (
            <div className="mt-2 text-xs text-orange-600">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              Soumission en retard autorisée (malus: -{deliverable.latePenaltyPerHour} pts/heure)
            </div>
          )}
        </div>

        {/* Règles du livrable */}
        {deliverable.rules && deliverable.rules.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-amber-900 mb-2">Règles à respecter :</h4>
            <div className="space-y-1 text-xs text-amber-700">
              {deliverable.rules.map((rule, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                  <span>{rule.description || `Règle ${rule.type.replace('_', ' ')}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {submitSuccess ? (
          <div className="text-center py-8">
            <div className="mb-6">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-700 mb-2">🎉 Soumission réussie !</h3>
              <p className="text-sm text-gray-600 mb-4">
                Votre livrable a été envoyé avec succès !
              </p>
            </div>

            {/* Résumé de la soumission */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left mb-6">
              <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                <FileArchive className="h-4 w-4" />
                Résumé de votre soumission
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{submissionDetails?.submissionDate?.toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{submissionDetails?.type}</span>
                </div>
                {submissionDetails?.fileName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {submissionDetails?.type === 'git' ? 'Nom du projet:' : 'Fichier:'}
                    </span>
                    <span className="font-medium">{submissionDetails.fileName}</span>
                  </div>
                )}
                {submissionDetails?.fileSize && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taille:</span>
                    <span className="font-medium">{formatFileSize(submissionDetails.fileSize)}</span>
                  </div>
                )}
                {submissionDetails?.gitUrl && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Repository:</span>
                    <span className="font-medium text-blue-600 break-all">{submissionDetails.gitUrl}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Stockage:</span>
                  <span className="font-medium">Firebase Storage</span>
                </div>
              </div>
            </div>

            {validationResult && (
              <div className="text-left mb-6">
                <h4 className="font-medium mb-2 text-green-800">Résultats de validation :</h4>
                <div className="space-y-1">
                  {validationResult.details?.map((detail: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm p-2 rounded"
                         style={{ backgroundColor: detail.valid ? '#f0f9ff' : '#fef2f2' }}>
                      {detail.valid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={detail.valid ? 'text-green-700' : 'text-red-700'}>
                        {detail.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 mb-4">
              Cette fenêtre se fermera automatiquement dans quelques secondes...
            </div>

            <Button onClick={handleClose} className="bg-green-600 hover:bg-green-700">
              Fermer
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type de soumission (défini par le professeur) */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Type de soumission requis</Label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                    submissionType === 'archive'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-100 opacity-60'
                  }`}
                >
                  <Upload className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium flex items-center gap-2">
                      Archive
                      {submissionType === 'archive' && (
                        <Badge variant="default" className="text-xs">Requis</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">.zip, .tar.gz</div>
                  </div>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                    submissionType === 'git'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-100 opacity-60'
                  }`}
                >
                  <GitBranch className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium flex items-center gap-2">
                      Dépôt Git
                      {submissionType === 'git' && (
                        <Badge variant="default" className="text-xs">Requis</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Lien public</div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Info className="h-4 w-4 pt-0.5" />
                Le type de soumission est défini par votre enseignant.
              </p>
            </div>

            {/* Zone de soumission */}
            {submissionType === 'archive' ? (
              <div className="space-y-4">
                <Label>Fichier archive</Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-400 bg-blue-50'
                      : selectedFile
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                  } ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {selectedFile ? (
                    <div className="space-y-2">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                      <p className="text-lg font-medium">{selectedFile.name}</p>
                      <p className="text-gray-600">{fileSize} MB</p>
                      {!isSubmitting && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setCustomFileName('');
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Changer de fichier
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium">Déposez votre archive ici</p>
                        <p className="text-gray-600">ou cliquez pour sélectionner</p><br></br>
                        <p className="text-gray-600">Taille maximale: 100 Mo</p><br></br>
                      </div>
                      <input
                        type="file"
                        accept=".zip,.tar.gz,.rar"
                        onChange={handleFileSelect}
                        disabled={isSubmitting}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                      >
                        Sélectionner un fichier
                      </label>
                    </div>
                  )}
                </div>

                {/* Alerte d'erreur de taille de fichier */}
                {fileSizeError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {fileSizeError}
                    </AlertDescription>
                  </Alert>
                )}

                {selectedFile && (
                  <div className="space-y-2">
                    <Label htmlFor="customFileName">
                      Nom du fichier <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customFileName"
                      type="text"
                      placeholder="Ex: Projet_React_Group1_4AL1..."
                      value={customFileName}
                      onChange={(e) => setCustomFileName(e.target.value)}
                      disabled={isSubmitting}
                      required
                      className={!customFileName.trim() ? 'border-red-300 focus:border-red-500' : ''}
                    />
                    <p className="text-xs text-gray-600">
                      <span className="text-red-500">*</span> Ce nom sera utilisé pour identifier votre soumission.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Label htmlFor="gitUrl">URL du dépôt Git</Label>
                <Input
                  id="gitUrl"
                  type="url"
                  placeholder="https://github.com/username/repository"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  disabled={isSubmitting}
                  required={submissionType === 'git'}
                />
                <p className="text-sm text-gray-600">
                  Le dépôt doit être public pour être accessible.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="customProjectName">
                    Nom du projet <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customProjectName"
                    type="text"
                    placeholder="Ex: Application E-commerce, Site Vitrine React..."
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className={!customFileName.trim() ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-600">
                    <span className="text-red-500">*</span> Donnez un nom descriptif à votre projet pour faciliter l'identification.
                  </p>
                  {!customFileName.trim() && (
                    <p className="text-xs text-red-500">
                      ⚠️ Le nom du projet est obligatoire
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Barre de progression pendant l'upload */}
            {isSubmitting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Envoi de votre livrable...
                  </span>
                  <span className="font-medium">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} />
                <p className="text-xs text-gray-500 text-center">
                  {uploadProgress < 30 && "Préparation du fichier..."}
                  {uploadProgress >= 30 && uploadProgress < 70 && "Upload en cours..."}
                  {uploadProgress >= 70 && uploadProgress < 100 && "Finalisation..."}
                  {uploadProgress === 100 && "Validation en cours..."}
                </p>
              </div>
            )}

            {/* Résultats de validation */}
            {validationResult && !submitSuccess && (
              <Alert variant={validationResult.valid ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">
                      {validationResult.valid ? 'Validation réussie' : 'Erreur'}
                    </div>
                    {validationResult.details?.map((detail: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {detail.valid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span>{detail.message}</span>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Envoi...
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {deliverable.submission ? 'Modifier' : 'Soumettre'}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentSubmissionDialog;
