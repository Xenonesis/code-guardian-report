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
      title: 'Advanced Security Analysis',
      description: 'Military-grade security scanning with comprehensive vulnerability detection, OWASP Top 10 coverage, and real-time threat intelligence for enterprise-scale applications.',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      benefits: ['OWASP Top 10 Coverage', 'CVE Database Integration', 'Zero-day Detection', 'Threat Intelligence', 'Compliance Reporting', 'Real-time Monitoring']
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: 'Persistent Storage System',
      description: 'Advanced analysis results storage with cross-tab synchronization, automatic compression, and intelligent history management. Results persist until new uploads with full export capabilities.',
      gradient: 'from-blue-500 via-indigo-500 to-purple-600',
      benefits: ['Persistent Results', 'Cross-tab Sync', 'Data Compression', 'History Management', 'Export Formats', 'Storage Analytics']
    },
    {
      icon: <Bot className="h-8 w-8" />,
      title: 'Enhanced AI Intelligence',
      description: 'Next-generation AI with GPT-4 and Claude integration, contextual understanding, intelligent key management, and natural language explanations for complex security issues.',
      gradient: 'from-purple-500 via-pink-500 to-rose-600',
      benefits: ['AI Key Management', 'Contextual Analysis', 'Auto-fix Suggestions', 'Impact Assessment', 'Learning Algorithms', 'Smart Recommendations']
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Performance & Analytics',
      description: 'Lightning-fast processing with enhanced analytics dashboard, real-time metrics, performance tracking, and comprehensive bundle monitoring for optimal user experience.',
      gradient: 'from-amber-500 via-orange-500 to-red-600',
      benefits: ['Bundle Monitoring', 'Performance Metrics', 'Real-time Analytics', 'Usage Statistics', 'Performance Tracking', 'Optimization Insights']
    }
  ];

  return (
    <PageLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
      <AnimatedBackground />

      {/* Content with relative positioning to appear above background */}
      <div className="relative z-10">
        <HeroSection
          title="Code Guardian v3.3.0"
          subtitle="Next-Generation AI-Powered Security Analysis Platform"
          description="Revolutionary AI-powered code analysis platform with persistent storage, enhanced analytics, and intelligent insights. Upload your code and get instant security analysis with persistent results that save until your next upload. Features advanced AI integration, comprehensive vulnerability detection, and enterprise-grade reporting capabilities."
          titleId="about-hero-title"
          variant="gradient"
        >
          <VersionInfo />
          <StatsGrid />
        </HeroSection>

        <DetailedInfo />

        <EnhancedFeatureShowcase />

        <HowToUseSection />

        <HowItWorksSection />

        <FeatureGrid
          features={features}
          title="Advanced Features"
          subtitle="Comprehensive tools and capabilities for enterprise-grade security analysis"
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
