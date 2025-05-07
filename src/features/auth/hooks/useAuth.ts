import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LoginCredentials, RegisterTeacherData, AuthResponse } from '@/domains/user/models/userModels';
import { loginUser, registerTeacher } from '@/domains/user/services/authService';
import { translateErrorMessage } from '@/utils/errorTranslator';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [error, setError] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleError = (errorMessage: string) => {
    const translatedError = translateErrorMessage(errorMessage);
    setError(translatedError);
    setShowError(true);
    setTimeout(() => setShowError(false), 5000);
  };

  const handleAuthResponse = (authResponse: AuthResponse) => {
    if (authResponse && authResponse.token) {
      localStorage.setItem('authToken', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      setUser(authResponse.user);

      if (authResponse.user.role === 'teacher') {
        navigate('/teacher');
      } else if (authResponse.user.role === 'student') {
        navigate('/student');
      }
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setError('');
    setIsLoading(true);

    try {
      const authResponse = await loginUser(credentials);
      handleAuthResponse(authResponse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Échec de connexion. Vérifiez vos identifiants.';
      handleError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (teacherData: RegisterTeacherData) => {
    setError('');
    setIsLoading(true);

    try {
      const authResponse = await registerTeacher(teacherData);
      handleAuthResponse(authResponse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'inscription';
      handleError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return {
    user,
    login,
    register,
    logout,
    error,
    showError,
    isLoading
  };
};
