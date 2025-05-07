import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import AppRoutes from './core/router/AppRoutes';
import './styles/App.css';
import { Toaster } from 'sonner';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </Router>
  );
};

export default App;
