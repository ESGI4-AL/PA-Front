export interface PresentationSchedule {
    id: string;
    startTime: string;
    endTime: string;
    duration: number;
    order: number;
    projectId: string;
    groupId: string;
    group?: Group;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface Group {
    id: string;
    name: string;
    members?: User[];
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'teacher' | 'student';
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }