export interface Promotion {
  id: string;
  name: string;
  year: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CreatePromotionRequest {
  name: string;
  year: number;
  description?: string;
}

export interface UpdatePromotionRequest {
  name?: string;
  year?: number;
  description?: string;
}

export interface ImportStudentsRequest {
  file: File;
}
