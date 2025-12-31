"use client";

import { useEffect, createContext, useRef as useReactRef, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Lenis only on client
const LenisContext = createContext<any | null>(null);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  const lenisRef = useReactRef<any | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Only load Lenis on client
    if (typeof window === 'undefined') return;
    
    let lenis: any = null;
    let animationId: number;

    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({
        lerp: 0.35,
        duration: 0.6,
        smoothWheel: true,
        wheelMultiplier: 1.2,
        touchMultiplier: 2.0,
        syncTouch: true,
        infinite: false,
        easing: (t: number) => 1 - Math.pow(1 - t, 3)
      });
      lenisRef.current = lenis;

      function raf(time: number) {
        lenis.raf(time);
        animationId = requestAnimationFrame(raf);
      }

      animationId = requestAnimationFrame(raf);
    });

    return () => {
      if (lenis) {
        lenis.destroy();
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
};

export { LenisContext };