import { LoginCredentials, RegisterTeacherData, AuthResponse } from '../models/userModels';

const API_URL = 'http://localhost:3000/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const hasToken = (): boolean => {
  return !!getAuthToken();
};

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Échec de connexion. Vérifiez vos identifiants.');
  }

  return data.data;
};

export const registerTeacher = async (teacherData: RegisterTeacherData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/register/teacher`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: teacherData.email,
      password: teacherData.password,
      firstName: teacherData.firstName,
      lastName: teacherData.lastName,
      role: 'teacher'
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Une erreur est survenue lors de l\'inscription');
  }

  return data.data;
};

export const isAuthenticated = (): boolean => {
  return hasToken();
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};
