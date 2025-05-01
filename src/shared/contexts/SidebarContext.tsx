import React, { createContext, ReactNode, useState, useContext } from 'react';

interface SidebarContextType {
  expanded: boolean;
  toggleExpanded: () => void;
}

/**
 * Crée un contexte avec des valeurs par défaut
 * Partage l'état d'expansion de la sidebar
 */
export const SidebarContext = createContext<SidebarContextType>({
  expanded: true,
  toggleExpanded: () => {}
});

/**
 *  Fournisseur de contexte pour la sidebar
 * @param children - Les composants enfants qui auront accès au contexte
 */
export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = () => setExpanded(prev => !prev);

  return (
    <SidebarContext.Provider value={{ expanded, toggleExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => useContext(SidebarContext);
