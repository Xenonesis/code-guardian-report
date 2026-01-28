import React from "react";
import { Navigation } from "@/components/layout/Navigation";
import { FeatureGrid } from "@/components/features/FeatureGrid";
import type { Theme } from "@/hooks/useDarkMode";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient?: string;
  benefits?: string[];
}

interface PageLayoutProps {
  children: React.ReactNode;
  theme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  showNavigation?: boolean;
  className?: string;
  features?: Feature[];
  noContainer?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  theme = "system",
  onThemeChange,
  showNavigation = true,
  className = "",
  features,
  noContainer = false,
}) => {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 transition-all duration-500 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/20 ${className}`}
    >
      {/* Enhanced Background Effects - Reduced on mobile */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-float-slow absolute top-0 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 blur-3xl sm:h-96 sm:w-96 sm:from-blue-400/10 sm:via-purple-400/10 sm:to-pink-400/10"></div>
        <div className="animate-float-delayed absolute right-1/4 bottom-0 h-48 w-48 rounded-full bg-gradient-to-r from-emerald-400/5 via-teal-400/5 to-cyan-400/5 blur-3xl sm:h-80 sm:w-80 sm:from-emerald-400/10 sm:via-teal-400/10 sm:to-cyan-400/10"></div>
        <div className="animate-pulse-slow absolute top-1/2 left-0 hidden h-64 w-64 rounded-full bg-gradient-to-r from-orange-400/10 to-red-400/10 blur-3xl sm:block"></div>
      </div>
      {showNavigation && onThemeChange && (
        <Navigation theme={theme} onThemeChange={onThemeChange} />
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
        <section className="bg-gradient-to-r from-slate-50 to-blue-50 py-16 lg:py-24 dark:from-slate-900 dark:to-blue-950">
          <FeatureGrid
            features={features}
            title="Comprehensive Security & Quality Analysis"
            subtitle="Everything you need to secure and optimize your codebase in one powerful platform"
            columns={4}
            variant="modern"
          />
        </section>
      )}
    </div>
  );
};

export default PageLayout;
