import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNavbarScroll } from '../../hooks/useNavbarScroll';
import { useClickOutside } from '../../hooks/useClickOutside';
import logo from '../../assets/images/logo.svg';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const navContentRef = useRef<HTMLDivElement>(null);
  const navActionRef = useRef<HTMLButtonElement>(null);

  useNavbarScroll({
    header: headerRef as React.RefObject<HTMLElement>,
    navContent: navContentRef as React.RefObject<HTMLDivElement>,
    navAction: navActionRef as React.RefObject<HTMLButtonElement>
  });

  useClickOutside();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav id="header" ref={headerRef} className="fixed w-full z-30 top-0 text-white">
      <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2">
        <div className="pl-4 flex items-center">
          <Link to="/" className="toggleColour text-white no-underline hover:no-underline font-bold text-2xl lg:text-4xl">
            <img src={logo} alt="Kōdō Logo" className="h-12 inline mr-2" />
            <span className='mt-4'>Kōdō</span>
          </Link>
        </div>
        <div className="block lg:hidden pr-4">
          <button
            id="nav-toggle"
            className="flex items-center p-1 text-pink-800 hover:text-gray-900 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
            onClick={toggleMenu}
          >
            <svg className="fill-current h-6 w-6" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>
        <div
          id="nav-content"
          ref={navContentRef}
          className={`w-full flex-grow lg:flex lg:items-center lg:w-auto ${isMenuOpen ? '' : 'hidden'} lg:block mt-2 lg:mt-0 bg-white lg:bg-transparent text-black p-4 lg:p-0 z-20`}
        >
          <ul className="list-reset lg:flex justify-end flex-1 items-center">
            <li className="mr-3">
              <Link to="/" className="inline-block py-2 px-4 text-black font-bold no-underline">Accueil</Link>
            </li>
            <li className="mr-3">
              <a href="#features" className="inline-block text-black no-underline hover:text-gray-800 hover:text-underline py-2 px-4">Fonctionnalités</a>
            </li>
          </ul>
          <button
            id="navAction"
            ref={navActionRef}
            className="mx-auto lg:mx-0 hover:underline bg-white text-gray-800 font-bold rounded-full mt-4 lg:mt-0 py-4 px-8 shadow opacity-75 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
            onClick={() => window.location.href = '/login'}
          >
            Se connecter
          </button>
        </div>
      </div>
      <hr className="border-b border-gray-100 opacity-25 my-0 py-0" />
    </nav>
  );
};

export default Navbar;
