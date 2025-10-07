import { useState, Suspense, lazy, useEffect } from 'react';
import { PageLayout } from '@/components/layouts/PageLayout';
import { HomeHero } from '@/components/pages/home/HomeHero';
import { AnalysisTabs } from '@/components/pages/home/AnalysisTabs';
import { StorageBanner } from '@/components/pages/home/StorageBanner';
import { useAnalysisHandlers } from '@/components/pages/home/AnalysisHandlers';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useEnhancedAnalysis } from '@/hooks/useEnhancedAnalysis';
import { Navigation } from '@/components/Navigation';
import { SidebarNavigation } from '@/components/SidebarNavigation';
import { BreadcrumbContainer } from '@/components/BreadcrumbContainer';
import { useNavigation } from '@/lib/navigation-context';
import { Footer } from '@/components/Footer';

// Import About page components
import { HeroSection } from '@/components/layouts/HeroSection';
import { AnimatedBackground } from '@/components/pages/about/AnimatedBackground';
import { StatsGrid } from '@/components/pages/about/StatsGrid';
import { VersionInfo } from '@/components/pages/about/VersionInfo';
import { DetailedInfo } from '@/components/pages/about/DetailedInfo';
import { SupportedToolsSection } from '@/components/pages/about/SupportedToolsSection';
import { CallToActionSection } from '@/components/pages/about/CallToActionSection';
import HowToUseSection from '@/components/pages/about/HowToUseSection';
import HowItWorksSection from '@/components/pages/about/HowItWorksSection';
import MeetDeveloperSection from '@/components/pages/about/MeetDeveloperSection';
import EnhancedFeatureShowcase from '@/components/pages/about/EnhancedFeatureShowcase';

// Import Legal page components
import { LegalSection, LegalSubsection, LegalList } from '@/components/legal/LegalSection';
import { HelpPage } from '@/components/HelpPage';
import { HistoryPage } from './HistoryPage';
import { Shield, Eye, Database, Lock, Users, Globe, Mail, FileText, Scale, AlertTriangle, Gavel } from 'lucide-react';

// Lazy load heavy components for better performance
const FloatingChatBot = lazy(() => import('@/components/FloatingChatBot'));
const StorageStatus = lazy(() => import('@/components/StorageStatus'));
const AnalysisHistoryModal = lazy(() => import('@/components/AnalysisHistoryModal'));

