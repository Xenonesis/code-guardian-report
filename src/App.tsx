
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import { useEffect, type ReactNode } from "react";
import Lenis from '@studio-freight/lenis';

// Lenis smooth scroll initialization with context for global access
import { createContext, useContext, useRef as useReactRef } from "react";

const LenisContext = createContext<Lenis | null>(null);

const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  const lenisRef = useReactRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.07, // slightly slower for more buttery smoothness
      smoothWheel: true,
      syncTouch: true,
      infinite: false,
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

// Scroll to top on route change using Lenis for smoothness
import { useLocation } from "react-router-dom";
const ScrollToTop = () => {
  const location = useLocation();
  const lenis = useContext(LenisContext);

  useEffect(() => {
    // Add a small delay to allow new page content to render before scrolling
    const timeout = setTimeout(() => {
      if (lenis) {
        lenis.scrollTo(0, { immediate: false, duration: 1.2, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 80);
    return () => clearTimeout(timeout);
  }, [location, lenis]);
  return null;
};

const App = () => (
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
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Analytics />
      </SmoothScroll>
    </TooltipProvider>
  </ErrorBoundary>
);

export default App;