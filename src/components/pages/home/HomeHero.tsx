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

      {/* Premium Gradient Orbs - Refined */}
      <div className="animate-float-slow absolute top-1/4 left-1/4 h-[28rem] w-[28rem] rounded-full bg-gradient-to-r from-blue-400/25 via-violet-400/25 to-fuchsia-400/20 blur-3xl" />
      <div className="animate-float-delayed absolute right-1/4 bottom-1/4 h-[24rem] w-[24rem] rounded-full bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-cyan-400/20 blur-3xl" />
      <div className="animate-pulse-slow absolute top-1/2 left-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-amber-400/15 to-rose-400/15 blur-3xl" />
      <div className="animate-float-gentle absolute top-1/3 right-1/3 h-[22rem] w-[22rem] rounded-full bg-gradient-to-r from-violet-400/20 via-purple-400/20 to-blue-400/15 blur-3xl" />

      {/* Premium Main Content */}
      <div className="relative z-10 mx-auto max-w-5xl space-y-4 text-center sm:space-y-6">
        {/* Revolutionary CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Button
            onClick={onStartAnalysis}
            size="lg"
            className="group relative w-full min-w-[280px] overflow-hidden rounded-2xl border border-white/10 px-10 py-5 text-lg font-semibold transition-all duration-400 hover:translate-y-[-2px] hover:shadow-2xl focus:translate-y-[-2px] sm:w-auto sm:min-w-[320px] sm:rounded-3xl sm:px-12 sm:py-6 sm:text-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 opacity-100 transition-opacity duration-400" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
            <div className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]" />
            <div className="relative flex items-center justify-center gap-3 text-white sm:gap-4">
              <Brain className="h-6 w-6 transition-transform duration-300 group-hover:scale-110 sm:h-7 sm:w-7" />
              <span className="tracking-tight whitespace-nowrap">
                Start AI Analysis
              </span>
              <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-2 sm:h-7 sm:w-7" />
            </div>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="group relative w-full min-w-[280px] overflow-hidden rounded-2xl border border-slate-300/50 bg-white/60 px-10 py-5 text-lg font-semibold shadow-lg backdrop-blur-xl transition-all duration-400 hover:translate-y-[-2px] hover:border-slate-300/70 hover:bg-white/80 hover:shadow-xl sm:w-auto sm:min-w-[320px] sm:rounded-3xl sm:px-12 sm:py-6 sm:text-xl dark:border-white/20 dark:bg-white/5 dark:hover:border-white/30 dark:hover:bg-white/10"
          >
            <div className="relative flex items-center justify-center gap-3 sm:gap-4">
              <Rocket className="h-6 w-6 text-violet-600 transition-transform duration-300 group-hover:scale-110 sm:h-7 sm:w-7 dark:text-violet-400" />
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text tracking-tight whitespace-nowrap text-transparent dark:from-white dark:to-slate-300">
                Live Demo
              </span>
            </div>
          </Button>
        </div>

        {/* Revolutionary Feature Badges */}
        <div className="mb-10 flex flex-col items-center gap-4 sm:mb-14">
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/70 px-6 py-3.5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:translate-y-[-2px] hover:bg-white/90 hover:shadow-xl dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <Sparkles className="h-5 w-5 text-amber-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text font-semibold whitespace-nowrap text-transparent dark:from-white dark:to-slate-300">
              Explore Features
            </span>
            {showFeatures ? (
              <ChevronUp className="h-5 w-5 text-slate-500 transition-transform duration-200 dark:text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-500 transition-transform duration-200 dark:text-slate-400" />
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
              <div className="xs:grid-cols-2 xs:gap-4 mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2">
                <div className="group xs:px-5 xs:py-3.5 flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/70 px-4 py-3 shadow-md backdrop-blur-xl transition-all duration-300 hover:translate-y-[-2px] hover:bg-white/90 hover:shadow-lg dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10">
                  <Shield className="xs:h-5 xs:w-5 h-4 w-4 text-blue-500 transition-transform duration-300 group-hover:scale-110" />
                  <span className="xs:text-base bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-sm font-semibold text-transparent">
                    Enterprise Security
                  </span>
                </div>
                <div className="group xs:px-5 xs:py-3.5 flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/70 px-4 py-3 shadow-md backdrop-blur-xl transition-all duration-300 hover:translate-y-[-2px] hover:bg-white/90 hover:shadow-lg dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10">
                  <Brain className="xs:h-5 xs:w-5 h-4 w-4 text-violet-500 transition-transform duration-300 group-hover:scale-110" />
                  <span className="xs:text-base bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-sm font-semibold text-transparent">
                    AI-Powered
                  </span>
                </div>
                <div className="group xs:px-5 xs:py-3.5 flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/70 px-4 py-3 shadow-md backdrop-blur-xl transition-all duration-300 hover:translate-y-[-2px] hover:bg-white/90 hover:shadow-lg dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10">
                  <Zap className="xs:h-5 xs:w-5 h-4 w-4 text-amber-500 transition-transform duration-300 group-hover:scale-110" />
                  <span className="xs:text-base bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-sm font-semibold text-transparent">
                    Real-Time Analysis
                  </span>
                </div>
                <div className="group xs:px-5 xs:py-3.5 flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/70 px-4 py-3 shadow-md backdrop-blur-xl transition-all duration-300 hover:translate-y-[-2px] hover:bg-white/90 hover:shadow-lg dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10">
                  <Globe className="xs:h-5 xs:w-5 h-4 w-4 text-emerald-500 transition-transform duration-300 group-hover:scale-110" />
                  <span className="xs:text-base bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-sm font-semibold text-transparent">
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
