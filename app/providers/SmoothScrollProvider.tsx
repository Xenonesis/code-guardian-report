"use client";

import { useEffect, createContext, useRef as useReactRef } from "react";
import type Lenis from "lenis";

// Dynamically import Lenis only on client
const LenisContext = createContext<Lenis | null>(null);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider = ({
  children,
}: SmoothScrollProviderProps) => {
  const lenisRef = useReactRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lenis: Lenis | null = null;
    let animationId = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;
    let cancelled = false;

    let lenisModule: typeof Lenis | null = null;

    const initLenis = async () => {
      try {
        const mod = await import("lenis");
        if (cancelled) return;
        lenisModule = mod.default;

        lenis = new lenisModule({
          lerp: 0.35,
          duration: 0.6,
          smoothWheel: true,
          wheelMultiplier: 1.2,
          touchMultiplier: 2.0,
          syncTouch: true,
          infinite: false,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
        });
        lenisRef.current = lenis;

        const raf = (time: number) => {
          if (cancelled) return;
          lenis?.raf(time);
          animationId = requestAnimationFrame(raf);
        };

        animationId = requestAnimationFrame(raf);
      } catch (e) {
        if (!cancelled) {
          console.warn(
            "[SmoothScroll] Failed to load Lenis, smooth scrolling disabled:",
            e instanceof Error ? e.message : e
          );
        }
      }
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(
        () => {
          void initLenis();
        },
        { timeout: 1000 }
      );
    } else {
      timeoutId = setTimeout(() => {
        void initLenis();
      }, 120);
    }

    return () => {
      cancelled = true;
      if (idleId) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
