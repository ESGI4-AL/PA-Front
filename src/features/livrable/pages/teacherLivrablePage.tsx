import React from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/images/logo.svg';

const TeacherLivrablePage: React.FC = () => {
  return (
    <div className="leading-normal tracking-normal text-white gradient min-h-screen" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
      {/* Navbar */}
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

      {/* Contenu principal */}
      <div className="pt-24 pb-12 flex items-center justify-center min-h-screen">
        <div className="container mx-auto px-4">
          <div className="flex content-center items-center justify-center">
            <div className="w-full lg:w-10/12 px-6">
              <div className="relative flex flex-col min-w-0 break-words w-full shadow-lg rounded-lg bg-white border-0 p-8">
                {/* Ici on ajoutera le contenu plus tard */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLivrablePage;