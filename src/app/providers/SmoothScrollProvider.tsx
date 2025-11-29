import { useEffect, createContext, useRef as useReactRef } from "react";
import Lenis from 'lenis';

const LenisContext = createContext<Lenis | null>(null);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  const lenisRef = useReactRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.35, // Much higher lerp for faster response (0.35 = snappy, 0.1 = slow)
      duration: 0.6, // Faster animation duration
      smoothWheel: true,
      wheelMultiplier: 1.2, // Increase wheel scroll speed
      touchMultiplier: 2.0, // Faster touch scrolling on mobile
      syncTouch: true,
      infinite: false,
      easing: (t: number) => 1 - Math.pow(1 - t, 3) // easeOutCubic - fast start, smooth end
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

export { LenisContext };