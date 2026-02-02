import React, { useEffect, useRef, useState, useMemo } from "react";
import { getTotalFilesAnalyzed } from "@/services/analysisTracker";
import { Users, FileCode, Shield, Award } from "lucide-react";

interface Stat {
  icon: React.ReactNode;
  label: string;
  value: string;
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
        icon: <Users className="h-5 w-5" />,
        label: "Enterprise Clients",
        value: "25,000+",
      },
      {
        icon: <FileCode className="h-5 w-5" />,
        label: "Code Files Analyzed",
        value: totalFiles.toLocaleString(),
      },
      {
        icon: <Shield className="h-5 w-5" />,
        label: "Security Issues Detected",
        value: "150,000+",
      },
      {
        icon: <Award className="h-5 w-5" />,
        label: "Programming Languages",
        value: "20+",
      },
    ];
  }, []);

  // Initialize animated values after component mounts
  useEffect(() => {
    setAnimatedValues([
      "25000",
      getTotalFilesAnalyzed().toString(),
      "150000",
      "20",
    ]);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stats.forEach((stat, index) => {
              const targetValue = parseFloat(stat.value.replace(/,/g, ""));
              let current = 0;
              const increment = targetValue / 100;

              const timer = setInterval(() => {
                current += increment;
                if (current >= targetValue) {
                  current = targetValue;
                  clearInterval(timer);
                }

                setAnimatedValues((prev) => {
                  const newValues = [...prev];
                  newValues[index] = Math.floor(current).toLocaleString();
                  return newValues;
                });
              }, 20);
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    const currentGrid = gridRef.current;
    if (currentGrid) {
      observer.observe(currentGrid);
    }

    return () => {
      if (currentGrid) {
        observer.unobserve(currentGrid);
      }
    };
  }, [stats]);

  return (
    <div
      ref={gridRef}
      className={`mx-auto grid max-w-6xl grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8 ${className}`}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="stat-card-enhanced enhanced-card-hover glow-on-hover group relative overflow-hidden rounded-xl border border-slate-200/50 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-slate-300/50 lg:p-8 dark:border-slate-700/50 dark:bg-slate-900/90"
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          {/* Enhanced Gradient Border Effect */}
          <div className="animated-border absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"></div>

          {/* Multiple Floating Orbs for Depth */}
          <div className="float-animation absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/30 blur-2xl transition-transform duration-700 group-hover:scale-150"></div>
          <div className="float-animation delay-2s absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500/25 to-teal-500/25 blur-xl transition-transform duration-500 group-hover:scale-125"></div>

          {/* Particle System */}
          <div className="particle-system opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div
              className="particle"
              style={{ left: "20%", animationDelay: "0s" }}
            ></div>
            <div
              className="particle"
              style={{ left: "80%", animationDelay: "2s" }}
            ></div>
          </div>

          <div className="relative z-10 text-center">
            {/* Enhanced Icon Container */}
            <div className="mb-6 flex items-center justify-center text-blue-600 transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 dark:text-blue-400">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-pink-500/15 p-4 shadow-lg transition-all duration-700 group-hover:from-blue-500/30 group-hover:via-purple-500/20 group-hover:to-pink-500/30 group-hover:shadow-xl">
                <div className="text-lg">{stat.icon}</div>
              </div>
            </div>

            {/* Enhanced Value Display */}
            <div className="gradient-text-animated mb-3 text-4xl font-bold transition-transform duration-500 group-hover:scale-110 lg:text-5xl">
              {animatedValues[index]}
            </div>

            {/* Enhanced Label */}
            <div className="text-sm font-semibold tracking-wide text-slate-700 transition-colors duration-300 group-hover:text-slate-800 lg:text-base dark:text-slate-300 dark:group-hover:text-slate-200">
              {stat.label}
            </div>
          </div>

          {/* Shimmer Effect */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute inset-0 translate-x-[-100%] -skew-x-12 transform bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[200%]"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