const SinglePageApp = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showStorageStatus, setShowStorageStatus] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { currentSection, currentTab, setCurrentTab, navigateTo, isSidebarCollapsed, toggleSidebar } = useNavigation();
  
  const {
    analysisResults,
    hasStoredData,
    isNewFile,
    storedAnalysis,
    storageStats,
    handleFileSelect,
    handleAnalysisComplete,
    clearStoredData,
    exportAnalysis,
    importAnalysis,
    getAnalysisHistory,
    optimizeStorage,
    restoreFromHistory,
  } = useEnhancedAnalysis();

  const {
    handleAnalysisCompleteWithRedirect,
    handleClearStoredData,
    handleExportAnalysis,
    handleImportAnalysis,
    handleOptimizeStorage,
    handleRestoreFromHistory
  } = useAnalysisHandlers({
    hasStoredData,
    onAnalysisComplete: handleAnalysisComplete,
    onSetCurrentTab: setCurrentTab,
    onSetIsRedirecting: setIsRedirecting,
    onClearStoredData: clearStoredData,
    onExportAnalysis: exportAnalysis,
    onImportAnalysis: importAnalysis,
    onOptimizeStorage: optimizeStorage,
    onRestoreFromHistory: (analysisData) => {
      restoreFromHistory(analysisData);
      setShowHistoryModal(false);
    }
  });

  const handleStartAnalysis = () => {
    navigateTo('home', 'upload');
    // Scroll to the upload section after navigation
    setTimeout(() => {
      const analysisTabs = document.querySelector('section[role="main"]');
      if (analysisTabs) {
        analysisTabs.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      {/* Sidebar Navigation */}
      <SidebarNavigation
        currentSection={currentSection}
        currentTab={currentTab}
        onNavigate={navigateTo}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      
      {/* Breadcrumb Container - Only show when not on home, when there are results, or when on help */}
      {(currentSection !== 'home' || analysisResults || currentSection === 'help') && (
        <BreadcrumbContainer analysisResults={analysisResults} />
      )}
      
      {/* Home Section */}
      {currentSection === 'home' && (
        <section id="home" className="min-h-screen">
          <PageLayout
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            showNavigation={false}
          >
            <HomeHero onStartAnalysis={handleStartAnalysis} />

            <StorageBanner
              hasStoredData={hasStoredData}
              storedAnalysis={storedAnalysis}
              storageStats={storageStats}
              isNewFile={isNewFile}
              showStorageStatus={showStorageStatus}
              onToggleStorageStatus={() => setShowStorageStatus(!showStorageStatus)}
            />

            {/* Storage Status Component */}
            {showStorageStatus && (
              <div className="max-w-6xl mx-auto mb-6">
                <Suspense fallback={<div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>}>
                  <StorageStatus
                    hasStoredData={hasStoredData}
                    storedAnalysis={storedAnalysis}
                    storageStats={storageStats}
                    onClearData={handleClearStoredData}
                    onExportAnalysis={handleExportAnalysis}
                    onImportAnalysis={handleImportAnalysis}
                    onOptimizeStorage={handleOptimizeStorage}
                    onShowHistory={() => setShowHistoryModal(true)}
                  />
                </Suspense>
              </div>
            )}

            <AnalysisTabs
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              analysisResults={analysisResults}
              onFileSelect={handleFileSelect}
              onAnalysisComplete={handleAnalysisCompleteWithRedirect}
              isRedirecting={isRedirecting}
            />

            {/* Analysis History Modal */}
            <Suspense fallback={null}>
              <AnalysisHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                history={getAnalysisHistory()}
                onRestoreAnalysis={handleRestoreFromHistory}
              />
            </Suspense>

            {/* Floating Chat Bot */}
            <Suspense fallback={null}>
              {analysisResults && <FloatingChatBot analysisResults={analysisResults} />}
            </Suspense>
          </PageLayout>
        </section>
      )}

      {/* About Section */}
      {currentSection === 'about' && (
        <section id="about" className="min-h-screen relative overflow-hidden">
          <AnimatedBackground />
          
          <div className="pt-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative z-10 space-y-16 sm:space-y-20 lg:space-y-24">
                {/* Enhanced Hero Section */}
                <div>
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
                </div>

                {/* Enhanced Information Sections */}
                <div className="space-y-16 sm:space-y-20">
                  <div id="getting-started">
                    <DetailedInfo />
                  </div>

                  <div id="features">
                    <EnhancedFeatureShowcase />
                  </div>

                  <div id="examples">
                    <HowToUseSection />
                  </div>

                  <div id="api-reference">
                    <HowItWorksSection />
                  </div>
                </div>

                <div id="tech-stack">
                  <AboutFeatures />
                </div>

                {/* Enhanced Bottom Sections */}
                <div className="space-y-16 sm:space-y-20">
                  <div id="updates">
                    <SupportedToolsSection />
                  </div>

                  <div id="about-section">
                    <MeetDeveloperSection />
                  </div>

                  <div id="faq">
                    <CallToActionSection />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Privacy Section */}
      {currentSection === 'privacy' && (
        <section id="privacy" className="min-h-screen bg-slate-50 dark:bg-slate-900/50">
          <div className="pt-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="max-w-4xl mx-auto">
                {/* Privacy Header */}
                <div className="text-center mb-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
                    <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                    Privacy Policy
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-400">
                    Your privacy is our priority. Learn how we protect and handle your data.
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                    Last updated: July 17, 2025
                  </p>
                </div>

                {/* Privacy Content */}
                <div className="space-y-12">
                  <LegalSection title="Introduction" icon={<Eye className="h-5 w-5" />}>
                    <p>
                      Welcome to Code Guardian, an AI-powered code security analysis platform. This Privacy Policy explains how we collect, use, protect, and share information about you when you use our service. We are committed to protecting your privacy and ensuring transparency about our data practices.
                    </p>
                    <p>
                      Code Guardian is designed with privacy in mind. We process your code locally in your browser whenever possible and only collect the minimum data necessary to provide our services effectively.
                    </p>
                  </LegalSection>

                  <LegalSection title="Information We Collect" icon={<Database className="h-5 w-5" />}>
                    <LegalSubsection title="Code Analysis Data">
                      <p>When you use our code analysis features, we may temporarily process:</p>
                      <LegalList items={[
                        "Source code files you upload for analysis",
                        "Analysis results and security findings",
                        "File metadata (names, sizes, types)",
                        "Analysis preferences and settings"
                      ]} />
                      <p className="mt-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <strong>Important:</strong> Your source code is processed locally in your browser whenever possible. We do not permanently store your source code on our servers.
                      </p>
                    </LegalSubsection>
                  </LegalSection>

                  <LegalSection title="Data Protection & Security" icon={<Lock className="h-5 w-5" />}>
                    <LegalSubsection title="Security Measures">
                      <p>We implement industry-standard security measures to protect your data:</p>
                      <LegalList items={[
                        "End-to-end encryption for data transmission",
                        "Secure browser-based processing when possible",
                        "Regular security audits and vulnerability assessments",
                        "Access controls and authentication mechanisms",
                        "Secure data storage with encryption at rest"
                      ]} />
                    </LegalSubsection>
                  </LegalSection>

                  <LegalSection title="Contact Us" icon={<Mail className="h-5 w-5" />}>
                    <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
                    <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Email: itisaddy7@gmail.com</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Website: Code Guardian Platform</span>
                        </div>
                      </div>
                    </div>
                  </LegalSection>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Terms Section */}
      {currentSection === 'terms' && (
        <section id="terms" className="min-h-screen bg-white dark:bg-slate-900">
          <div className="pt-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="max-w-4xl mx-auto">
                {/* Terms Header */}
                <div className="text-center mb-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
                    <Scale className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                    Terms of Service
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-400">
                    Please read these terms carefully before using Code Guardian.
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                    Last updated: July 17, 2025
                  </p>
                </div>

                {/* Terms Content */}
                <div className="space-y-12">
                  <LegalSection title="Agreement to Terms" icon={<FileText className="h-5 w-5" />}>
                    <p>
                      Welcome to Code Guardian, an AI-powered code security analysis platform. These Terms of Service ("Terms") govern your use of our website and services. By accessing or using Code Guardian, you agree to be bound by these Terms.
                    </p>
                    <p>
                      If you do not agree to these Terms, please do not use our service. We may update these Terms from time to time, and your continued use constitutes acceptance of any changes.
                    </p>
                    
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        <strong>Important:</strong> Code Guardian is provided as a free service for educational and professional use. Commercial use may require additional agreements.
                      </p>
                    </div>
                  </LegalSection>

                  <LegalSection title="Service Description" icon={<Shield className="h-5 w-5" />}>
                    <LegalSubsection title="What We Provide">
                      <p>Code Guardian offers the following services:</p>
                      <LegalList items={[
                        "AI-powered code security analysis and vulnerability detection",
                        "Static code analysis for multiple programming languages",
                        "Integration with popular AI services (OpenAI, Anthropic)",
                        "Real-time analysis results and recommendations",
                        "Export capabilities for analysis reports",
                        "Educational resources and security best practices"
                      ]} />
                    </LegalSubsection>
                  </LegalSection>

                  <LegalSection title="User Responsibilities" icon={<Users className="h-5 w-5" />}>
                    <LegalSubsection title="Acceptable Use">
                      <p>When using Code Guardian, you agree to:</p>
                      <LegalList items={[
                        "Use the service only for lawful purposes",
                        "Respect intellectual property rights",
                        "Not attempt to reverse engineer or hack the platform",
                        "Not upload malicious code or content",
                        "Comply with all applicable laws and regulations",
                        "Use your own API keys for third-party AI services"
                      ]} />
                    </LegalSubsection>
                  </LegalSection>

                  <LegalSection title="Disclaimers & Limitations" icon={<AlertTriangle className="h-5 w-5" />}>
                    <LegalSubsection title="Service Disclaimers">
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
                        <p className="font-medium text-yellow-900 dark:text-yellow-100">
                          <strong>Important:</strong> Code Guardian is provided "as is" without warranties of any kind.
                        </p>
                      </div>
                      <LegalList items={[
                        "We do not guarantee the accuracy of security analysis results",
                        "Analysis results should not be the sole basis for security decisions",
                        "We are not responsible for decisions made based on our analysis",
                        "Third-party AI services have their own limitations and terms",
                        "No warranty of merchantability or fitness for a particular purpose"
                      ]} />
                    </LegalSubsection>
                  </LegalSection>

                  <LegalSection title="Contact Information" icon={<Mail className="h-5 w-5" />}>
                    <p>If you have questions about these Terms of Service, please contact us:</p>
                    <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Email: itisaddy7@gmail.com</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Website: Code Guardian Platform</span>
                        </div>
                      </div>
                    </div>
                  </LegalSection>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Help Section */}
      {currentSection === 'help' && (
        <div>
          <HelpPage />
        </div>
      )}

      {/* History Section */}
      {currentSection === 'history' && (
        <div>
          <HistoryPage 
            onAnalysisSelect={(analysis) => {
              navigateTo('home', 'results');
            }}
            onNavigateBack={() => navigateTo('home')}
          />
        </div>
      )}

      {/* Footer */}
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default SinglePageApp;