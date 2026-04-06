"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { AuthProvider } from "@/lib/auth-context";
import { NavigationProvider } from "@/lib/navigation-context";
import { SmoothScrollProvider } from "./providers/SmoothScrollProvider";

const ConnectionStatus = dynamic(
  () =>
    import("@/components/common/ConnectionStatus").then(
      (mod) => mod.ConnectionStatus
    ),
  { ssr: false }
);

const FirestoreStatus = dynamic(
  () =>
    import("@/components/firebase/FirestoreStatus").then(
      (mod) => mod.FirestoreStatus
    ),
  { ssr: false }
);

const FirestoreHealthChecker = dynamic(
  () =>
    import("@/components/firebase/FirestoreHealthChecker").then(
      (mod) => mod.FirestoreHealthChecker
    ),
  { ssr: false }
);

const FirestoreErrorNotification = dynamic(
  () =>
    import("@/components/firebase/FirestoreErrorNotification").then(
      (mod) => mod.FirestoreErrorNotification
    ),
  { ssr: false }
);

const PWAUpdateNotification = dynamic(
  () =>
    import("@/components/pwa/PWAUpdateNotification").then(
      (mod) => mod.PWAUpdateNotification
    ),
  { ssr: false }
);

const OfflineIndicator = dynamic(
  () =>
    import("@/components/pwa/OfflineIndicator").then(
      (mod) => mod.OfflineIndicator
    ),
  { ssr: false }
);

const PWAMobileBanner = dynamic(
  () =>
    import("@/components/pwa/PWAMobileBanner").then(
      (mod) => mod.PWAMobileBanner
    ),
  { ssr: false }
);

const ScrollToTop = dynamic(
  () =>
    import("@/components/common/ScrollToTop").then((mod) => mod.ScrollToTop),
  { ssr: false }
);

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const isProd = process.env.NODE_ENV === "production";
  const pathname = usePathname();
  const [enableDeferredUI, setEnableDeferredUI] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;

    const enable = () => setEnableDeferredUI(true);

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(enable, { timeout: 1200 });
    } else {
      timeoutId = setTimeout(enable, 250);
    }

    return () => {
      if (idleId) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const needsFirestoreStatus =
    pathname === "/" ||
    pathname?.startsWith("/history") ||
    pathname?.startsWith("/github-analysis");

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <NavigationProvider>
          <ErrorBoundary>
            <TooltipProvider>
              <SmoothScrollProvider>
                <Sonner
                  position="top-right"
                  toastOptions={{
                    className: "rounded-lg",
                    duration: 3000,
                    style: {
                      background: "hsl(var(--background))",
                      color: "hsl(var(--foreground))",
                      border: "1px solid hsl(var(--border))",
                    },
                  }}
                />
                {enableDeferredUI ? <ConnectionStatus /> : null}
                {enableDeferredUI && needsFirestoreStatus ? (
                  <FirestoreStatus />
                ) : null}
                {enableDeferredUI && needsFirestoreStatus ? (
                  <FirestoreHealthChecker />
                ) : null}
                {enableDeferredUI && needsFirestoreStatus ? (
                  <FirestoreErrorNotification />
                ) : null}
                {enableDeferredUI ? <PWAUpdateNotification /> : null}
                {enableDeferredUI ? <OfflineIndicator /> : null}
                {enableDeferredUI ? <PWAMobileBanner /> : null}
                {children}
                {enableDeferredUI ? <ScrollToTop /> : null}
                {isProd ? <Analytics /> : null}
                {isProd ? <SpeedInsights /> : null}
              </SmoothScrollProvider>
            </TooltipProvider>
          </ErrorBoundary>
        </NavigationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
