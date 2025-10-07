import { useEffect, createContext, useRef as useReactRef } from "react";
import Lenis from '@studio-freight/lenis';

const LenisContext = createContext<Lenis | null>(null);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
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

export { LenisContext };