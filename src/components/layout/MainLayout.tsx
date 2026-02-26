"use client";

import { useEnhancedAnalysis } from "@/hooks/useEnhancedAnalysis";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import {
  ConnectionStatusBanner,
  useConnectionStatus,
} from "@/components/common/ConnectionStatusBanner";

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * SkipLink - Accessibility component for keyboard navigation
 */
const SkipLink = () => (
  <a
    href="#main-content"
    className="focus:bg-primary sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 focus:outline-none"
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

/**
 * MainLayout - Persistent shell for all pages with navigation and footer
 */
export function MainLayout({ children }: MainLayoutProps) {
  const { online, firebaseConnected, usingMockData } = useConnectionStatus();
  useEnhancedAnalysis();
  // Using navigation context just to ensure it's initialized if needed,
  // but mostly relying on useNavigation inside components.

  return (
    <div
      className="flex min-h-screen w-full flex-col overflow-x-clip"
      role="application"
      aria-label="Code Guardian Security Analysis Application"
    >
      {/* Progress Bar for Smooth Transitions */}
      <ProgressBar
        height="4px"
        color="hsl(var(--primary))"
        options={{ showSpinner: false }}
        shallowRouting
      />

      {/* Skip Link for Accessibility */}
      <SkipLink />

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

      {/* Navigation — portaled to document.body, no wrapper needed */}
      <Navigation />

      {/* Main Content */}
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        aria-label="Main content"
        className="flex-1 focus:outline-none"
      >
        {children}
      </main>

      {/* Footer */}
      <footer role="contentinfo" className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
}
