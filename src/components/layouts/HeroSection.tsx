import React from 'react';
import { Sparkles, Stars, Zap } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  titleId?: string;
  variant?: 'default' | 'minimal' | 'gradient';
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  children,
  className = '',
  titleId = 'hero-title',
  variant = 'default'
}) => {
  return (
    <section
      className={`relative text-center py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden ${className}`}
      aria-labelledby={titleId}
    >
      {/* Modern Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs - Responsive sizes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl sm:blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl sm:blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-gradient-to-r from-pink-400/10 to-orange-400/10 rounded-full blur-2xl sm:blur-3xl animate-pulse-slow"></div>

        {/* Floating Icons - Responsive positioning */}
        <div className="absolute top-16 left-8 sm:top-20 sm:left-20 animate-float">
          <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-blue-400/40" />
        </div>
        <div className="absolute top-24 right-8 sm:top-32 sm:right-32 animate-float-delayed">
          <Stars className="h-5 w-5 sm:h-8 sm:w-8 text-purple-400/40" />
        </div>
        <div className="absolute bottom-24 left-8 sm:bottom-32 sm:left-32 animate-bounce-slow">
          <Zap className="h-5 w-5 sm:h-7 sm:w-7 text-emerald-400/40" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto mobile-container">
        {/* Title with Modern Typography */}
        <h1
          id={titleId}
          className={`text-responsive-2xl font-bold mb-4 sm:mb-6 lg:mb-8 tracking-tight leading-tight px-4 sm:px-0 ${
            variant === 'gradient'
              ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {title}
        </h1>

        {subtitle && (
          <h2 className="text-responsive-lg font-medium mb-3 sm:mb-4 lg:mb-6 text-slate-700 dark:text-slate-300 max-w-3xl mx-auto px-4 sm:px-0">
            {subtitle}
          </h2>
        )}

        {description && (
          <p className="text-responsive-base text-slate-600 dark:text-slate-400 max-w-4xl mx-auto mb-6 sm:mb-8 lg:mb-12 leading-relaxed px-4 sm:px-0">
            {description}
          </p>
        )}

        <div className="px-4 sm:px-0">
          {children}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
