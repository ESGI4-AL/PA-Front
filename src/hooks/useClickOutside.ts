import { useEffect } from 'react';
import { handleOutsideClick } from '../utils/navbarUtils';

/**
 * Custom hook to handle clicks outside of the navigation menu
 */
export const useClickOutside = (): void => {
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      handleOutsideClick(
        e,
        document.getElementById('nav-content'),
        document.getElementById('nav-toggle')
      );
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);
};
