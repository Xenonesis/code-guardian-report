import React from 'react';
import { Navigation } from '@/components/Navigation';
import { FeatureGrid } from '@/components/features/FeatureGrid';
import { Footer } from '@/components/ui/footer';

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
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  isDarkMode = false,
  toggleDarkMode,
  showNavigation = true,
  className = '',
  features
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/20 transition-all duration-500 ${className}`}>
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/10 via-teal-400/10 to-cyan-400/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>
      {showNavigation && toggleDarkMode && (
        <Navigation isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      )}

      <main>
        {children}
      </main>

      {/* Features Section in Footer */}
      {features && features.length > 0 && (
        <section className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 py-16 lg:py-24">
          <FeatureGrid
            features={features}
            title="Comprehensive Security & Quality Analysis"
            subtitle="Everything you need to secure and optimize your codebase in one powerful platform"
            columns={4}
            variant="modern"
          />
        </section>
      )}

      {/* Enhanced Footer Component */}
      <Footer />
    </div>
  );
};

export default PageLayout;
