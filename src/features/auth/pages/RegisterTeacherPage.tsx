import React from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/images/logo.svg';
import RegisterTeacherForm from '../components/RegisterTeacherForm';
import { useAuth } from '../hooks/useAuth';

const RegisterTeacherPage: React.FC = () => {
  const { register, error, showError, isLoading } = useAuth();

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
                      Créer un compte Enseignant
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
                  <RegisterTeacherForm onSubmit={register} error={error} isLoading={isLoading} />
                </div>
              </div>
              <div className="flex flex-wrap mt-6">
                <div className="w-full text-center">
                  <Link to="/login" className="text-white text-base hover:text-gray-300">
                    Vous avez déjà un compte ? Connectez-vous
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

export default RegisterTeacherPage;
