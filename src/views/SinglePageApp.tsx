import { Toaster } from 'sonner';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useEnhancedAnalysis } from '@/hooks/useEnhancedAnalysis';
import { Navigation } from '@/components/layout/Navigation';
import { BreadcrumbContainer } from '@/components/BreadcrumbContainer';
import { Footer } from '@/components/layout/Footer';
import { ConnectionStatusBanner, useConnectionStatus } from '@/components/common/ConnectionStatusBanner';
import { PageRouter } from '@/components/routing/PageRouter';

/**
 * SkipLink - Accessibility component for keyboard navigation
 * Allows users to skip directly to main content
 */
const SkipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
    onClick={(e) => {
      e.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth' });
      }
    }}
  >
    Skip to main content
  </a>
);

/**
 * SinglePageApp - Main application component
 * 
 * This component handles:
 * - Global layout (navigation, footer)
 * - Theme management
 * - Connection status monitoring
 * - Toast notifications
 * - Page routing via PageRouter
 * 
 * Individual page logic has been extracted to separate components:
 * - HomeSection: Main analysis functionality
 * - AboutSection: About page content
 * - PrivacySection: Privacy policy
 * - TermsSection: Terms of service
 * - And other lazy-loaded pages
 */
const SinglePageApp = () => {
  const { theme, isDarkMode, setTheme } = useDarkMode();
  const { online, firebaseConnected, usingMockData } = useConnectionStatus();
  const { analysisResults } = useEnhancedAnalysis();

  return (
    <div className="min-h-screen" role="application" aria-label="Code Guardian Security Analysis Application">
      {/* Skip Link for Accessibility */}
      <SkipLink />

      {/* Toast Notifications - announced to screen readers */}
      <Toaster 
        position="top-right"
        expand={false}
        richColors
        closeButton
        theme={isDarkMode ? 'dark' : 'light'}
      />
      
      {/* Connection Status Banners - live region for status updates */}
      <div role="status" aria-live="polite" aria-atomic="true">
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
        {process.env.NODE_ENV === 'development' && (
          <ConnectionStatusBanner 
            show={usingMockData} 
            type="mock-data"
            message="Displaying sample data for testing. Connect to see your real data."
          />
        )}
      </div>
      
      {/* Navigation */}
      <header role="banner">
        <Navigation theme={theme} onThemeChange={setTheme} />
      </header>
      
      {/* Breadcrumb Container - Only show when there are analysis results */}
      {analysisResults && (
        <nav aria-label="Breadcrumb">
          <BreadcrumbContainer analysisResults={analysisResults} />
        </nav>
      )}
      
      {/* Page Content - Handled by PageRouter */}
      <main 
        id="main-content" 
        role="main" 
        tabIndex={-1}
        aria-label="Main content"
        className="focus:outline-none"
      >
        <PageRouter theme={theme} />
      </main>

      {/* Footer */}
      <footer role="contentinfo">
        <Footer />
      </footer>
    </div>
  );
};

export default SinglePageApp;
