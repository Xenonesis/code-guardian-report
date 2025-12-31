import { useState, useEffect, useCallback } from 'react';

import { logger } from '@/utils/logger';
export type Theme = 'light' | 'dark' | 'system';

interface UseDarkModeReturn {
  theme: Theme;
  isDarkMode: boolean;
  setTheme: (theme: Theme) => void;
  toggleDarkMode: () => void;
}

const THEME_STORAGE_KEY = 'code-guardian-theme';

/**
 * Custom hook for managing theme preferences with support for light, dark, and system modes
 * Optimized with proper memoization and system preference detection
 */
export const useDarkMode = (): UseDarkModeReturn => {
  // Get initial theme from localStorage or default to 'system'
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved as Theme;
      }
    } catch (error) {
      logger.warn('Failed to load theme from localStorage:', error);
    }
    return 'system';
  });

  // Track the actual dark mode state based on theme and system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Get system preference
  const getSystemPreference = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  // Calculate effective dark mode based on theme
  const calculateDarkMode = useCallback((currentTheme: Theme): boolean => {
    if (currentTheme === 'system') {
      return getSystemPreference();
    }
    return currentTheme === 'dark';
  }, [getSystemPreference]);

  // Apply theme to document
  const applyTheme = useCallback((shouldBeDark: boolean) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (shouldBeDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, []);

  // Set theme with persistence
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      logger.warn('Failed to save theme to localStorage:', error);
    }
  }, []);

  // Toggle between light and dark (skip system)
  const toggleDarkMode = useCallback(() => {
    setTheme(isDarkMode ? 'light' : 'dark');
  }, [isDarkMode, setTheme]);

  // Listen to system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newDarkMode = e.matches;
      setIsDarkMode(newDarkMode);
      applyTheme(newDarkMode);
    };

    // Use addEventListener for better compatibility
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, applyTheme]);

  // Apply theme whenever it changes
  useEffect(() => {
    const newDarkMode = calculateDarkMode(theme);
    setIsDarkMode(newDarkMode);
    applyTheme(newDarkMode);
  }, [theme, calculateDarkMode, applyTheme]);

  return { 
    theme, 
    isDarkMode, 
    setTheme, 
    toggleDarkMode 
  };
};

export default useDarkMode;
