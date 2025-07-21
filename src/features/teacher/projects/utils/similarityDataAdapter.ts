import {
  BackendSimilarityAnalysisResult,
  BackendComparison,
  BackendSubmissionInfo
} from '../types/backend.types';

// Interface correspondant à ce qu'attend SimilarityAnalysisDialog
export interface FrontendSimilarityResult {
  deliverableId: string;
  deliverableName: string;
  submissionsCount: number;
  validSubmissionsCount: number;
  comparisons: FrontendComparison[];
  suspiciousPairs: FrontendComparison[];
  similarityMatrix: { [key: string]: { [key: string]: number } };
  statistics: {
    totalComparisons: number;
    successfulComparisons: number;
    errorCount: number;
    suspiciousCount: number;
    averageSimilarity: number;
    maxSimilarity: number;
  };
  threshold: number;
  submissions: FrontendSubmissionInfo[];
  processedAt: string;
}

export interface FrontendComparison {
  submission1Id: string;
  submission2Id: string;
  group1: { id: string; name: string };
  group2: { id: string; name: string };
  similarityScore: number;
  similarityPercentage: number;
  method: string;
  algorithms: any[];
  details: {
    file1: string;
    file2: string;
    type1: string;
    type2: string;
    timestamp: string;
    error?: string;
  };
  isSuspicious: boolean;
  comparedAt: string;
}

export interface FrontendSubmissionInfo {
  id: string;
  groupId: string;
  groupName: string;
  fileName?: string;
  fileSize?: number;
  filePath?: string;
  gitUrl?: string;
  submissionDate: string;
  isLate: boolean;
  validationStatus: 'pending' | 'valid' | 'invalid';
  similarityScore?: number;
}

/**
 * Adaptateur pour convertir les données backend vers le format frontend
 */
export class SimilarityDataAdapter {

  /**
   * Convertit les résultats d'analyse de similarité du backend vers le format frontend
   */
  static adaptSimilarityResult(backendResult: BackendSimilarityAnalysisResult): FrontendSimilarityResult {
    return {
      deliverableId: backendResult.deliverableId,
      deliverableName: backendResult.deliverableName,
      submissionsCount: backendResult.submissionsCount,
      validSubmissionsCount: backendResult.validSubmissionsCount,
      comparisons: backendResult.comparisons.map(this.adaptComparison),
      suspiciousPairs: backendResult.suspiciousPairs.map(this.adaptComparison),
      similarityMatrix: backendResult.similarityMatrix,
      statistics: {
        totalComparisons: backendResult.statistics.totalComparisons,
        successfulComparisons: backendResult.statistics.successfulComparisons,
        errorCount: backendResult.statistics.errorCount,
        suspiciousCount: backendResult.statistics.suspiciousCount,
        averageSimilarity: backendResult.statistics.averageSimilarity,
        maxSimilarity: backendResult.statistics.maxSimilarity,
      },
      threshold: backendResult.threshold,
      submissions: backendResult.submissions.map(this.adaptSubmissionInfo),
      processedAt: backendResult.processedAt,
    };
  }

  /**
   * Convertit une comparaison backend vers le format frontend
   */
  private static adaptComparison(backendComparison: BackendComparison): FrontendComparison {
    return {
      submission1Id: backendComparison.submission1Id,
      submission2Id: backendComparison.submission2Id,
      group1: {
        id: backendComparison.group1.id,
        name: backendComparison.group1.name,
      },
      group2: {
        id: backendComparison.group2.id,
        name: backendComparison.group2.name,
      },
      similarityScore: backendComparison.similarityScore,
      similarityPercentage: backendComparison.similarityPercentage,
      method: backendComparison.method,
      algorithms: backendComparison.algorithms,
      details: {
        file1: backendComparison.details.file1,
        file2: backendComparison.details.file2,
        type1: backendComparison.details.type1,
        type2: backendComparison.details.type2,
        timestamp: backendComparison.details.timestamp,
        error: backendComparison.details.error,
      },
      isSuspicious: backendComparison.isSuspicious,
      comparedAt: backendComparison.comparedAt,
    };
  }

  /**
   * Convertit les informations de soumission backend vers le format frontend
   */
  private static adaptSubmissionInfo(backendSubmission: BackendSubmissionInfo): FrontendSubmissionInfo {
    return {
      id: backendSubmission.id,
      groupId: backendSubmission.groupId,
      groupName: backendSubmission.groupName,
      fileName: backendSubmission.fileName,
      fileSize: backendSubmission.fileSize,
      filePath: backendSubmission.filePath,
      gitUrl: backendSubmission.gitUrl,
      submissionDate: backendSubmission.submissionDate,
      isLate: backendSubmission.isLate,
      validationStatus: backendSubmission.validationStatus,
      similarityScore: backendSubmission.similarityScore,
    };
  }

  /**
   * Valide que les données backend ont la structure attendue
   */
  static validateBackendResult(data: any): data is BackendSimilarityAnalysisResult {
    return (
      data &&
      typeof data.deliverableId === 'string' &&
      typeof data.deliverableName === 'string' &&
      typeof data.submissionsCount === 'number' &&
      typeof data.validSubmissionsCount === 'number' &&
      Array.isArray(data.comparisons) &&
      Array.isArray(data.suspiciousPairs) &&
      data.statistics &&
      typeof data.statistics.totalComparisons === 'number' &&
      Array.isArray(data.submissions) &&
      typeof data.threshold === 'number' &&
      typeof data.processedAt === 'string'
    );
  }

  /**
   * Méthode utilitaire pour obtenir le contenu d'un fichier depuis le backend
   */
  static async fetchFileContent(filePath: string, submissionId: string): Promise<string> {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

      const response = await fetch(`${API_BASE_URL}/deliverables/submissions/${submissionId}/content`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        return data.data?.content || '';
      }

      return data.content || '';
    } catch (error) {
      console.error('Erreur lors du chargement du contenu du fichier:', error);
      return `// Erreur lors du chargement du fichier: ${filePath}\n// ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
    }
  }

  /**
   * Détermine le langage de programmation basé sur l'extension de fichier
   */
  static getLanguageFromFileName(fileName: string): string {
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
      'cc': 'cpp',
      'cxx': 'cpp',
      'h': 'c',
      'hpp': 'cpp',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'kt': 'kotlin',
      'swift': 'swift',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'html': 'html',
      'xml': 'xml',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'ps1': 'powershell',
      'dockerfile': 'dockerfile',
      'txt': 'plaintext',
    };

    return languageMap[ext || ''] || 'plaintext';
  }

  /**
   * Formate la taille de fichier en format lisible
   */
  static formatFileSize(bytes?: number): string {
    if (!bytes || bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formate la date en format lisible français
   */
  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  }
}
