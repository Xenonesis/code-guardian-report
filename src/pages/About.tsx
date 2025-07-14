import React from 'react';
import { PageLayout } from '@/components/layouts/PageLayout';
import { HeroSection } from '@/components/layouts/HeroSection';
import { AnimatedBackground } from '@/components/pages/about/AnimatedBackground';
import { StatsGrid } from '@/components/pages/about/StatsGrid';
import { VersionInfo } from '@/components/pages/about/VersionInfo';
import { DetailedInfo } from '@/components/pages/about/DetailedInfo';
import { SupportedToolsSection } from '@/components/pages/about/SupportedToolsSection';
import { CallToActionSection } from '@/components/pages/about/CallToActionSection';
import { AboutFeatures } from '@/components/pages/about/AboutFeatures';
import HowToUseSection from '@/components/pages/about/HowToUseSection';
import HowItWorksSection from '@/components/pages/about/HowItWorksSection';
import MeetDeveloperSection from '@/components/pages/about/MeetDeveloperSection';
import EnhancedFeatureShowcase from '@/components/pages/about/EnhancedFeatureShowcase';
import { useDarkMode } from '@/hooks/useDarkMode';

const About = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

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

        <AboutFeatures />

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
