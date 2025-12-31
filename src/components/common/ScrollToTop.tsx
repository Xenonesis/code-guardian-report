"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScrollToTopProps {
  className?: string;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({ className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button only when user scrolls down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll smoothly to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null; 

  return (
    <Button
      onClick={scrollToTop}
      variant="ghost"
      size="sm"
      className={`fixed bottom-6 right-6 z-50 group p-3 rounded-full 
        bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white 
        transition-all duration-300 border border-slate-700/50 
        hover:border-slate-600/50 hover:scale-110 ${className}`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5 group-hover:-translate-y-1 transition-transform duration-300" />
    </Button>
  );
};
