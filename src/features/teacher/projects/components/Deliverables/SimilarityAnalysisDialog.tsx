import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  BarChart3,
  FileText,
  AlertTriangle,
  XCircle,
  Users,
  Eye,
  RefreshCw,
  Archive
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { BackendDetailedAnalysisResult, BackendSimilarityAnalysisResult } from '../../types/backend.types';

// Utilise directement l'interface backend
interface SimilarityAnalysisResult extends BackendSimilarityAnalysisResult {}

interface SimilarityAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deliverableId: string;
  deliverableName: string;
  onAnalyze: (deliverableId: string) => Promise<SimilarityAnalysisResult>;
  getSubmissionContent?: (submissionId: string) => Promise<{ content: string; fileName?: string; language?: string; }>;
  analyzeArchivesDetailed?: (archive1Path: string, archive2Path: string) => Promise<BackendDetailedAnalysisResult>;
}

const SimilarityAnalysisDialog: React.FC<SimilarityAnalysisDialogProps> = ({
  isOpen,
  onClose,
  deliverableId,
  deliverableName,
  onAnalyze,
  getSubmissionContent,
  analyzeArchivesDetailed
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SimilarityAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedComparison, setSelectedComparison] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'comparison'>('overview');
  const [selectedFile1Content, setSelectedFile1Content] = useState<string>('');
  const [selectedFile2Content, setSelectedFile2Content] = useState<string>('');
  const [loadingFileContent, setLoadingFileContent] = useState(false);

  // Track the current deliverable ID to reset state when it changes
  const [currentDeliverableId, setCurrentDeliverableId] = useState<string>('');

  const [detailedAnalysisResult, setDetailedAnalysisResult] = useState<BackendDetailedAnalysisResult | null>(null);
  const [isDetailedAnalyzing, setIsDetailedAnalyzing] = useState(false);
  const [selectedFileForComparison, setSelectedFileForComparison] = useState<{
    sourceFile: string;
    targetFile: string;
    similarity: number;
  } | null>(null);

  // Reset state when deliverable changes or dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all state when dialog closes
      setAnalysisResult(null);
      setError(null);
      setSelectedComparison(null);
      setViewMode('overview');
      setSelectedFile1Content('');
      setSelectedFile2Content('');
      setDetailedAnalysisResult(null);
      setSelectedFileForComparison(null);
      setCurrentDeliverableId('');
      setIsAnalyzing(false);
      setLoadingFileContent(false);
      setIsDetailedAnalyzing(false);
    }
  }, [isOpen]);

  // Reset state when deliverable ID changes
  useEffect(() => {
    if (deliverableId && deliverableId !== currentDeliverableId) {
      console.log('Deliverable changed from', currentDeliverableId, 'to', deliverableId);

      // Reset all state for new deliverable
      setAnalysisResult(null);
      setError(null);
      setSelectedComparison(null);
      setViewMode('overview');
      setSelectedFile1Content('');
      setSelectedFile2Content('');
      setDetailedAnalysisResult(null);
      setSelectedFileForComparison(null);
      setCurrentDeliverableId(deliverableId);
      setIsAnalyzing(false);
      setLoadingFileContent(false);
      setIsDetailedAnalyzing(false);
    }
  }, [deliverableId, currentDeliverableId]);

  // Lancer l'analyse automatiquement à l'ouverture
  useEffect(() => {
    if (isOpen && deliverableId && !analysisResult && !isAnalyzing && deliverableId === currentDeliverableId) {
      console.log('Auto-launching analysis for deliverable:', deliverableId);
      handleAnalyze();
    }
  }, [isOpen, deliverableId, analysisResult, isAnalyzing, currentDeliverableId]);

  const handleAnalyze = async () => {
    try {
      console.log('Starting analysis for deliverable:', deliverableId);
      setIsAnalyzing(true);
      setError(null);
      setAnalysisResult(null); // Clear previous results

      const result = await onAnalyze(deliverableId);
      console.log('Analysis completed for deliverable:', deliverableId, result);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis failed for deliverable:', deliverableId, err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleComparisonSelect = async (comparison: any) => {
    setSelectedComparison(comparison);
    setViewMode('comparison');
    setLoadingFileContent(true);
    setSelectedFileForComparison(null);
    setDetailedAnalysisResult(null);

    try {
      // AJOUT DE LOGS POUR DÉBOGUER
      console.log('Comparaison sélectionnée:', {
        method: comparison.method,
        type1: comparison.details?.type1,
        type2: comparison.details?.type2,
        isArchive: comparison.details?.type1 === 'archive' && comparison.details?.type2 === 'archive'
      });

      // Vérifier si c'est une comparaison d'archives
      const isArchiveComparison = comparison.details?.type1 === 'archive' && comparison.details?.type2 === 'archive';

      if (isArchiveComparison && analyzeArchivesDetailed) {
        console.log('Lancement analyse détaillée des archives...');

        // Récupérer les chemins des soumissions
        const submission1 = analysisResult?.submissions.find(s => s.id === comparison.submission1Id);
        const submission2 = analysisResult?.submissions.find(s => s.id === comparison.submission2Id);

        console.log('Chemins des archives:', {
          archive1: submission1?.filePath,
          archive2: submission2?.filePath
        });

        if (submission1?.filePath && submission2?.filePath) {
          setIsDetailedAnalyzing(true);

          try {
            const detailedResult = await analyzeArchivesDetailed(submission1.filePath, submission2.filePath);
            console.log('Analyse détaillée terminée:', detailedResult);
            setDetailedAnalysisResult(detailedResult);

            // Sélectionner automatiquement le fichier le plus suspect pour l'affichage
            if (detailedResult.suspiciousFiles.length > 0) {
              const mostSuspicious = detailedResult.suspiciousFiles[0];
              if (mostSuspicious.bestMatch) {
                setSelectedFileForComparison({
                  sourceFile: mostSuspicious.sourceFile,
                  targetFile: mostSuspicious.bestMatch.fileName,
                  similarity: mostSuspicious.bestScore
                });

                // Charger le contenu des fichiers les plus suspects
                await loadArchiveFileContents(
                  submission1.filePath,
                  submission2.filePath,
                  mostSuspicious.sourceFile,
                  mostSuspicious.bestMatch.fileName
                );
              }
            }
          } catch (detailedError) {
            console.error('Erreur analyse détaillée:', detailedError);
            // Fallback vers l'ancienne méthode
            await loadRegularFileContents(comparison);
          } finally {
            setIsDetailedAnalyzing(false);
          }
        } else {
          console.log('Chemins d\'archives manquants, fallback vers analyse normale');
          await loadRegularFileContents(comparison);
        }
      } else {
        console.log('Analyse normale (non-archive)');
        await loadRegularFileContents(comparison);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setSelectedFile1Content('Erreur lors du chargement du fichier');
      setSelectedFile2Content('Erreur lors du chargement du fichier');
    } finally {
      setLoadingFileContent(false);
    }
  };

  const loadArchiveFileContents = async (
    archive1Path: string,
    archive2Path: string,
    fileName1: string,
    fileName2: string
  ) => {
    try {
      const [content1, content2] = await Promise.all([
        fetchArchiveFileContent(archive1Path, fileName1),
        fetchArchiveFileContent(archive2Path, fileName2)
      ]);

      setSelectedFile1Content(content1);
      setSelectedFile2Content(content2);
    } catch (error) {
      console.error('Erreur chargement fichiers archive:', error);
      setSelectedFile1Content(`// Erreur lors du chargement: ${fileName1}\n// ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setSelectedFile2Content(`// Erreur lors du chargement: ${fileName2}\n// ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const loadRegularFileContents = async (comparison: any) => {
    const [content1, content2] = await Promise.all([
      fetchFileContent(comparison.submission1Id, comparison.details.file1),
      fetchFileContent(comparison.submission2Id, comparison.details.file2)
    ]);

    setSelectedFile1Content(content1);
    setSelectedFile2Content(content2);
  };

  const fetchArchiveFileContent = async (archivePath: string, fileName: string): Promise<string> => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

      const response = await fetch(`${API_BASE_URL}/deliverables/archive-file-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          archivePath,
          fileName
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.content || `// Fichier: ${fileName}\n// Contenu non disponible`;
    } catch (error) {
      console.error('Erreur lors du chargement du fichier archive:', error);
      return `// Erreur lors du chargement: ${fileName}\n// ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
    }
  };

  // Fonction pour récupérer le contenu d'un fichier
  const fetchFileContent = async (submissionId: string, fileName?: string): Promise<string> => {
    try {
      if (getSubmissionContent) {
        const result = await getSubmissionContent(submissionId);
        return result.content || `// Fichier: ${fileName || 'unknown'}\n// Contenu non disponible`;
      } else {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

        const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/content`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data.data?.content || `// Fichier: ${fileName || 'unknown'}\n// Contenu non disponible`;
      }
    } catch (error) {
      console.error('Erreur lors du chargement du fichier:', error);
      return `// Erreur lors du chargement du fichier: ${fileName || 'unknown'}\n// ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
    }
  };

  const handleFileSelectionChange = async (sourceFile: string, targetFile: string, similarity: number) => {
    if (!detailedAnalysisResult || !selectedComparison) return;

    setSelectedFileForComparison({ sourceFile, targetFile, similarity });
    setLoadingFileContent(true);

    const submission1 = analysisResult?.submissions.find(s => s.id === selectedComparison.submission1Id);
    const submission2 = analysisResult?.submissions.find(s => s.id === selectedComparison.submission2Id);

    if (submission1?.filePath && submission2?.filePath) {
      await loadArchiveFileContents(submission1.filePath, submission2.filePath, sourceFile, targetFile);
    }

    setLoadingFileContent(false);
  };

  // Fonction pour détecter le langage de programmation
  const getLanguageFromFileName = (fileName?: string): string => {
    if (!fileName) return 'plaintext';

    const ext = fileName.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'txt': 'plaintext',
    };

    return languageMap[ext || ''] || 'plaintext';
  };

  const getSimilarityBadgeColor = (score: number) => {
    if (score >= 0.6) return 'bg-red-100 text-red-800 border-red-300';
    if (score >= 0.4) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (score >= 0.2) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const OverviewView = () => (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Soumissions analysées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisResult?.validSubmissionsCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              sur {analysisResult?.submissionsCount ?? 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comparaisons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysisResult?.statistics?.totalComparisons ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {analysisResult?.statistics?.successfulComparisons ?? 0} réussies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paires suspectes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analysisResult?.statistics?.suspiciousCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              ≥ {((analysisResult?.threshold || 0) * 100).toFixed(0)}% similarité
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Similarité moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((analysisResult?.statistics?.averageSimilarity || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Max: 100%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertes pour paires suspectes */}
      {analysisResult && analysisResult.suspiciousPairs.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{analysisResult.suspiciousPairs.length} paire(s) suspecte(s)</strong> détectée(s)
            avec une similarité élevée (≥ {((analysisResult.threshold) * 100).toFixed(0)}%).
          </AlertDescription>
        </Alert>
      )}

      {/* Liste des comparaisons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Résultats des comparaisons
            <Badge variant="secondary" className="ml-auto">
              {analysisResult?.comparisons.length || 0} comparaisons
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {analysisResult?.comparisons.map((comparison, index) => (
              <div
                key={`${comparison.submission1Id}-${comparison.submission2Id}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleComparisonSelect(comparison)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{comparison.group1.name}</span>
                    <span className="text-gray-400">vs</span>
                    <span className="font-medium">{comparison.group2.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`${getSimilarityBadgeColor(comparison.similarityScore)} font-medium`}
                  >
                    {comparison.similarityPercentage}%
                  </Badge>

                  {comparison.isSuspicious && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    Comparer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ComparisonView = () => (
    <div className="space-y-4">
      {/* En-tête de la comparaison */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('overview')}
            className="gap-2"
          >
            ← Retour
          </Button>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-medium">{selectedComparison?.group1.name}</span>
            <span className="text-gray-400">vs</span>
            <span className="font-medium">{selectedComparison?.group2.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            className={`${getSimilarityBadgeColor(selectedComparison?.similarityScore || 0)} font-medium`}
          >
            {selectedComparison?.similarityPercentage}% similarité
          </Badge>
        </div>
      </div>

      {/*Affichage des résultats d'analyse détaillée pour les archives */}
      {detailedAnalysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Analyse détaillée des archives
              {isDetailedAnalyzing && <RefreshCw className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Statistiques rapides */}
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Similarité globale:</span>
                  <div className="text-lg font-bold">
                    {(detailedAnalysisResult.globalSimilarity * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="font-medium">Structure:</span>
                  <div className="text-lg font-bold">
                    {(detailedAnalysisResult.structuralSimilarity * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="font-medium">Contenu:</span>
                  <div className="text-lg font-bold">
                    {(detailedAnalysisResult.averageFileScore * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="font-medium">Fichiers suspects:</span>
                  <div className="text-lg font-bold text-red-600">
                    {detailedAnalysisResult.statistics.suspiciousFilesCount}
                  </div>
                </div>
              </div>

              {/* Sélecteur de fichiers à comparer */}
              {detailedAnalysisResult.fileComparisons.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm mb-2">Choisir les fichiers à comparer:</h5>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {detailedAnalysisResult.fileComparisons
                      .filter((comp: { bestScore: number }) => comp.bestScore > 0.3)
                      .slice(0, 10)
                      .map((fileComp, index) => (
                      <button
                        key={index}
                        className={`w-full text-left p-2 rounded border text-sm transition-colors ${
                          selectedFileForComparison?.sourceFile === fileComp.sourceFile
                            ? 'bg-blue-50 border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => fileComp.bestMatch && handleFileSelectionChange(
                          fileComp.sourceFile,
                          fileComp.bestMatch.fileName,
                          fileComp.bestScore
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{fileComp.sourceFile}</p>
                            {fileComp.bestMatch && (
                              <p className="text-xs text-muted-foreground">
                                → {fileComp.bestMatch.fileName}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={`${getSimilarityColor(fileComp.bestScore)} text-xs`}
                          >
                            {(fileComp.bestScore * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparaison de fichiers */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Comparaison de fichiers
            {selectedFileForComparison && (
              <span className="text-xs text-muted-foreground ml-2">
                {selectedFileForComparison.sourceFile} vs {selectedFileForComparison.targetFile}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingFileContent || isDetailedAnalyzing ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                {isDetailedAnalyzing ? 'Analyse des archives en cours...' : 'Chargement des fichiers...'}
              </div>
            </div>
          ) : (
            <div className="relative bg-white border rounded-lg overflow-hidden">
              <div className="grid grid-cols-2 h-full">
                {/* Panel gauche */}
                <div className="border-r">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h4 className="text-sm font-medium">{selectedComparison?.group1.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {selectedFileForComparison
                        ? selectedFileForComparison.sourceFile
                        : selectedComparison?.details?.file1 || 'Fichier 1'
                      }
                    </p>
                  </div>
                  <Editor
                    height="570px"
                    language={getLanguageFromFileName(
                      selectedFileForComparison?.sourceFile || selectedComparison?.details?.file1 || ''
                    )}
                    value={selectedFile1Content}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 12,
                      lineNumbers: 'on',
                      automaticLayout: true,
                      wordWrap: 'on',
                      theme: 'vs'
                    }}
                  />
                </div>

                {/* Panel droit */}
                <div>
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h4 className="text-sm font-medium">{selectedComparison?.group2.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {selectedFileForComparison
                        ? selectedFileForComparison.targetFile
                        : selectedComparison?.details?.file2 || 'Fichier 2'
                      }
                    </p>
                  </div>
                  <Editor
                    height="570px"
                    language={getLanguageFromFileName(
                      selectedFileForComparison?.targetFile || selectedComparison?.details?.file2 || ''
                    )}
                    value={selectedFile2Content}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 12,
                      lineNumbers: 'on',
                      automaticLayout: true,
                      wordWrap: 'on',
                      theme: 'vs'
                    }}
                  />
                </div>
              </div>

              {/* Statistiques de diff en overlay */}
              <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg p-3 border z-10">
                <div className="text-xs space-y-1">
                  <div>
                    Similarité:
                    <span className="font-medium text-red-600 ml-1">
                      {selectedFileForComparison
                        ? `${(selectedFileForComparison.similarity * 100).toFixed(1)}%`
                        : `${selectedComparison?.similarityPercentage}%`
                      }
                    </span>
                  </div>
                  <div>
                    Méthode:
                    <span className="font-medium ml-1">
                      {detailedAnalysisResult ? 'analyse détaillée' : selectedComparison?.method}
                    </span>
                  </div>
                  {((selectedFileForComparison?.similarity ?? 0) >= 0.6 || selectedComparison?.isSuspicious) && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs font-medium">Suspect</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const getSimilarityColor = (score: number) => {
    if (score >= 0.6) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 0.4) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 0.2) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[95vw] max-h-[95vh] w-full h-full p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analyse de similarité - {deliverableName}
              </DialogTitle>
              {analysisResult && (
                <p className="text-sm text-muted-foreground mt-1">
                  Analysé le {formatDateTime(analysisResult.processedAt)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 mr-8">
              {!isAnalyzing && analysisResult && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyze}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Relancer l'analyse
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="text-center">
                <h3 className="font-medium mb-1">Analyse en cours...</h3>
                <p className="text-sm text-muted-foreground">
                  Comparaison des soumissions pour détecter les similarités
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <XCircle className="h-16 w-16 text-red-500" />
              <div className="text-center">
                <h3 className="font-medium mb-1 text-red-700">Erreur d'analyse</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Deliverable: {deliverableId}
                </p>
                <Button
                  onClick={handleAnalyze}
                  className="mt-4 gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Réessayer
                </Button>
              </div>
            </div>
          ) : analysisResult ? (
            <div className="h-full overflow-auto p-6">
              {viewMode === 'overview' ? <OverviewView /> : <ComparisonView />}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimilarityAnalysisDialog;
