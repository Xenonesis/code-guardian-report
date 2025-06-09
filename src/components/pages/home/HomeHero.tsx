import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Info, Users, FileCode, Download, Shield, Sparkles, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/layouts/HeroSection';
import { Badge } from '@/components/ui/badge';

interface HomeHeroProps {
  onStartAnalysis: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onStartAnalysis }) => {
  const stats = [
    { label: 'Developers Trust Us', value: '10K+', icon: <Users className="h-4 w-4" /> },
    { label: 'Files Analyzed', value: '1M+', icon: <FileCode className="h-4 w-4" /> },
    { label: 'Vulnerabilities Found', value: '50K+', icon: <Shield className="h-4 w-4" /> },
    { label: 'Languages Supported', value: '15+', icon: <Star className="h-4 w-4" /> }
  ];

  const features = [
    { icon: <Shield className="h-5 w-5" />, text: 'Enterprise Security', gradient: 'from-emerald-500 to-teal-500' },
    { icon: <Zap className="h-5 w-5" />, text: 'Lightning Fast', gradient: 'from-yellow-500 to-orange-500' },
    { icon: <Sparkles className="h-5 w-5" />, text: 'AI-Powered', gradient: 'from-purple-500 to-pink-500' }
  ];

  return (
    <HeroSection
      title="Next-Generation Code Security Platform"
      subtitle="Powered by AI, Trusted by Developers"
      description="Transform your development workflow with comprehensive static code analysis that identifies security vulnerabilities, bugs, and quality issues in real-time."
      variant="gradient"
    >
      {/* Feature Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-4 sm:px-0">
        {features.map((feature, index) => (
          <Badge
            key={index}
            variant="secondary"
            className={`glass-card px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-gradient-to-r ${feature.gradient} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              {feature.icon}
              <span className="hidden xs:inline">{feature.text}</span>
            </div>
          </Badge>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4 sm:px-0">
        <Button
          onClick={onStartAnalysis}
          className="btn-primary-modern w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-2xl hover:shadow-blue-500/25 group"
          size="lg"
        >
          <Shield className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-pulse" />
          <span className="hidden xs:inline">Start Security Analysis</span>
          <span className="xs:hidden">Start Analysis</span>
          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button
          asChild
          variant="outline"
          className="btn-secondary-modern w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 group"
          size="lg"
        >
          <Link to="/about" className="flex items-center justify-center gap-2">
            <Info className="h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-bounce transition-all" />
            <span className="hidden xs:inline">Explore Features</span>
            <span className="xs:hidden">Features</span>
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto px-4 sm:px-0">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="modern-card text-center p-3 sm:p-4 lg:p-6 group hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-center mb-2 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <div className="h-4 w-4 sm:h-5 sm:w-5">
                {stat.icon}
              </div>
            </div>
            <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-tight">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </HeroSection>
  );
};

export default HomeHero;
