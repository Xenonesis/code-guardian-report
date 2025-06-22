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
import { useDarkMode } from '@/hooks/useDarkMode';

const About = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Enterprise Security Analysis',
      description: 'Military-grade security scanning with comprehensive vulnerability detection and threat intelligence.',
      gradient: 'from-emerald-500 to-teal-600',
      benefits: ['OWASP Top 10 Coverage', 'CVE Database Integration', 'Zero-day Detection', 'Threat Intelligence', 'Compliance Reporting']
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: 'Advanced Code Quality',
      description: 'Deep code analysis with AI-powered insights for maintainability, performance, and technical debt.',
      gradient: 'from-blue-500 to-indigo-600',
      benefits: ['Cyclomatic Complexity', 'Technical Debt Analysis', 'Maintainability Index', 'Performance Metrics', 'Refactoring Suggestions']
    },
    {
      icon: <Bot className="h-6 w-6" />,
      title: 'AI-Powered Intelligence',
      description: 'Next-generation AI that understands your code context and provides intelligent recommendations.',
      gradient: 'from-purple-500 to-pink-600',
      benefits: ['Natural Language Explanations', 'Auto-fix Suggestions', 'Impact Assessment', 'Learning Algorithms', 'Context Awareness']
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Hyper-Fast Processing',
      description: 'Cutting-edge analysis engine with distributed processing for enterprise-scale codebases.',
      gradient: 'from-amber-500 to-orange-600',
      benefits: ['Parallel Processing', 'Incremental Analysis', 'Real-time Results', 'Distributed Computing', 'Edge Optimization']
    }
  ];

  return (
    <PageLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
      <AnimatedBackground />

      {/* Content with relative positioning to appear above background */}
      <div className="relative z-10">
        <HeroSection
          title="Enterprise-Grade Code Security Platform"
          subtitle="Trusted by 10,000+ developers worldwide"
          description="Our platform combines industry-leading static analysis tools with cutting-edge AI to provide comprehensive security and quality assessment for your codebase. Built by developers, for developers."
          titleId="about-hero-title"
          variant="gradient"
        >
          <VersionInfo />
          <StatsGrid />
        </HeroSection>

        <DetailedInfo />

        <FeatureGrid
          features={features}
          title="Platform Capabilities"
          subtitle="Everything you need for comprehensive code security and quality analysis"
          columns={4}
          variant="modern"
        />

        <SupportedToolsSection />

        <DeveloperSection />

        <CallToActionSection />
      </div>
    </PageLayout>
  );
};

export default About;
