import { useState, useEffect, RefObject } from 'react';
import { updateNavbarStyle } from '@/utils/navbarUtils';

interface NavbarElements {
  header: RefObject<HTMLElement>;
  navContent: RefObject<HTMLDivElement>;
  navAction: RefObject<HTMLButtonElement>;
}

/**
 * Hook personnalisé pour gérer le comportement de défilement de la barre de navigation sur la page d'accueil.
 *
 * @param elements Objet contenant les références aux éléments de la barre de navigation
 * @returns Position actuelle du défilement
 */
export const useNavbarScroll = (elements: NavbarElements): number => {
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    const toggleColours = document.querySelectorAll('.toggleColour');

    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setScrollPos(currentScrollPos);

      updateNavbarStyle(
        currentScrollPos,
        elements.header.current,
        elements.navContent.current,
        elements.navAction.current,
        toggleColours
      );
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [elements]);

  return scrollPos;
};
