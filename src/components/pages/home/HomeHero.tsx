import React from 'react';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/layouts/HeroSection';
import { Shield, Zap, Star, ArrowRight, Sparkles, Code, Bug, Search } from 'lucide-react';

interface HomeHeroProps {
  onStartAnalysis: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onStartAnalysis }) => {
  return (
    <HeroSection
      title="AI-Powered Code Guardian"
      subtitle="Detect bugs, vulnerabilities, and code quality issues instantly"
      description="Advanced static analysis powered by artificial intelligence to secure and optimize your codebase with enterprise-grade precision."
      variant="gradient"
      className="relative min-h-[85vh] sm:min-h-[80vh] flex items-center justify-center px-4 sm:px-6"
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 opacity-30 animate-pulse-slow" />
        
        {/* Enhanced Floating Code Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="p-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl backdrop-blur-xl border border-blue-500/30 shadow-2xl hover:scale-110 transition-all duration-500">
            <Code className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="absolute top-32 right-16 animate-float-delayed">
          <div className="p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl backdrop-blur-xl border border-red-500/30 shadow-2xl hover:scale-110 transition-all duration-500">
            <Bug className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="absolute bottom-32 left-20 animate-bounce-slow">
          <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl backdrop-blur-xl border border-emerald-500/30 shadow-2xl hover:scale-110 transition-all duration-500">
            <Search className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
        
        {/* Enhanced Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
        {/* Enhanced Feature Badges */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/15 dark:bg-black/15 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 dark:border-white/20 shadow-xl hover:scale-105 transition-all duration-300 group">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 group-hover:animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold">Security First</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/15 dark:bg-black/15 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 dark:border-white/20 shadow-xl hover:scale-105 transition-all duration-300 group">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 group-hover:animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold">Lightning Fast</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/15 dark:bg-black/15 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/30 dark:border-white/20 shadow-xl hover:scale-105 transition-all duration-300 group">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 group-hover:animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold">AI-Powered</span>
          </div>
        </div>

        {/* Enhanced CTA Buttons */}
        <div className="flex flex-col gap-4 sm:gap-6 justify-center items-center">
          <Button
            onClick={onStartAnalysis}
            size="lg"
            className="group relative overflow-hidden px-8 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-bold text-base sm:text-lg shadow-2xl transition-all duration-500 hover:scale-110 focus:scale-110 w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center gap-2 sm:gap-3 text-white">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 group-hover:animate-spin" />
              <span className="whitespace-nowrap">Start Code Analysis</span>
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            className="group px-8 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-bold text-base sm:text-lg bg-white/10 dark:bg-black/10 backdrop-blur-xl border-2 border-white/30 dark:border-white/20 hover:bg-white/20 dark:hover:bg-black/20 shadow-2xl transition-all duration-500 hover:scale-110 w-full sm:w-auto"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 group-hover:animate-pulse" />
              <span className="whitespace-nowrap">View Demo</span>
            </div>
          </Button>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-white/20 dark:border-white/10">
          <div className="text-center group hover:scale-105 transition-all duration-300">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text-blue mb-1 sm:mb-2">
              10M+
            </div>
            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
              Lines of Code Analyzed
            </div>
          </div>
          <div className="text-center group hover:scale-105 transition-all duration-300">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text-green mb-1 sm:mb-2">
              50K+
            </div>
            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
              Vulnerabilities Found
            </div>
          </div>
          <div className="text-center group hover:scale-105 transition-all duration-300">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text-purple mb-1 sm:mb-2">
              99.9%
            </div>
            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
              Accuracy Rate
            </div>
          </div>
        </div>
      </div>
    </HeroSection>
  );
};
