import { Toaster } from 'sonner';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useEnhancedAnalysis } from '@/hooks/useEnhancedAnalysis';
import { Navigation } from '@/components/layout/Navigation';
import { SidebarNavigation } from '@/components/SidebarNavigation';
import { BreadcrumbContainer } from '@/components/BreadcrumbContainer';
import { useNavigation } from '@/lib/navigation-context';
import { Footer } from '@/components/layout/Footer';
import { ConnectionStatusBanner, useConnectionStatus } from '@/components/common/ConnectionStatusBanner';
import { PageRouter } from '@/components/routing/PageRouter';

/**
 * SinglePageApp - Main application component
 * 
 * This component handles:
 * - Global layout (navigation, sidebar, footer)
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
  const { currentSection, currentTab, navigateTo, isSidebarCollapsed, toggleSidebar } = useNavigation();
  const { online, firebaseConnected, usingMockData } = useConnectionStatus();
  const { analysisResults } = useEnhancedAnalysis();

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
      
      {/* Breadcrumb Container - Only show when there are analysis results */}
      {analysisResults && (
        <BreadcrumbContainer analysisResults={analysisResults} />
      )}
      
      {/* Page Content - Handled by PageRouter */}
      <PageRouter isDarkMode={isDarkMode} />

      {/* Footer */}
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default SinglePageApp;
