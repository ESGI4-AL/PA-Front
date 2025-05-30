import React from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/images/logo.svg';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import googleLogo from '@/assets/images/ic_google_logo.png';
import microsoftLogo from '@/assets/images/ic_microsoft_logo.png';
import logger from '@/utils/logger';
import { useNavigate } from 'react-router-dom';

import { loginWithGoogle, loginWithMicrosoft } from '@/services/authProviders';

const LoginPage: React.FC = () => {
  const { login, error, showError } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="leading-normal tracking-normal text-white gradient min-h-screen" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
      {/* Navbar simple avec redirection vers la page d'accueil */}
      <nav className="fixed w-full z-30 top-0 text-white">
        <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2">
          <div className="pl-4 flex items-center">
            <Link to="/" className="toggleColour text-white no-underline hover:no-underline font-bold text-2xl lg:text-4xl">
              <img src={logo} alt="Kōdō Logo" className="h-12 inline mr-2" />
              <span className='mt-4'>Kōdō</span>
            </Link>
          </div>
        </div>
        <hr className="border-b border-gray-100 opacity-25 my-0 py-0" />
      </nav>

      <div className="pt-24 pb-12 flex items-center justify-center min-h-screen">
        <div className="container mx-auto px-4">
          <div className="flex content-center items-center justify-center">
            <div className="w-full lg:w-5/12 px-6">
              <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white border-0">
                <div className="rounded-t mb-0 px-6 py-6">
                  <div className="text-center mb-4">
                    <h6 className="text-gray-600 text-xl font-bold">
                      Connexion à votre compte
                    </h6>
                  </div>
                  <div className="flex justify-center">
                    <img src={logo} alt="Kōdō Logo" className="h-26" />
                  </div>
                  {error && showError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                      <span className="block sm:inline">{error}</span>
                    </div>
                  )}
                </div>
                <div className="flex-auto px-6 lg:px-12 py-12 pt-0">
                  <LoginForm onSubmit={login} error={error} />
                </div>
                <div className="mb-6">
                  <p className="text-gray-800 text-center mb-4">Ou connectez-vous avec</p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={async () => {
                        try {
                          const res = await loginWithGoogle();
                          logger.info('Connexion avec Google', res);

                          localStorage.setItem('authToken', res.data.token);
                          localStorage.setItem('user', JSON.stringify(res.data.user));

                          const role = res.data.user.role;
                          if (role === 'teacher') {
                            navigate('/teacher');
                          } else if (role === 'student') {
                            navigate('/student');
                          } else {
                            navigate('/');
                          }
                        } catch (e) {
                          logger.error('Erreur de connexion Google', e);
                        }
                      }}
                      className="bg-white border border-gray-300 rounded-full p-2 hover:shadow-md transition"
                    >
                      <img src={googleLogo} alt="Connexion Google" className="h-6 w-6" />
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await loginWithMicrosoft();
                          logger.info('Connexion avec Microsoft', res);
                        
                          localStorage.setItem('authToken', res.data.token);
                          localStorage.setItem('user', JSON.stringify(res.data.user));

                          const role = res.data.user.role;
                          if (role === 'teacher') {
                            navigate('/teacher');
                          } else if (role === 'student') {
                            navigate('/student');
                          } else {
                            navigate('/');
                          }
                        } catch (e) {
                          logger.error('Erreur de connexion Microsoft', e);
                        }
                      }}
                      className="bg-white border border-gray-300 rounded-full p-2 hover:shadow-md transition"
                    >
                      <img src={microsoftLogo} alt="Connexion Microsoft" className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap mt-6">
                <div className="w-1/2">
                  <Link
                    to="/forgot-password"
                    className="text-white text-base hover:text-gray-300"
                  >
                    Mot de passe oublié?
                  </Link>
                </div>
                <div className="w-1/2 text-right">
                  <Link to="/register/teacher" className="text-white text-base hover:text-gray-300">
                    Enseignant ? Créer un compte
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
