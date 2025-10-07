import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { AuthProvider } from "@/lib/auth-context";
import { NavigationProvider } from "@/lib/navigation-context";
import { ConnectionStatus } from "@/components/common/ConnectionStatus";
import { FirestoreStatus } from "@/components/firebase/FirestoreStatus";
import { FirestoreHealthChecker } from "@/components/firebase/FirestoreHealthChecker";
import { FirestoreErrorNotification } from "@/components/firebase/FirestoreErrorNotification";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { PWAUpdateNotification } from "@/components/pwa/PWAUpdateNotification";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { SmoothScrollProvider } from "./SmoothScrollProvider";
import { ScrollToTop } from "@/components/common/ScrollToTop";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <AuthProvider>
      <NavigationProvider>
        <ErrorBoundary>
          <TooltipProvider>
            <SmoothScrollProvider>
              <Sonner 
                position="top-right"
                toastOptions={{
                  className: 'rounded-lg',
                  duration: 3000,
                  style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                }}
              />
              <ConnectionStatus />
              <FirestoreStatus />
              <FirestoreHealthChecker />
              <FirestoreErrorNotification />
              <PWAInstallPrompt />
              <PWAUpdateNotification />
              <OfflineIndicator />
              {children}
              <ScrollToTop />
              <Analytics />
              <SpeedInsights />
            </SmoothScrollProvider>
          </TooltipProvider>
        </ErrorBoundary>
      </NavigationProvider>
    </AuthProvider>
  );
};