import React from 'react';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/layouts/HeroSection';
import { Shield, Zap, Star, ArrowRight, Sparkles, Code, Bug, Search, Brain, Lock, Rocket, Globe, Award, Users } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';

interface HomeHeroProps {
  onStartAnalysis: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onStartAnalysis }) => {
  const { isMobile, isSmallMobile } = useMobile();

  return (
    <HeroSection
      title="Next-Gen AI Security Platform"
      subtitle="Revolutionary code analysis powered by advanced artificial intelligence"
      description="Transform your development workflow with enterprise-grade security analysis that detects vulnerabilities, bugs, and quality issues in real-time with unprecedented accuracy."
      variant="gradient"
      className="relative min-h-[90vh] sm:min-h-[85vh] flex items-center justify-center px-4 sm:px-6"
    >
      {/* Revolutionary Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Dynamic Animated Grid */}
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 opacity-40 animate-pulse-slow" />

        {/* Advanced Floating Tech Elements - Hidden on mobile for performance */}
        <div className="hidden md:block">
          <div className="absolute top-10 left-10 animate-float">
            <div className="p-4 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-3xl backdrop-blur-2xl border border-blue-500/40 shadow-3xl group">
              <Brain className="h-8 w-8 text-blue-400 group-hover:animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-3xl animate-pulse"></div>
            </div>
          </div>
          <div className="absolute top-20 right-10 animate-float-delayed">
            <div className="p-4 bg-gradient-to-r from-red-500/30 to-pink-500/30 rounded-3xl backdrop-blur-2xl border border-red-500/40 shadow-3xl group">
              <Lock className="h-8 w-8 text-red-400 group-hover:animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-3xl animate-pulse"></div>
            </div>
          </div>
          <div className="absolute bottom-16 left-16 animate-bounce-slow">
            <div className="p-4 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-3xl backdrop-blur-2xl border border-emerald-500/40 shadow-3xl group">
              <Rocket className="h-8 w-8 text-emerald-400 group-hover:animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-3xl animate-pulse"></div>
            </div>
          </div>
          <div className="absolute top-32 right-32 animate-float-slow">
            <div className="p-4 bg-gradient-to-r from-purple-500/30 to-violet-500/30 rounded-3xl backdrop-blur-2xl border border-purple-500/40 shadow-3xl group">
              <Code className="h-8 w-8 text-purple-400 group-hover:animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-3xl animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Premium Gradient Orbs - Reduced opacity on mobile */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-400/20 sm:from-blue-400/30 via-purple-400/20 sm:via-purple-400/30 to-pink-400/20 sm:to-pink-400/30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-r from-emerald-400/20 sm:from-emerald-400/30 via-teal-400/20 sm:via-teal-400/30 to-cyan-400/20 sm:to-cyan-400/30 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-r from-orange-400/20 sm:from-orange-400/30 to-red-400/20 sm:to-red-400/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 right-1/3 w-36 h-36 sm:w-72 sm:h-72 bg-gradient-to-r from-violet-400/15 sm:from-violet-400/25 via-indigo-400/15 sm:via-indigo-400/25 to-blue-400/15 sm:to-blue-400/25 rounded-full blur-3xl animate-float-gentle" />
      </div>

      {/* Premium Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 lg:space-y-12">
        {/* Revolutionary Feature Badges - Responsive grid */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10 lg:mb-14">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-gradient-to-r from-white/20 to-white/10 dark:from-black/20 dark:to-black/10 backdrop-blur-2xl rounded-xl sm:rounded-2xl lg:rounded-3xl border border-white/40 dark:border-white/30 shadow-2xl hover:scale-105 transition-all duration-500 group touch-manipulation">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-400 group-hover:animate-spin group-hover:text-blue-300" />
            <span className="text-xs sm:text-sm lg:text-base font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Enterprise Security</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-gradient-to-r from-white/20 to-white/10 dark:from-black/20 dark:to-black/10 backdrop-blur-2xl rounded-xl sm:rounded-2xl lg:rounded-3xl border border-white/40 dark:border-white/30 shadow-2xl hover:scale-105 transition-all duration-500 group touch-manipulation">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-400 group-hover:animate-pulse group-hover:text-purple-300" />
            <span className="text-xs sm:text-sm lg:text-base font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AI-Powered</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-gradient-to-r from-white/20 to-white/10 dark:from-black/20 dark:to-black/10 backdrop-blur-2xl rounded-xl sm:rounded-2xl lg:rounded-3xl border border-white/40 dark:border-white/30 shadow-2xl hover:scale-105 transition-all duration-500 group touch-manipulation">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-400 group-hover:animate-bounce group-hover:text-yellow-300" />
            <span className="text-xs sm:text-sm lg:text-base font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Real-Time Analysis</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 bg-gradient-to-r from-white/20 to-white/10 dark:from-black/20 dark:to-black/10 backdrop-blur-2xl rounded-xl sm:rounded-2xl lg:rounded-3xl border border-white/40 dark:border-white/30 shadow-2xl hover:scale-105 transition-all duration-500 group touch-manipulation">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-emerald-400 group-hover:animate-spin group-hover:text-emerald-300" />
            <span className="text-xs sm:text-sm lg:text-base font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Global Scale</span>
          </div>
        </div>

        {/* Revolutionary CTA Buttons - Mobile optimized */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center items-center">
          <Button
            onClick={onStartAnalysis}
            size="lg"
            className="group relative overflow-hidden px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 rounded-2xl sm:rounded-3xl lg:rounded-4xl font-bold text-base sm:text-lg lg:text-xl shadow-3xl transition-all duration-700 hover:scale-105 focus:scale-105 w-full sm:w-auto min-w-[280px] sm:min-w-[320px] touch-manipulation"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-100 group-hover:opacity-95 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 text-white">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 group-hover:animate-pulse group-hover:scale-110 transition-all duration-300" />
              <span className="whitespace-nowrap">Start AI Analysis</span>
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 group-hover:translate-x-3 group-hover:scale-110 transition-all duration-300" />
            </div>
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="group relative overflow-hidden px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 rounded-2xl sm:rounded-3xl lg:rounded-4xl font-bold text-base sm:text-lg lg:text-xl shadow-2xl transition-all duration-700 hover:scale-105 focus:scale-105 w-full sm:w-auto min-w-[280px] sm:min-w-[320px] touch-manipulation"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100/80 to-slate-200/80 dark:from-slate-800/80 dark:to-slate-700/80 opacity-100 group-hover:opacity-95 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200/80 to-slate-300/80 dark:from-slate-700/80 dark:to-slate-600/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 text-slate-700 dark:text-slate-300">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 group-hover:animate-pulse group-hover:scale-110 transition-all duration-300" />
              <span className="whitespace-nowrap">Learn More</span>
            </div>
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-400/20 to-slate-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
          </Button>
        </div>

        {/* Enhanced Stats Section - Mobile responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-12 lg:mt-16">
          <div className="text-center p-4 sm:p-6 bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-xl">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">99.9%</div>
            <div className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 font-medium">Accuracy Rate</div>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-xl">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">50+</div>
            <div className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 font-medium">Languages</div>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-xl">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">10K+</div>
            <div className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 font-medium">Developers</div>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-xl">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">24/7</div>
            <div className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 font-medium">Support</div>
          </div>
        </div>
      </div>
    </HeroSection>
  );
};
