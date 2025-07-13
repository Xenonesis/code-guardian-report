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
import HowItWorksSection from '@/components/pages/about/HowItWorksSection';
import MeetDeveloperSection from '@/components/pages/about/MeetDeveloperSection';
import EnhancedFeatureShowcase from '@/components/pages/about/EnhancedFeatureShowcase';
import { useDarkMode } from '@/hooks/useDarkMode';

const About = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Enterprise Security Framework',
      description: 'Comprehensive security analysis engine with OWASP Top 10 compliance, CVE database integration, and advanced threat detection capabilities. Designed for enterprise-scale applications with stringent security requirements.',
      gradient: 'from-slate-600 via-slate-700 to-slate-800',
      benefits: ['OWASP Top 10 Compliance', 'CVE Database Integration', 'Advanced Threat Detection', 'Security Intelligence', 'Compliance Reporting', 'Risk Assessment']
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: 'Intelligent Analysis Engine',
      description: 'Advanced static code analysis with persistent storage, cross-session synchronization, and intelligent caching. Maintains comprehensive analysis history with detailed reporting and export capabilities.',
      gradient: 'from-blue-600 via-blue-700 to-blue-800',
      benefits: ['Persistent Analysis Results', 'Cross-Session Sync', 'Intelligent Caching', 'Historical Tracking', 'Multiple Export Formats', 'Performance Analytics']
    },
    {
      icon: <Bot className="h-8 w-8" />,
      title: 'AI-Powered Insights',
      description: 'Integration with leading AI platforms including GPT-4 and Claude for contextual code analysis, intelligent recommendations, and automated security assessments with natural language explanations.',
      gradient: 'from-indigo-600 via-indigo-700 to-indigo-800',
      benefits: ['AI-Driven Analysis', 'Contextual Understanding', 'Automated Recommendations', 'Impact Assessment', 'Natural Language Reports', 'Intelligent Prioritization']
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Performance & Monitoring',
      description: 'High-performance analysis engine with real-time monitoring, comprehensive metrics dashboard, and advanced performance tracking for optimal development workflow integration.',
      gradient: 'from-emerald-600 via-emerald-700 to-emerald-800',
      benefits: ['Real-time Monitoring', 'Performance Metrics', 'Analytics Dashboard', 'Workflow Integration', 'Resource Optimization', 'Scalability Insights']
    }
  ];

  return (
    <PageLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
      <AnimatedBackground />

      {/* Enhanced Content with Modern Layout */}
      <div className="relative z-10 space-y-16 sm:space-y-20 lg:space-y-24">
        {/* Enhanced Hero Section */}
        <HeroSection
          title="Code Guardian Enterprise"
          subtitle="Advanced Security Analysis Platform for Modern Development Teams"
          description="Enterprise-grade static code analysis platform powered by artificial intelligence. Delivers comprehensive security assessments, vulnerability detection, and compliance reporting for mission-critical applications. Trusted by development teams worldwide for maintaining secure, high-quality codebases."
          titleId="about-hero-title"
          variant="gradient"
        >
          <div className="space-y-8 sm:space-y-10">
            <VersionInfo />
            <StatsGrid />
          </div>
        </HeroSection>

        {/* Enhanced Information Sections */}
        <div className="space-y-16 sm:space-y-20">
          <DetailedInfo />

          <EnhancedFeatureShowcase />

          <HowToUseSection />

          <HowItWorksSection />
        </div>

        {/* Enhanced Feature Grid Section */}
        <div className="relative py-16 sm:py-20">
          {/* Background Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl float-animation"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl float-animation delay-2s"></div>
          </div>

          <div className="relative z-10">
            <FeatureGrid
              features={features}
              title="Enterprise Capabilities"
              subtitle="Comprehensive security analysis tools designed for modern development environments"
              columns={2}
              variant="modern"
            />
          </div>
        </div>

        {/* Enhanced Bottom Sections */}
        <div className="space-y-16 sm:space-y-20">
          <SupportedToolsSection />

          <MeetDeveloperSection />

          <CallToActionSection />
        </div>
      </div>
    </PageLayout>
  );
};

export default About;
