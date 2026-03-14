"use client";

import { useEffect, createContext, useState } from "react";
import type Lenis from "lenis";

// Dynamically import Lenis only on client
const LenisContext = createContext<Lenis | null>(null);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider = ({
  children,
}: SmoothScrollProviderProps) => {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Only load Lenis on client
    if (typeof window === "undefined") return;

    let lenisInst: Lenis | null = null;
    let animationId: number;

    import("lenis").then(({ default: Lenis }) => {
      lenisInst = new Lenis({
        lerp: 0.35,
        duration: 0.6,
        smoothWheel: true,
        wheelMultiplier: 1.2,
        touchMultiplier: 2.0,
        syncTouch: true,
        infinite: false,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
      });
      setLenis(lenisInst);

      function raf(time: number) {
        lenisInst?.raf(time);
        animationId = requestAnimationFrame(raf);
      }

      animationId = requestAnimationFrame(raf);
    });

    return () => {
      if (lenisInst) {
        lenisInst.destroy();
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
};

export { LenisContext };
