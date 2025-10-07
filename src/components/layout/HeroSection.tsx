import React from 'react';
import { Sparkles, Stars, Zap, Shield, Code, Bot } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  titleId?: string;
  variant?: 'default' | 'minimal' | 'gradient' | 'ultra';
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
      className={`relative text-center py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden ${className}`}
      aria-labelledby={titleId}
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Multi-layered Gradient Orbs with Enhanced Animations */}
        <div className="absolute top-1/4 left-1/4 w-40 h-40 sm:w-56 sm:h-56 md:w-80 md:h-80 bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-indigo-500/30 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-cyan-500/25 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-80 sm:h-80 md:w-[28rem] md:h-[28rem] bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-orange-500/15 rounded-full blur-3xl animate-pulse-slow"></div>

        {/* Additional Floating Orbs for Depth */}
        <div className="absolute top-16 right-16 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-2xl animate-float float-animation delay-2s"></div>
        <div className="absolute bottom-16 left-16 w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full blur-2xl animate-float float-animation delay-4s"></div>

        {/* Enhanced Floating Icons with More Variety */}
        <div className="absolute top-20 left-12 sm:top-24 sm:left-24 animate-float">
          <Shield className="h-5 w-5 sm:h-7 sm:w-7 text-blue-500/50" />
        </div>
        <div className="absolute top-32 right-12 sm:top-40 sm:right-40 animate-float-delayed">
          <Code className="h-6 w-6 sm:h-9 sm:w-9 text-purple-500/50" />
        </div>
        <div className="absolute bottom-32 left-12 sm:bottom-40 sm:left-40 animate-bounce-slow">
          <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500/50" />
        </div>
        <div className="absolute top-1/3 right-8 sm:right-20 animate-float">
          <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-cyan-500/40" />
        </div>
        <div className="absolute bottom-1/3 right-1/3 animate-float-delayed">
          <Stars className="h-5 w-5 sm:h-7 sm:w-7 text-pink-500/40" />
        </div>
        <div className="absolute top-2/3 left-8 sm:left-20 animate-bounce-slow">
          <Zap className="h-5 w-5 sm:h-7 sm:w-7 text-amber-500/40" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto mobile-container">
        {/* Enhanced Title with Ultra-Modern Typography */}
        <h1
          id={titleId}
          className={`text-responsive-2xl font-bold mb-6 sm:mb-8 lg:mb-10 tracking-tight leading-tight px-4 sm:px-0 ${
            variant === 'gradient' || variant === 'ultra'
              ? 'gradient-text-animated text-ultra-gradient'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {title}
        </h1>

        {subtitle && (
          <div className="glass-card-ultra max-w-4xl mx-auto mb-6 sm:mb-8 lg:mb-10 px-6 py-4 sm:px-8 sm:py-6">
            <h2 className="text-responsive-lg font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              {subtitle}
            </h2>
          </div>
        )}

        {description && (
          <div className="max-w-5xl mx-auto mb-8 sm:mb-10 lg:mb-14 px-4 sm:px-0">
            <p className="text-responsive-base text-slate-700 dark:text-slate-300 leading-relaxed bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/30 dark:border-white/10 shadow-xl">
              {description}
            </p>
          </div>
        )}

        {/* Enhanced Children Container */}
        <div className="px-4 sm:px-0 space-y-8 sm:space-y-10 lg:space-y-12">
          {children}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
