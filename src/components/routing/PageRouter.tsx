import React, { Suspense, lazy } from 'react';
import { useNavigation } from '@/lib/navigation-context';
import { useEnhancedAnalysis } from '@/hooks/useEnhancedAnalysis';
import { type FirebaseAnalysisData } from '@/services/storage/firebaseAnalysisStorage';
import type { Theme } from '@/hooks/useDarkMode';

// Page loading spinner component
const PageLoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Lazy load all page components for better performance
const HomeSection = lazy(() => import('@/components/pages/home/HomeSection'));
const AboutSection = lazy(() => import('@/components/pages/about/AboutSection'));
const PrivacySection = lazy(() => import('@/components/pages/legal/PrivacySection'));
const TermsSection = lazy(() => import('@/components/pages/legal/TermsSection'));
const HelpPage = lazy(() => import('@/components/HelpPage').then(m => ({ default: m.HelpPage })));
const HistoryPage = lazy(() => import('@/pages/HistoryPage').then(m => ({ default: m.HistoryPage })));
const GitHubAnalysisPage = lazy(() => import('@/pages/GitHubAnalysisPage').then(m => ({ default: m.GitHubAnalysisPage })));
const AccountConflictDemo = lazy(() => import('@/pages/AccountConflictDemo').then(m => ({ default: m.AccountConflictDemo })));
const TestAuthConflict = lazy(() => import('@/pages/TestAuthConflict').then(m => ({ default: m.TestAuthConflict })));
const NotificationTest = lazy(() => import('@/pages/NotificationTest'));

interface PageRouterProps {
  theme?: Theme;
}

export const PageRouter: React.FC<PageRouterProps> = ({ theme = 'system' }) => {
  const { currentSection, navigateTo } = useNavigation();
  const { restoreFromHistory } = useEnhancedAnalysis();

  // Helper function to handle history analysis selection
  const handleHistoryAnalysisSelect = (analysis: FirebaseAnalysisData) => {
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
  };

  // Render the appropriate page based on currentSection
  const renderPage = () => {
    switch (currentSection) {
      case 'home':
        return (
          <Suspense fallback={<PageLoadingSpinner />}>
            <HomeSection theme={theme} />
          </Suspense>
        );

      case 'about':
        return (
          <Suspense fallback={<PageLoadingSpinner />}>
            <AboutSection />
          </Suspense>
        );

      case 'privacy':
        return (
          <Suspense fallback={<PageLoadingSpinner />}>
            <PrivacySection />
          </Suspense>
        );

      case 'terms':
        return (
          <Suspense fallback={<PageLoadingSpinner />}>
            <TermsSection />
          </Suspense>
        );

      case 'help':
        return (
          <Suspense fallback={<PageLoadingSpinner />}>
            <div>
              <HelpPage />
            </div>
          </Suspense>
        );

      case 'history':
        return (
          <Suspense fallback={<PageLoadingSpinner />}>
            <div>
              <HistoryPage 
                onAnalysisSelect={handleHistoryAnalysisSelect}
                onNavigateBack={() => navigateTo('home')}
              />
            </div>
          </Suspense>
        );

      case 'github-analysis':
        return (
          <Suspense fallback={<PageLoadingSpinner />}>
            <GitHubAnalysisPage />
          </Suspense>
        );

      case 'account-conflict-demo':
        return (
          <Suspense fallback={<PageLoadingSpinner />}>
            <AccountConflictDemo />
          </Suspense>
        );

      case 'test-auth-conflict':
        return (
          <Suspense fallback={<PageLoadingSpinner />}>
            <TestAuthConflict />
          </Suspense>
        );

      case 'notification-test':
        return (
          <Suspense fallback={<PageLoadingSpinner />}>
            <NotificationTest />
          </Suspense>
        );

      default:
        // Redirect to home if section not found
        navigateTo('home');
        return null;
    }
  };

  return <>{renderPage()}</>;
};

export default PageRouter;
