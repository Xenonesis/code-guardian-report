import React from 'react';
import { Shield, Code, Zap, Bot, Users, FileCode, Shield as ShieldIcon, Award } from 'lucide-react';
import { PageLayout } from '@/components/layouts/PageLayout';
import { HeroSection } from '@/components/layouts/HeroSection';
import { FeatureGrid } from '@/components/features/FeatureGrid';
import { AnimatedBackground } from '@/components/pages/about/AnimatedBackground';
import { StatsGrid } from '@/components/pages/about/StatsGrid';
import { VersionInfo } from '@/components/pages/about/VersionInfo';
import { DetailedInfo } from '@/components/pages/about/DetailedInfo';
import { SupportedToolsSection } from '@/components/pages/about/SupportedToolsSection';
import { DeveloperSection } from '@/components/pages/about/DeveloperSection';
import { CallToActionSection } from '@/components/pages/about/CallToActionSection';
import HowToUseSection from '@/components/pages/about/HowToUseSection';
import MeetDeveloperSection from '@/components/pages/about/MeetDeveloperSection';
import { useDarkMode } from '@/hooks/useDarkMode';

const About = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Enterprise Security Analysis',
      description: 'Military-grade security scanning with comprehensive vulnerability detection, threat intelligence, and real-time monitoring for enterprise-scale applications.',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      benefits: ['OWASP Top 10 Coverage', 'CVE Database Integration', 'Zero-day Detection', 'Threat Intelligence', 'Compliance Reporting', 'Real-time Monitoring']
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: 'Advanced Code Quality',
      description: 'Deep code analysis with AI-powered insights for maintainability, performance optimization, and technical debt reduction across multiple programming languages.',
      gradient: 'from-blue-500 via-indigo-500 to-purple-600',
      benefits: ['Cyclomatic Complexity', 'Technical Debt Analysis', 'Maintainability Index', 'Performance Metrics', 'Refactoring Suggestions', 'Multi-language Support']
    },
    {
      icon: <Bot className="h-8 w-8" />,
      title: 'AI-Powered Intelligence',
      description: 'Next-generation AI that understands your code context, learns from patterns, and provides intelligent recommendations with natural language explanations.',
      gradient: 'from-purple-500 via-pink-500 to-rose-600',
      benefits: ['Natural Language Explanations', 'Auto-fix Suggestions', 'Impact Assessment', 'Learning Algorithms', 'Context Awareness', 'Smart Recommendations']
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Hyper-Fast Processing',
      description: 'Cutting-edge analysis engine with distributed processing, parallel computing, and edge optimization for lightning-fast results on enterprise-scale codebases.',
      gradient: 'from-amber-500 via-orange-500 to-red-600',
      benefits: ['Parallel Processing', 'Incremental Analysis', 'Real-time Results', 'Distributed Computing', 'Edge Optimization', 'Cloud Scaling']
    }
  ];

  return (
    <PageLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
      <AnimatedBackground />

      {/* Content with relative positioning to appear above background */}
      <div className="relative z-10">
        <HeroSection
          title="Code Guardian"
          subtitle="AI-Powered Security Analysis Platform"
          description="Next-generation AI-powered code analysis platform that identifies security vulnerabilities, code quality issues, and performance bottlenecks. Upload your code and get instant insights with actionable fixes and AI-generated prompts for popular development tools."
          titleId="about-hero-title"
          variant="gradient"
        >
          <VersionInfo />
          <StatsGrid />
        </HeroSection>

        <DetailedInfo />

        <HowToUseSection />

        <FeatureGrid
          features={features}
          title="🚀 Platform Capabilities"
          subtitle="Everything you need for comprehensive code security, quality analysis, and performance optimization"
          columns={2}
          variant="modern"
        />

        <SupportedToolsSection />

        <MeetDeveloperSection />

        <CallToActionSection />
      </div>
    </PageLayout>
  );
};

export default About;
