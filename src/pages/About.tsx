import React from 'react';
import { AboutPageLayout } from '@/components/layouts/AboutPageLayout';
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
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Navigation - spans full width above everything */}
      <AboutPageLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} showNavigation={true} noContainer={true}>
        {/* Main Content */}
        <div className="pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Enhanced Content with Modern Layout */}
            <div className="relative z-10 space-y-16 sm:space-y-20 lg:space-y-24">
            {/* Enhanced Hero Section */}
            <section id="introduction">
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
            </section>

            {/* Enhanced Information Sections */}
            <div className="space-y-16 sm:space-y-20">
              <section id="getting-started">
                <DetailedInfo />
              </section>

              <section id="features">
                <EnhancedFeatureShowcase />
              </section>

              <section id="examples">
                <HowToUseSection />
              </section>

              <section id="api-reference">
                <HowItWorksSection />
              </section>
            </div>

            <section id="tech-stack">
              <AboutFeatures />
            </section>

            {/* Enhanced Bottom Sections */}
            <div className="space-y-16 sm:space-y-20">
              <section id="updates">
                <SupportedToolsSection />
              </section>

              <section id="about-section">
                <MeetDeveloperSection />
              </section>

              <section id="faq">
                <CallToActionSection />
              </section>
            </div>
          </div>
          </div>
        </div>
      </AboutPageLayout>
    </div>
  );
};

export default About;
