export enum ProjectStatus {
  DRAFT = 'draft',
  VISIBLE = 'visible'
}

export enum GroupFormationMethod {
  MANUAL = 'manual',
  RANDOM = 'random',
  FREE = 'free'
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  minGroupSize: number;
  maxGroupSize: number;
  groupFormationMethod: GroupFormationMethod;
  groupFormationDeadline?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  promotionId: string;
  promotion?: {
    id: string;
    name: string;
    year: number;
  };
}

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: ProjectStatus;
  minGroupSize?: number;
  maxGroupSize?: number;
  groupFormationMethod?: GroupFormationMethod;
  groupFormationDeadline?: Date | string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  id: string;
}

export interface ProjectResponse {
  data: Project;
  message?: string;
}

export interface ProjectListResponse {
  data: Project[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface StudentProject extends Project {
  myGroup: {
    id: string;
    name: string;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  deliverables?: Array<{
    id: string;
    name: string;
    description?: string;
    deadline: Date | string;
    type: string;
  }>;
}

export interface StudentProjectsResponse {
  projects: StudentProject[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
