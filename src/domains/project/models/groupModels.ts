export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  promotionId?: string;
}

export interface Group {
  id: string;
  name: string;
  members: Student[];
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGroupData {
  name: string;
  memberIds?: string[];
}

export interface UpdateGroupData {
  name?: string;
  memberIds?: string[];
}

export interface GroupStats {
  totalStudents: number;
  totalGroups: number;
  unassignedCount: number;
  averageGroupSize: number;
}
