export interface Deliverable {
  id: string;
  name: string;
  description?: string;
  type: 'archive' | 'git';
  deadline: string;
  allowLateSubmission: boolean;
  latePenaltyPerHour: number;
  maxFileSize?: number;
  requiredFiles?: string[];
  requiredFolderStructure?: any;
  fileContentRules?: any;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  rules?: DeliverableRule[];
}

export interface DeliverableRule {
  id: string;
  type: 'file_size' | 'file_presence' | 'folder_structure' | 'file_content';
  rule: any;
  description?: string;
  deliverableId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentSubmission {
  id?: string;
  deliverableId: string;
  groupId: string;
  submissionDate?: string;
  isLate: boolean;
  hoursLate?: number;
  type: 'archive' | 'git';
  filePath?: string;
  gitUrl?: string;
  fileName?: string;
  fileSize?: number;
  validationStatus: 'pending' | 'valid' | 'invalid';
  validationDetails?: {
    details: Array<{
      rule: string;
      valid: boolean;
      message: string;
    }>;
    overallValid: boolean;
  };
  similarityScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentDeliverableView extends Deliverable {
  submission?: StudentSubmission;
  canSubmit: boolean;
  timeRemaining?: number;
  isExpired: boolean;
}

export interface SubmitDeliverableData {
  deliverableId: string;
  type: 'archive' | 'git';
  file?: File;
  gitUrl?: string;
  fileName?: string;
}

export interface ValidationResult {
  valid: boolean;
  details: Array<{
    rule: string;
    valid: boolean;
    message: string;
  }>;
  warnings?: string[];
}
