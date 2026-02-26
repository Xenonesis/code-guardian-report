import React, { useEffect, useRef, useState, useMemo } from "react";
import { getTotalFilesAnalyzed } from "@/services/analysisTracker";
import { Users, FileCode, Shield, Award, Activity } from "lucide-react";

interface Stat {
  id: string;
  icon: React.ReactNode;
  label: string;
  targetValue: number; // Numeric target for calculation
  displaySuffix: string; // e.g. "+" or "M"
  format: (n: number) => string;
}

interface StatsGridProps {
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ className = "" }) => {
  const [animatedValues, setAnimatedValues] = useState<string[]>([
    "0",
    "0",
    "0",
    "0",
  ]);
  const gridRef = useRef<HTMLDivElement>(null);

  const stats: Stat[] = useMemo(() => {
    const totalFiles = getTotalFilesAnalyzed();
    return [
      {
        id: "CLIENTS",
        icon: <Users className="h-4 w-4" />,
        label: "ENTERPRISE_NODES",
        targetValue: 25000,
        displaySuffix: "+",
        format: (n: number) => Math.floor(n).toLocaleString(),
      },
      {
        id: "FILES",
        icon: <FileCode className="h-4 w-4" />,
        label: "ARTIFACTS_SCANNED",
        targetValue: totalFiles || 1200000,
        displaySuffix: "",
        format: (n: number) => Math.floor(n).toLocaleString(),
      },
      {
        id: "ISSUES",
        icon: <Shield className="h-4 w-4" />,
        label: "THREATS_NEUTRALIZED",
        targetValue: 150000,
        displaySuffix: "+",
        format: (n: number) => Math.floor(n).toLocaleString(),
      },
      {
        id: "LANGS",
        icon: <Award className="h-4 w-4" />,
        label: "SYNTAX_SUPPORT",
        targetValue: 20,
        displaySuffix: "+",
        format: (n: number) => Math.floor(n).toString(),
      },
    ];
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stats.forEach((stat, index) => {
              let current = 0;
              // Randomized start for glitch effect
              const step = stat.targetValue / 50;

              const timer = setInterval(() => {
                current += step;
                // Randomize slightly during count up
                const noise = Math.random() * (step * 0.5);
                const val = Math.min(stat.targetValue, current + noise);

                if (current >= stat.targetValue) {
                  clearInterval(timer);
                  // Final set to exact value
                  setAnimatedValues((prev) => {
                    const newValues = [...prev];
                    newValues[index] =
                      stat.format(stat.targetValue) + stat.displaySuffix;
                    return newValues;
                  });
                } else {
                  setAnimatedValues((prev) => {
                    const newValues = [...prev];
                    newValues[index] = stat.format(val) + stat.displaySuffix;
                    return newValues;
                  });
                }
              }, 30);
            });
            observer.disconnect(); // Only animate once
          }
        });
      },
      { threshold: 0.2 }
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }
    return () => observer.disconnect();
  }, [stats]);

  return (
    <div
      ref={gridRef}
      className={`grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6 ${className}`}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="group border-primary/20 bg-background/50 hover:border-primary/50 relative flex flex-col items-start border p-3 transition-colors sm:p-6"
        >
          {/* Corner markers */}
          <div className="border-primary/50 absolute top-0 left-0 h-2 w-2 border-t border-l" />
          <div className="border-primary/50 absolute top-0 right-0 h-2 w-2 border-t border-r" />
          <div className="border-primary/50 absolute bottom-0 left-0 h-2 w-2 border-b border-l" />
          <div className="border-primary/50 absolute right-0 bottom-0 h-2 w-2 border-r border-b" />

          {/* Header */}
          <div className="border-primary/10 mb-4 flex w-full items-center gap-2 border-b pb-2">
            <span className="bg-primary/10 text-primary p-1.5">
              {stat.icon}
            </span>
            <span className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
              ID: {stat.id}_0{index + 1}
            </span>
            <Activity className="text-primary/40 ml-auto h-3 w-3 animate-pulse" />
          </div>

          {/* Value */}
          <div className="text-foreground mb-1 font-mono text-xl font-bold tracking-tighter tabular-nums sm:text-2xl md:text-3xl lg:text-4xl">
            {animatedValues[index]}
          </div>

          {/* Label */}
          <div className="text-primary/70 font-mono text-xs tracking-widest uppercase">
            {stat.label}
          </div>

          {/* Scanline hover effect */}
          <div className="bg-primary/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="bg-primary absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-700 ease-out group-hover:w-full" />
        </div>
      ))}
    </div>
  );
};
