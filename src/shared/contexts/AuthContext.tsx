import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LoginCredentials, RegisterTeacherData, AuthResponse } from '@/domains/user/models/userModels';
import { loginUser, registerTeacher, getAuthToken } from '@/domains/user/services/authService';
import { translateErrorMessage } from '@/utils/errorTranslator';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (teacherData: RegisterTeacherData) => Promise<void>;
  logout: () => void;
  error: string;
  showError: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [error, setError] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getAuthToken());

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthToken();
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        setIsAuthenticated(false);
        setUser(null);

        if (isProtectedRoute(location.pathname)) {
          navigate('/login', { state: { from: location } });
        }
        return;
      }

      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    };

    checkAuth();
  }, [location.pathname, navigate, location]);

  const isProtectedRoute = (path: string): boolean => {
    const protectedRoutes = [
      '/promotions',
      '/teacher',
      '/student',
      '/dashboard',
      '/profile',
    ];

    return protectedRoutes.some(route => path.startsWith(route));
  };

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
      setIsAuthenticated(true);

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
    setIsAuthenticated(false);
    navigate('/login');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    error,
    showError,
    isLoading,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};

interface ProtectedRouteProps {
  children: ReactNode;
  requiresTeacher?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresTeacher = false
}) => {
  const { isAuthenticated, user, isLoading } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: location } });
      } else if (requiresTeacher && user?.role !== 'teacher') {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, isLoading, navigate, location, requiresTeacher]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (isAuthenticated && (!requiresTeacher || user?.role === 'teacher')) {
    return <>{children}</>;
  }

  return null;
};
