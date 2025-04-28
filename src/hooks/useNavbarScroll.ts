import { useState, useEffect, RefObject } from 'react';
import { updateNavbarStyle } from '../utils/navbarUtils';

interface NavbarElements {
  header: RefObject<HTMLElement>;
  navContent: RefObject<HTMLDivElement>;
  navAction: RefObject<HTMLButtonElement>;
}

/**
 * Custom hook to handle navbar scroll behavior in home page.
 *
 * @param elements Object containing refs to navbar elements
 * @returns Current scroll position
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
