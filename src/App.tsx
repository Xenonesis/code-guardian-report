
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";
import ErrorBoundary from "@/components/ErrorBoundary";
import SinglePageApp from "./pages/SinglePageApp";
import { AuthProvider } from "@/lib/auth-context";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { FirestoreStatus } from "@/components/FirestoreStatus";
import { FirestoreHealthChecker } from "@/components/FirestoreHealthChecker";
import { FirestoreErrorNotification } from "@/components/FirestoreErrorNotification";
import { useEffect, type ReactNode } from "react";
import Lenis from '@studio-freight/lenis';

// Lenis smooth scroll initialization with context for global access
import { createContext, useContext, useRef as useReactRef } from "react";

const LenisContext = createContext<Lenis | null>(null);

const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  const lenisRef = useReactRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.18, // higher lerp for faster, still smooth
      smoothWheel: true,
      syncTouch: true,
      infinite: false,
      easing: (t: number) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t // easeInOutQuad for snappy yet smooth
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
};

const App = () => (
main
  <AuthProvider>
    <ErrorBoundary>
      <TooltipProvider>
        <SmoothScroll>
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
          <SinglePageApp />
          <Analytics />
        </SmoothScroll>
      </TooltipProvider>
    </ErrorBoundary>
  </AuthProvider>
<AuthProvider>
      <ErrorBoundary>
    <TooltipProvider>
      <SmoothScroll>
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
        <SinglePageApp />
        <Analytics />
      </SmoothScroll>
    </TooltipProvider>
  </ErrorBoundary>
</AuthProvider>
 main
);

export default App;