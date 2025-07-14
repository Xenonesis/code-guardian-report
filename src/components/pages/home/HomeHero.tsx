import React from 'react';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/layouts/HeroSection';
import { Shield, Zap, Star, ArrowRight, Sparkles, Code, Bug, Search, Brain, Lock, Rocket, Globe, Award, Users } from 'lucide-react';

interface HomeHeroProps {
  onStartAnalysis: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onStartAnalysis }) => {
  return (
    <HeroSection
      title="Next-Gen AI Security Platform"
      subtitle="Revolutionary code analysis powered by advanced artificial intelligence"
      description="Transform your development workflow with enterprise-grade security analysis that detects vulnerabilities, bugs, and quality issues in real-time with unprecedented accuracy."
      variant="gradient"
      className="relative min-h-[90vh] sm:min-h-[85vh] flex items-center justify-center px-4 sm:px-6"
    >
      {/* Revolutionary Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dynamic Animated Grid */}
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 opacity-40 animate-pulse-slow" />

        {/* Advanced Floating Tech Elements */}
        <div className="absolute top-16 left-8 animate-float">
          <div className="p-5 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-3xl backdrop-blur-2xl border border-blue-500/40 shadow-3xl hover:scale-125 transition-all duration-700 group">
            <Brain className="h-10 w-10 text-blue-400 group-hover:animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-3xl animate-pulse"></div>
          </div>
        </div>
        <div className="absolute top-24 right-12 animate-float-delayed">
          <div className="p-5 bg-gradient-to-r from-red-500/30 to-pink-500/30 rounded-3xl backdrop-blur-2xl border border-red-500/40 shadow-3xl hover:scale-125 transition-all duration-700 group">
            <Lock className="h-10 w-10 text-red-400 group-hover:animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-3xl animate-pulse"></div>
          </div>
        </div>
        <div className="absolute bottom-24 left-16 animate-bounce-slow">
          <div className="p-5 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-3xl backdrop-blur-2xl border border-emerald-500/40 shadow-3xl hover:scale-125 transition-all duration-700 group">
            <Rocket className="h-10 w-10 text-emerald-400 group-hover:animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-3xl animate-pulse"></div>
          </div>
        </div>
        <div className="absolute top-40 right-32 animate-float-slow">
          <div className="p-5 bg-gradient-to-r from-purple-500/30 to-violet-500/30 rounded-3xl backdrop-blur-2xl border border-purple-500/40 shadow-3xl hover:scale-125 transition-all duration-700 group">
            <Code className="h-10 w-10 text-purple-400 group-hover:animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-3xl animate-pulse"></div>
          </div>
        </div>

        {/* Premium Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/30 via-teal-400/30 to-cyan-400/30 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-400/30 to-red-400/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-violet-400/25 via-indigo-400/25 to-blue-400/25 rounded-full blur-3xl animate-float-gentle" />
      </div>

      {/* Premium Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 sm:space-y-12">
        {/* Revolutionary Feature Badges */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10 sm:mb-14">
          <div className="flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-white/20 to-white/10 dark:from-black/20 dark:to-black/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/40 dark:border-white/30 shadow-2xl hover:scale-110 transition-all duration-500 group">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 group-hover:animate-spin group-hover:text-blue-300" />
            <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Enterprise Security</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-white/20 to-white/10 dark:from-black/20 dark:to-black/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/40 dark:border-white/30 shadow-2xl hover:scale-110 transition-all duration-500 group">
            <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 group-hover:animate-pulse group-hover:text-purple-300" />
            <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AI-Powered</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-white/20 to-white/10 dark:from-black/20 dark:to-black/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/40 dark:border-white/30 shadow-2xl hover:scale-110 transition-all duration-500 group">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 group-hover:animate-bounce group-hover:text-yellow-300" />
            <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Real-Time Analysis</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-white/20 to-white/10 dark:from-black/20 dark:to-black/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/40 dark:border-white/30 shadow-2xl hover:scale-110 transition-all duration-500 group">
            <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 group-hover:animate-spin group-hover:text-emerald-300" />
            <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Global Scale</span>
          </div>
        </div>

        {/* Revolutionary CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center">
          <Button
            onClick={onStartAnalysis}
            size="lg"
            className="group relative overflow-hidden px-10 sm:px-12 py-5 sm:py-6 rounded-3xl sm:rounded-4xl font-bold text-lg sm:text-xl shadow-3xl transition-all duration-700 hover:scale-115 focus:scale-115 w-full sm:w-auto min-w-[280px] sm:min-w-[320px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-100 group-hover:opacity-95 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center justify-center gap-3 sm:gap-4 text-white">
              <Brain className="h-6 w-6 sm:h-7 sm:w-7 group-hover:animate-pulse group-hover:scale-110 transition-all duration-300" />
              <span className="whitespace-nowrap">Start AI Analysis</span>
              <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7 group-hover:translate-x-3 group-hover:scale-110 transition-all duration-300" />
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="group relative overflow-hidden px-10 sm:px-12 py-5 sm:py-6 rounded-3xl sm:rounded-4xl font-bold text-lg sm:text-xl bg-gradient-to-r from-white/15 to-white/10 dark:from-black/15 dark:to-black/10 backdrop-blur-2xl border-2 border-white/40 dark:border-white/30 hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 dark:hover:from-black/25 dark:hover:to-black/15 shadow-2xl transition-all duration-700 hover:scale-115 w-full sm:w-auto min-w-[280px] sm:min-w-[320px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="relative flex items-center justify-center gap-3 sm:gap-4">
              <Rocket className="h-6 w-6 sm:h-7 sm:w-7 group-hover:animate-bounce group-hover:scale-110 transition-all duration-300" />
              <span className="whitespace-nowrap bg-gradient-to-r from-slate-700 to-slate-900 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">Live Demo</span>
            </div>
          </Button>
        </div>

        {/* Revolutionary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mt-16 sm:mt-20 pt-10 sm:pt-12 border-t border-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30">
          <div className="text-center group hover:scale-110 transition-all duration-500 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            <div className="relative p-6 rounded-3xl bg-gradient-to-r from-white/10 to-white/5 dark:from-black/10 dark:to-black/5 backdrop-blur-xl border border-white/20 dark:border-white/10">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2 sm:mb-3 animate-pulse">
                100M+
              </div>
              <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold">
                Lines Analyzed
              </div>
            </div>
          </div>
          <div className="text-center group hover:scale-110 transition-all duration-500 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            <div className="relative p-6 rounded-3xl bg-gradient-to-r from-white/10 to-white/5 dark:from-black/10 dark:to-black/5 backdrop-blur-xl border border-white/20 dark:border-white/10">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2 sm:mb-3 animate-pulse">
                500K+
              </div>
              <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold">
                Threats Detected
              </div>
            </div>
          </div>
          <div className="text-center group hover:scale-110 transition-all duration-500 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            <div className="relative p-6 rounded-3xl bg-gradient-to-r from-white/10 to-white/5 dark:from-black/10 dark:to-black/5 backdrop-blur-xl border border-white/20 dark:border-white/10">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent mb-2 sm:mb-3 animate-pulse">
                99.9%
              </div>
              <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold">
                Accuracy Rate
              </div>
            </div>
          </div>
          <div className="text-center group hover:scale-110 transition-all duration-500 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            <div className="relative p-6 rounded-3xl bg-gradient-to-r from-white/10 to-white/5 dark:from-black/10 dark:to-black/5 backdrop-blur-xl border border-white/20 dark:border-white/10">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-2 sm:mb-3 animate-pulse">
                10K+
              </div>
              <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold">
                Enterprise Users
              </div>
            </div>
          </div>
        </div>
      </div>
    </HeroSection>
  );
};
