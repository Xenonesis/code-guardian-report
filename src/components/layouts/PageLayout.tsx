import React, { useState, useEffect } from 'react';
import { Shield, Github, Twitter } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { FeatureGrid } from '@/components/features/FeatureGrid';
import { useMobile } from '@/hooks/useMobile';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient?: string;
  benefits?: string[];
}

interface PageLayoutProps {
  children: React.ReactNode;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  showNavigation?: boolean;
  className?: string;
  features?: Feature[];
  noContainer?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  isDarkMode = false,
  toggleDarkMode,
  showNavigation = true,
  className = '',
  features,
  noContainer = false
}) => {
  const { isMobile, isSmallMobile } = useMobile();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/20 transition-all duration-500 ${className}`}>
      {/* Enhanced Background Effects - Reduced on mobile */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-32 h-32 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-gradient-to-r from-blue-400/5 sm:from-blue-400/10 via-purple-400/5 sm:via-purple-400/10 to-pink-400/5 sm:to-pink-400/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-24 h-24 sm:w-48 sm:h-48 lg:w-80 lg:h-80 bg-gradient-to-r from-emerald-400/5 sm:from-emerald-400/10 via-teal-400/5 sm:via-teal-400/10 to-cyan-400/5 sm:to-cyan-400/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="hidden sm:block absolute top-1/2 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>
      {showNavigation && toggleDarkMode && (
        <Navigation isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      )}

      <main className="relative z-10">
        {noContainer ? (
          children
        ) : (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        )}
      </main>

      {/* Features Section in Footer */}
      {features && features.length > 0 && (
        <section className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 py-12 sm:py-16 lg:py-24">
          <FeatureGrid
            features={features}
            title="Comprehensive Security & Quality Analysis"
            subtitle="Everything you need to secure and optimize your codebase in one powerful platform"
            columns={isMobile ? 1 : isSmallMobile ? 2 : 4}
            variant="modern"
          />
        </section>
      )}
    </div>
  );
};

export default PageLayout;
