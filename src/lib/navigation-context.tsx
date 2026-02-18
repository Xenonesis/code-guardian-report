"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useRouter, usePathname } from "next/navigation";

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

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

interface NavigationProviderProps {
  children: ReactNode;
}

// Map section IDs to URL paths
const sectionToPath: Record<string, string> = {
  home: "/",
  about: "/about",
  history: "/history",
  "github-analysis": "/github-analysis",
  legal: "/legal",
  privacy: "/legal?tab=privacy",
  terms: "/legal?tab=terms",
  help: "/help",
  "pwa-settings": "/pwa-settings",
  changelog: "/changelog",
};

// Map URL paths to section IDs
const pathToSection: Record<string, string> = {
  "/": "home",
  "/about": "about",
  "/history": "history",
  "/github-analysis": "github-analysis",
  "/legal": "legal",
  "/privacy": "legal",
  "/terms": "legal",
  "/help": "help",
  "/pwa-settings": "pwa-settings",
  "/changelog": "changelog",
};

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // Derive currentSection from the URL path
  const currentSection = pathToSection[pathname] || "home";
  const [currentTab, setCurrentTab] = useState("upload");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  }, [pathname]);

  const setCurrentSection = (section: string) => {
    // Navigate to the new section using Next.js router
    const path = sectionToPath[section] || "/";
    router.push(path);
  };

  const navigateTo = (section: string, tab?: string) => {
    // Navigate to the new section using Next.js router
    const path = sectionToPath[section] || "/";
    router.push(path);
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
    setSidebarCollapsed,
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
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
