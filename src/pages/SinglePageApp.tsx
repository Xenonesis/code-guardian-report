import { useState, Suspense, lazy, useCallback } from 'react';
import { Toaster } from 'sonner';
import { PageLayout } from '@/components/layout/PageLayout';
import { HomeHero } from '@/components/pages/home/HomeHero';
import { AnalysisTabs } from '@/components/pages/home/AnalysisTabs';
import { StorageBanner } from '@/components/pages/home/StorageBanner';
import { useAnalysisHandlers } from '@/components/pages/home/AnalysisHandlers';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useEnhancedAnalysis } from '@/hooks/useEnhancedAnalysis';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { Navigation } from '@/components/layout/Navigation';
import { SidebarNavigation } from '@/components/SidebarNavigation';
import { BreadcrumbContainer } from '@/components/BreadcrumbContainer';
import { useNavigation } from '@/lib/navigation-context';
import { Footer } from '@/components/layout/Footer';
import { ConnectionStatusBanner, useConnectionStatus } from '@/components/common/ConnectionStatusBanner';

import { logger } from '@/utils/logger';
// Import About page components
import { HeroSection } from '@/components/layout/HeroSection';
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
import { AboutFeatures } from '@/components/pages/about/AboutFeatures';
import { CustomRulesSection } from '@/components/pages/about/CustomRulesSection';
 
 // Import Legal page components
import { LegalSection, LegalSubsection, LegalList } from '@/components/legal/LegalSection';
import { HelpPage } from '@/components/HelpPage';
import { HistoryPage } from './HistoryPage';

import { Shield, Eye, Database, Lock, Users, Globe, Mail, FileText, Scale, AlertTriangle } from 'lucide-react';

// Lazy load heavy components for better performance
const FloatingChatBot = lazy(() => import('@/components/ai/FloatingChatBot'));
const StorageStatus = lazy(() => import('@/components/firebase/StorageStatus'));
const AnalysisHistoryModal = lazy(() => import('@/components/analysis/AnalysisHistoryModal'));
const GitHubAnalysisPage = lazy(() => import('./GitHubAnalysisPage').then(m => ({ default: m.GitHubAnalysisPage })));
const AccountConflictDemo = lazy(() => import('./AccountConflictDemo').then(m => ({ default: m.AccountConflictDemo })));
const TestAuthConflict = lazy(() => import('./TestAuthConflict').then(m => ({ default: m.TestAuthConflict })));

