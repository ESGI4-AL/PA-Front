import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.svg';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white">
      <div className="container mx-auto px-8">
        <div className="w-full flex flex-col md:flex-row py-6">
          <div className="flex-1 mb-6 text-black">
            <Link to="/" className="no-underline hover:no-underline font-bold text-2xl lg:text-4xl">
            <img src={logo} alt="Kōdō Logo" className="h-30 inline mr-2" />
            <span className="mt-4" style={{ color: '#fa3747' }}>Kōdō</span>
            </Link>
          </div>
          <div className="flex-1">
            <p className="uppercase text-gray-500 md:mb-6">Liens</p>
            <ul className="list-reset mb-6">
              <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                <Link to="/" className="no-underline hover:underline text-gray-800 hover:text-pink-500">Accueil</Link> /*changer les pink hover*/
              </li>
              <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                <Link to="#" className="no-underline hover:underline text-gray-800 hover:text-pink-500">FAQ</Link>
              </li>
              <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                <Link to="#" className="no-underline hover:underline text-gray-800 hover:text-pink-500">Support</Link>
              </li>
            </ul>
          </div>
          <div className="flex-1">
            <p className="uppercase text-gray-500 md:mb-6">Légal</p>
            <ul className="list-reset mb-6">
              <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                <Link to="#" className="no-underline hover:underline text-gray-800 hover:text-pink-500">Conditions d'utilisation</Link>
              </li>
              <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                <Link to="#" className="no-underline hover:underline text-gray-800 hover:text-pink-500">Confidentialité</Link>
              </li>
            </ul>
          </div>
          <div className="flex-1">
            <p className="uppercase text-gray-500 md:mb-6">Compte</p>
            <ul className="list-reset mb-6">
              <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                <Link to="/login" className="no-underline hover:underline text-gray-800 hover:text-pink-500">Connexion</Link>
              </li>
              <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                <Link to="#" className="no-underline hover:underline text-gray-800 hover:text-pink-500">S'inscrire</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="text-center pb-6">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} Kōdō Gestionnaire de projet. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer;
