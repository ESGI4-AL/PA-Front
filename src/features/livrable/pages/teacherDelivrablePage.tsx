import React from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/images/logo.svg';
import DeliverableInstructions from '../components/DeliverableInstructions';
import SubmissionConfiguration from '../components/submissionConfiguration';
import DeliverableSubject from '../components/deliverableSubject';

const TeacherDelivrablePage: React.FC = () => {
  return (
    <div
      className="leading-normal tracking-normal text-white min-h-screen bg-gradient-to-b from-red-500 to-pink-300 pb-24"
      style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
    >
      {/* Navbar */}
      <nav className="fixed w-full z-30 top-0 text-white bg-gradient-to-b from-red-500 to-pink-300 bg-opacity-90 backdrop-blur-md shadow-md">
        <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2">
          <div className="pl-4 flex items-center">
            <Link
              to="/"
              className="toggleColour text-white no-underline hover:no-underline font-bold text-2xl lg:text-4xl"
            >
              <img src={logo} alt="Kōdō Logo" className="h-12 inline mr-2" />
              <span className="mt-4">Kōdō</span>
            </Link>
          </div>
        </div>
        <hr className="border-b border-white opacity-25 my-0 py-0" />
      </nav>

      <div className="pt-20">
        <DeliverableInstructions />
        <SubmissionConfiguration />
        <DeliverableSubject />
      </div>

      {/* Bouton valider/créer le livrable */}
      <div className="max-w-4xl mx-auto px-6 flex justify-end">
        <button
          onClick={() => {
            // Tu peux mettre ici l’action de création
            console.log('Création du livrable lancée');
          }}
          className="bg-gradient-to-r from-red-600 to-pink-500 text-white font-bold px-6 py-3 rounded shadow hover:brightness-110 transition"
        >
          Publier le livrable
        </button>
      </div>

    </div>
  );
};

export default TeacherDelivrablePage;