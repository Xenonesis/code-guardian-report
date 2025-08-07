import { useState, useEffect } from 'react';

export interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallMobile: boolean;
  isLargeMobile: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

export const useMobile = (): MobileState => {
  const [mobileState, setMobileState] = useState<MobileState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isSmallMobile: false,
    isLargeMobile: false,
    isLandscape: false,
    isPortrait: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait'
  });

  useEffect(() => {
    const updateMobileState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = width > height ? 'landscape' : 'portrait';

      const isSmallMobile = width < 480;
      const isLargeMobile = width >= 480 && width < 768;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      const isLandscape = orientation === 'landscape';
      const isPortrait = orientation === 'portrait';

      setMobileState({
        isMobile,
        isTablet,
        isDesktop,
        isSmallMobile,
        isLargeMobile,
        isLandscape,
        isPortrait,
        screenWidth: width,
        screenHeight: height,
        orientation
      });
    };

    // Initial state
    updateMobileState();

    // Add event listeners
    window.addEventListener('resize', updateMobileState);
    window.addEventListener('orientationchange', updateMobileState);

    return () => {
      window.removeEventListener('resize', updateMobileState);
      window.removeEventListener('orientationchange', updateMobileState);
    };
  }, []);

  return mobileState;
};

// Utility functions for responsive design
export const getResponsiveClass = (mobileClass: string, tabletClass: string, desktopClass: string) => {
  return `${mobileClass} md:${tabletClass} lg:${desktopClass}`;
};

export const getMobilePadding = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
  const paddingMap = {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };
  return paddingMap[size];
};

export const getMobileTextSize = (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' = 'base') => {
  const textMap = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };
  return textMap[size];
};

export const getMobileSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
  const spacingMap = {
    xs: 'space-y-2',
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8'
  };
  return spacingMap[size];
}; 