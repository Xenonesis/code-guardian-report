import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface NavigationContextType {
  currentSection: string;
  currentTab: string;
  isSidebarCollapsed: boolean;
  setCurrentSection: (section: string) => void;
  setCurrentTab: (tab: string) => void;
  navigateTo: (section: string, tab?: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentSection, setCurrentSection] = useState('home');
  const [currentTab, setCurrentTab] = useState('upload');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [currentSection]);

  const navigateTo = (section: string, tab?: string) => {
    setCurrentSection(section);
    if (tab) {
      setCurrentTab(tab);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  const value: NavigationContextType = {
    currentSection,
    currentTab,
    isSidebarCollapsed,
    setCurrentSection,
    setCurrentTab,
    navigateTo,
    toggleSidebar,
    setSidebarCollapsed
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}; 