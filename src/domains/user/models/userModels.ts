export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'teacher' | 'student';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterTeacherData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
