
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
import { AuthProvider } from "./lib/auth-context";
// Lenis smooth scroll initialization with context for global access
import { createContext, useContext, useRef as useReactRef } from "react";
import  UserDashboard  from "./components/user-dashboard";

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

// Scroll to top on route change using Lenis for smoothness
import { useLocation } from "react-router-dom";
const ScrollToTop = () => {
  const location = useLocation();
  const lenis = useContext(LenisContext);

  useEffect(() => {
    // Use requestIdleCallback for optimal scroll timing
    const idle = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 1));
    const handle = idle(() => {
      if (lenis) {
        lenis.scrollTo(0, { immediate: false, duration: 0.7, easing: (t: number) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
    return () => {
      if ((window as any).cancelIdleCallback) (window as any).cancelIdleCallback(handle);
      else clearTimeout(handle);
    };
  }, [location, lenis]);
  return null;
};

const App = () => (
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
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
            <Route path='/dashboard' element={<UserDashboard/>} />
          </Routes>
        </BrowserRouter>
        <Analytics />
      </SmoothScroll>
    </TooltipProvider>
  </ErrorBoundary>
</AuthProvider>
);

export default App;