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
      className="relative min-h-[80vh] flex items-center justify-center"
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 opacity-20 animate-pulse-slow" />
        
        {/* Floating Code Elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="p-3 bg-blue-500/10 rounded-xl backdrop-blur-sm border border-blue-500/20">
            <Code className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <div className="absolute top-32 right-16 animate-float-delayed">
          <div className="p-3 bg-red-500/10 rounded-xl backdrop-blur-sm border border-red-500/20">
            <Bug className="h-6 w-6 text-red-500" />
          </div>
        </div>
        <div className="absolute bottom-32 left-20 animate-bounce-slow">
          <div className="p-3 bg-emerald-500/10 rounded-xl backdrop-blur-sm border border-emerald-500/20">
            <Search className="h-6 w-6 text-emerald-500" />
          </div>
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-full border border-white/20 dark:border-white/10">
            <Shield className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Security First</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-full border border-white/20 dark:border-white/10">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Lightning Fast</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-full border border-white/20 dark:border-white/10">
            <Star className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">AI-Powered</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={onStartAnalysis}
            size="xl"
            className="group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Start Code Analysis
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Button>
          
          <Button
            variant="glass"
            size="xl"
            className="group"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              View Demo
            </div>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10 dark:border-white/5">
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              10M+
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Lines of Code Analyzed
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              50K+
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Vulnerabilities Found
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              99.9%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Accuracy Rate
            </div>
          </div>
        </div>
      </div>
    </HeroSection>
  );
};