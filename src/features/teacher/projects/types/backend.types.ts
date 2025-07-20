export interface BackendSubmission {
  id: string;
  submissionDate: string;
  isLate: boolean;
  hoursLate: number;
  filePath?: string;
  gitUrl?: string;
  fileName?: string;
  fileSize?: number;
  validationStatus: 'pending' | 'valid' | 'invalid';
  validationDetails?: any;
  similarityScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackendGroup {
  id: string;
  name: string;
  students: BackendStudent[];
  createdAt: string;
  updatedAt: string;
}

export interface BackendStudent {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendDeliverable {
  id: string;
  name: string;
  description?: string;
  type: 'archive' | 'git';
  deadline: string;
  allowLateSubmission: boolean;
  latePenaltyPerHour: number;
  rules?: ValidationRule[];
  createdAt: string;
  updatedAt: string;
}

export interface ValidationRule {
  id?: string;
  type: 'file_size' | 'file_presence' | 'folder_structure' | 'file_content';
  rule: any;
  description: string;
}

// Interface pour les résultats d'analyse de similarité du backend
export interface BackendSimilarityAnalysisResult {
  deliverableId: string;
  deliverableName: string;
  submissionsCount: number;
  validSubmissionsCount: number;
  comparisons: BackendComparison[];
  suspiciousPairs: BackendComparison[];
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
  submissions: BackendSubmissionInfo[];
  processedAt: string;
}

export interface BackendComparison {
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

export interface BackendSubmissionInfo {
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

export interface BackendGroupSummary {
  group: BackendGroup;
  submission?: BackendSubmission;
}

export interface BackendDeliverableSummary {
  deliverable: BackendDeliverable;
  groupSummaries: BackendGroupSummary[];
  rules?: ValidationRule[];
}

export interface BackendFileComparison {
  sourceFile: string;
  targetComparisons: Array<{
    fileName: string;
    similarity: number;
    method: string;
    details: any;
  }>;
  bestMatch: {
    fileName: string;
    similarity: number;
    method: string;
    details: any;
  } | null;
  bestScore: number;
}

export interface BackendDetailedAnalysisResult {
  archive1: string;
  archive2: string;
  globalSimilarity: number;
  structuralSimilarity: number;
  averageFileScore: number;
  statistics: {
    totalComparisons: number;
    significantComparisons: number;
    suspiciousFilesCount: number;
    archive1Files: number;
    archive2Files: number;
  };
  fileComparisons: BackendFileComparison[];
  suspiciousFiles: BackendFileComparison[];
  analyzedAt: string;
}
