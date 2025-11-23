import React from 'react';
import { AboutPageLayout } from '@/components/layout/AboutPageLayout';
import { HeroSection } from '@/components/layout/HeroSection';
import { AnimatedBackground } from '@/components/pages/about/AnimatedBackground';
import { StatsGrid } from '@/components/pages/about/StatsGrid';
import { VersionInfo } from '@/components/pages/about/VersionInfo';
import { DetailedInfo } from '@/components/pages/about/DetailedInfo';
import { SupportedToolsSection } from '@/components/pages/about/SupportedToolsSection';
import { CallToActionSection } from '@/components/pages/about/CallToActionSection';
import { AboutFeatures } from '@/components/pages/about/AboutFeatures';
import HowToUseSection from '@/components/pages/about/HowToUseSection';
import HowItWorksSection from '@/components/pages/about/HowItWorksSection';
import GitHubContributorsSection from '@/components/pages/about/GitHubContributorsSection';
import EnhancedFeatureShowcase from '@/components/pages/about/EnhancedFeatureShowcase';
import { CustomRulesSection } from '@/components/pages/about/CustomRulesSection';
import MonitoringInfoSection from '@/components/pages/about/MonitoringInfoSection';
import MultiLanguageSupportDisplay from '@/components/language/MultiLanguageSupportDisplay';
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
              <section id="custom-rules">
                <CustomRulesSection />
              </section>

              <section id="real-time-monitoring">
                <MonitoringInfoSection />
              </section>

              <section id="multi-language-support">
                <MultiLanguageSupportDisplay 
                  languageStats={[
                    { language: 'JavaScript', fileCount: 45, lineCount: 3200, percentage: 35, securityIssues: 12, ruleCount: 17 },
                    { language: 'TypeScript', fileCount: 38, lineCount: 2800, percentage: 30, securityIssues: 8, ruleCount: 17 },
                    { language: 'Python', fileCount: 20, lineCount: 1500, percentage: 15, securityIssues: 6, ruleCount: 15 },
                    { language: 'Java', fileCount: 15, lineCount: 1200, percentage: 10, securityIssues: 5, ruleCount: 14 },
                    { language: 'PHP', fileCount: 8, lineCount: 600, percentage: 6, securityIssues: 4, ruleCount: 13 },
                    { language: 'Ruby', fileCount: 4, lineCount: 300, percentage: 2, securityIssues: 2, ruleCount: 12 }
                  ]}
                  totalFiles={130}
                  totalLines={9600}
                  showFeatures={true}
                />
              </section>

              <section id="updates">
                <SupportedToolsSection />
              </section>

              <section id="about-section">
                <GitHubContributorsSection />
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
