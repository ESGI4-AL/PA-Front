import { useEffect } from 'react';
import { handleOutsideClick } from '@/utils/navbarUtils';

/**
 * Hook personnalisé pour gérer les clics en dehors du menu de navigation
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
