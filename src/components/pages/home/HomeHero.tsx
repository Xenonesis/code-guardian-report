import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/HeroSection";
import {
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
  Brain,
  Rocket,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface HomeHeroProps {
  onStartAnalysis: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onStartAnalysis }) => {
  const [showFeatures, setShowFeatures] = useState(false);

  return (
    <HeroSection
      title=""
      description="Transform your development workflow with enterprise-grade security analysis that detects vulnerabilities, bugs, and quality issues in real-time with unprecedented accuracy."
      variant="gradient"
      className="relative flex min-h-[50vh] items-center justify-center px-4 sm:min-h-[55vh] sm:px-6"
    >
      {/* Revolutionary Background Effects */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Dynamic Animated Grid */}
        <div className="bg-grid-slate-100 dark:bg-grid-slate-800 animate-pulse-slow absolute inset-0 opacity-40" />
      </div>

      {/* Premium Gradient Orbs */}
      <div className="animate-float-slow absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 blur-3xl" />
      <div className="animate-float-delayed absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-gradient-to-r from-emerald-400/30 via-teal-400/30 to-cyan-400/30 blur-3xl" />
      <div className="animate-pulse-slow absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-orange-400/30 to-red-400/30 blur-3xl" />
      <div className="animate-float-gentle absolute top-1/3 right-1/3 h-72 w-72 rounded-full bg-gradient-to-r from-violet-400/25 via-indigo-400/25 to-blue-400/25 blur-3xl" />

      {/* Premium Main Content */}
      <div className="relative z-10 mx-auto max-w-5xl space-y-4 text-center sm:space-y-6">
        {/* Revolutionary CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Button
            onClick={onStartAnalysis}
            size="lg"
            className="group shadow-3xl relative w-full min-w-[280px] overflow-hidden rounded-3xl px-10 py-5 text-lg font-bold transition-all duration-700 hover:scale-115 focus:scale-115 sm:w-auto sm:min-w-[320px] sm:rounded-4xl sm:px-12 sm:py-6 sm:text-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-100 transition-opacity duration-500 group-hover:opacity-95" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex items-center justify-center gap-3 text-white sm:gap-4">
              <Brain className="h-6 w-6 transition-all duration-300 group-hover:scale-110 group-hover:animate-pulse sm:h-7 sm:w-7" />
              <span className="whitespace-nowrap">Start AI Analysis</span>
              <ArrowRight className="h-6 w-6 transition-all duration-300 group-hover:translate-x-3 group-hover:scale-110 sm:h-7 sm:w-7" />
            </div>
            <div className="absolute inset-0 animate-pulse rounded-3xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="group relative w-full min-w-[280px] overflow-hidden rounded-3xl border-2 border-white/40 bg-gradient-to-r from-white/15 to-white/10 px-10 py-5 text-lg font-bold shadow-2xl backdrop-blur-2xl transition-all duration-700 hover:scale-115 hover:bg-gradient-to-r hover:from-white/25 hover:to-white/15 sm:w-auto sm:min-w-[320px] sm:rounded-4xl sm:px-12 sm:py-6 sm:text-xl dark:border-white/30 dark:from-black/15 dark:to-black/10 dark:hover:from-black/25 dark:hover:to-black/15"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
            <div className="relative flex items-center justify-center gap-3 sm:gap-4">
              <Rocket className="h-6 w-6 transition-all duration-300 group-hover:scale-110 group-hover:animate-bounce sm:h-7 sm:w-7" />
              <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text whitespace-nowrap text-transparent dark:from-white dark:to-slate-200">
                Live Demo
              </span>
            </div>
          </Button>
        </div>

        {/* Revolutionary Feature Badges */}
        <div className="mb-10 flex flex-col items-center gap-4 sm:mb-14">
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="group flex items-center gap-3 rounded-3xl border border-white/40 bg-gradient-to-r from-white/20 to-white/10 px-8 py-4 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:scale-110 dark:border-white/30 dark:from-black/20 dark:to-black/10"
          >
            <Sparkles className="h-6 w-6 text-pink-400 group-hover:animate-pulse group-hover:text-pink-300" />
            <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text font-bold whitespace-nowrap text-transparent dark:from-white dark:to-slate-200">
              Explore Features
            </span>
            {showFeatures ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </button>

          <div
            className={`overflow-visible transition-all duration-700 ease-in-out ${
              showFeatures
                ? "mt-6 max-h-[1000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            {showFeatures && (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="group flex items-center gap-3 rounded-2xl border border-white/40 bg-gradient-to-r from-white/20 to-white/10 px-6 py-4 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:scale-110 dark:border-white/30 dark:from-black/20 dark:to-black/10">
                  <Shield className="h-6 w-6 text-blue-400 group-hover:animate-spin group-hover:text-blue-300" />
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text font-bold text-transparent">
                    Enterprise Security
                  </span>
                </div>
                <div className="group flex items-center gap-3 rounded-2xl border border-white/40 bg-gradient-to-r from-white/20 to-white/10 px-6 py-4 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:scale-110 dark:border-white/30 dark:from-black/20 dark:to-black/10">
                  <Brain className="h-6 w-6 text-purple-400 group-hover:animate-pulse group-hover:text-purple-300" />
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-bold text-transparent">
                    AI-Powered
                  </span>
                </div>
                <div className="group flex items-center gap-3 rounded-2xl border border-white/40 bg-gradient-to-r from-white/20 to-white/10 px-6 py-4 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:scale-110 dark:border-white/30 dark:from-black/20 dark:to-black/10">
                  <Zap className="h-6 w-6 text-yellow-400 group-hover:animate-bounce group-hover:text-yellow-300" />
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text font-bold text-transparent">
                    Real-Time Analysis
                  </span>
                </div>
                <div className="group flex items-center gap-3 rounded-2xl border border-white/40 bg-gradient-to-r from-white/20 to-white/10 px-6 py-4 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:scale-110 dark:border-white/30 dark:from-black/20 dark:to-black/10">
                  <Globe className="h-6 w-6 text-emerald-400 group-hover:animate-spin group-hover:text-emerald-300" />
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text font-bold text-transparent">
                    Global Scale
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </HeroSection>
  );
};