const SinglePageApp = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showStorageStatus, setShowStorageStatus] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { theme, isDarkMode, setTheme } = useDarkMode();
  const { currentSection, currentTab, setCurrentTab, navigateTo, isSidebarCollapsed, toggleSidebar } = useNavigation();
  const { online, firebaseConnected, usingMockData } = useConnectionStatus();
  
  const {
    analysisResults,
    hasStoredData,
    isNewFile,
    storedAnalysis,
    storageStats,
    selectedFile,
    handleFileSelect,
    handleAnalysisComplete,
    clearStoredData,
    exportAnalysis,
    importAnalysis,
    getAnalysisHistory,
    optimizeStorage,
    restoreFromHistory,
  } = useEnhancedAnalysis();

  // Create a wrapper that ensures file reference is available
  const [currentAnalysisFile, setCurrentAnalysisFile] = useState<File | null>(null);
  
  const handleFileSelectWithTracking = useCallback((file: File) => {
    logger.debug('🔄 File selected with tracking:', file.name);
    setCurrentAnalysisFile(file);
    handleFileSelect(file);
  }, [handleFileSelect]);
  
  const handleAnalysisCompleteWithFile = useCallback(async (results: AnalysisResults, file?: File) => {
    logger.debug('🔄 Analysis complete with file:', { 
      hasFile: !!file, 
      fileName: file?.name,
      hasCurrentAnalysisFile: !!currentAnalysisFile,
      hasSelectedFile: !!selectedFile 
    });
    
    // Use the file parameter from useFileUpload if available, otherwise use currentAnalysisFile
    const fileToUse = file || currentAnalysisFile;
    
    if (fileToUse) {
      logger.debug('🔄 Storing analysis results with file:', fileToUse.name);
      // Pass the file directly to handleAnalysisComplete to bypass state synchronization issues
      await handleAnalysisComplete(results, undefined, fileToUse);
    } else {
      logger.error('❌ No file available for analysis storage');
      await handleAnalysisComplete(results);
    }
  }, [currentAnalysisFile, selectedFile, handleFileSelect, handleAnalysisComplete]);

  const {
    handleAnalysisCompleteWithRedirect,
    handleClearStoredData,
    handleExportAnalysis,
    handleImportAnalysis,
    handleOptimizeStorage,
    handleRestoreFromHistory
  } = useAnalysisHandlers({
    hasStoredData,
    onAnalysisComplete: handleAnalysisCompleteWithFile,
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
    
  };

  return (
    <div className="min-h-screen">
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        expand={false}
        richColors
        closeButton
        theme={isDarkMode ? 'dark' : 'light'}
      />
      
      {/* Connection Status Banners */}
      <ConnectionStatusBanner 
        show={!online} 
        type="offline"
        message="You are currently offline. Some features may be limited."
      />
      <ConnectionStatusBanner 
        show={!firebaseConnected && online} 
        type="firebase-error"
        message="Unable to connect to Firebase. Using local storage only."
      />
      {/* Only show mock data warning in development */}
      {import.meta.env.DEV && (
        <ConnectionStatusBanner 
          show={usingMockData} 
          type="mock-data"
          message="Displaying sample data for testing. Connect to see your real data."
        />
      )}
      
      {/* Navigation */}
      <Navigation theme={theme} onThemeChange={setTheme} />
      
      {/* Sidebar Navigation */}
      <SidebarNavigation
        currentSection={currentSection}
        currentTab={currentTab}
        onNavigate={navigateTo}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      
      {/* Breadcrumb Container - Only show when not on home, when there are results, or when on help */}
      {analysisResults && (
        <BreadcrumbContainer analysisResults={analysisResults} />
      )}
      
      {/* Home Section */}
      {currentSection === 'home' && (
        <section id="home" className="min-h-screen">
          <PageLayout
            isDarkMode={isDarkMode}
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
              onFileSelect={handleFileSelectWithTracking}
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
          
          <div className="pt-12 sm:pt-16">
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              <div className="relative z-10 space-y-12 sm:space-y-16 lg:space-y-20 xl:space-y-24">
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
                  <div id="custom-rules">
                    <CustomRulesSection />
                  </div>

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
          <div className="pt-12 sm:pt-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
              <div className="max-w-4xl mx-auto">
                {/* Privacy Header */}
                <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4 sm:mb-6">
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 px-4">
                    Privacy Policy
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 px-4">
                    Your privacy is our priority. Learn how we protect and handle your data.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-2">
                    Last updated: July 17, 2025
                  </p>
                </div>

                {/* Privacy Content */}
                <div className="space-y-8 sm:space-y-10 lg:space-y-12">
                  <LegalSection title="Introduction" icon={<Eye className="h-4 w-4 sm:h-5 sm:w-5" />}>
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
                        'Source code files you upload for analysis',
                        'Analysis results and security findings',
                        'File metadata (names, sizes, types)',
                        'Analysis preferences and settings'
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
                        'End-to-end encryption for data transmission',
                        'Secure browser-based processing when possible',
                        'Regular security audits and vulnerability assessments',
                        'Access controls and authentication mechanisms',
                        'Secure data storage with encryption at rest'
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
          <div className="pt-12 sm:pt-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
              <div className="max-w-4xl mx-auto">
                {/* Terms Header */}
                <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4 sm:mb-6">
                    <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 px-4">
                    Terms of Service
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 px-4">
                    Please read these terms carefully before using Code Guardian.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 mt-2">
                    Last updated: July 17, 2025
                  </p>
                </div>

                {/* Terms Content */}
                <div className="space-y-8 sm:space-y-10 lg:space-y-12">
                  <LegalSection title="Agreement to Terms" icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5" />}>
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
                        'AI-powered code security analysis and vulnerability detection',
                        'Static code analysis for multiple programming languages',
                        'Integration with popular AI services (OpenAI, Anthropic)',
                        'Real-time analysis results and recommendations',
                        'Export capabilities for analysis reports',
                        'Educational resources and security best practices'
                      ]} />
                    </LegalSubsection>
                  </LegalSection>

                  <LegalSection title="User Responsibilities" icon={<Users className="h-5 w-5" />}>
                    <LegalSubsection title="Acceptable Use">
                      <p>When using Code Guardian, you agree to:</p>
                      <LegalList items={[
                        'Use the service only for lawful purposes',
                        'Respect intellectual property rights',
                        'Not attempt to reverse engineer or hack the platform',
                        'Not upload malicious code or content',
                        'Comply with all applicable laws and regulations',
                        'Use your own API keys for third-party AI services'
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
                        'We do not guarantee the accuracy of security analysis results',
                        'Analysis results should not be the sole basis for security decisions',
                        'We are not responsible for decisions made based on our analysis',
                        'Third-party AI services have their own limitations and terms',
                        'No warranty of merchantability or fitness for a particular purpose'
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
              if (analysis) {
                const storedData = {
                  ...analysis,
                  timestamp: analysis.timestamp.toMillis(),
                  version: '2',
                  metadata: {
                    userAgent: '',
                    analysisEngine: '',
                    engineVersion: '',
                    sessionId: '',
                  },
                };
                restoreFromHistory(storedData);
                navigateTo('home', 'results');
              }
            }}
            onNavigateBack={() => navigateTo('home')}
          />
        </div>
      )}

      {/* GitHub Analysis Section */}
      {currentSection === 'github-analysis' && (
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <GitHubAnalysisPage />
        </Suspense>
      )}

      {/* Account Conflict Demo Section */}
      {currentSection === 'account-conflict-demo' && (
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <AccountConflictDemo />
        </Suspense>
      )}

      {/* Test Auth Conflict Section */}
      {currentSection === 'test-auth-conflict' && (
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <TestAuthConflict />
        </Suspense>
      )}

      {/* Footer */}
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default SinglePageApp;
