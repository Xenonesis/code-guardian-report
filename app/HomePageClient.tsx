"use client";

import { Toaster } from "sonner";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useEnhancedAnalysis } from "@/hooks/useEnhancedAnalysis";
import { Navigation } from "@/components/layout/Navigation";
import { BreadcrumbContainer } from "@/components/BreadcrumbContainer";
import { Footer } from "@/components/layout/Footer";
import {
  ConnectionStatusBanner,
  useConnectionStatus,
} from "@/components/common/ConnectionStatusBanner";
import HomeSection from "@/components/pages/home/HomeSection";

/**
 * SkipLink - Accessibility component for keyboard navigation
 */
const SkipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
    onClick={(e) => {
      e.preventDefault();
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: "smooth" });
      }
    }}
  >
    Skip to main content
  </a>
);

export default function HomePageClient() {
  const { theme, isDarkMode, setTheme } = useDarkMode();
  const { online, firebaseConnected, usingMockData } = useConnectionStatus();
  const { analysisResults } = useEnhancedAnalysis();

  return (
    <div
      className="min-h-screen"
      role="application"
      aria-label="Code Guardian Security Analysis Application"
    >
      {/* Skip Link for Accessibility */}
      <SkipLink />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        theme={isDarkMode ? "dark" : "light"}
      />

      {/* Connection Status Banners */}
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
        {process.env.NODE_ENV === "development" && (
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

      {/* Breadcrumb Container */}
      {analysisResults && (
        <nav aria-label="Breadcrumb">
          <BreadcrumbContainer analysisResults={analysisResults} />
        </nav>
      )}

      {/* Main Content */}
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        aria-label="Main content"
        className="focus:outline-none"
      >
        <HomeSection theme={theme} />
      </main>

      {/* Footer */}
      <footer role="contentinfo">
        <Footer />
      </footer>
    </div>
  );
}
