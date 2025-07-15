import React, { useEffect, useRef, useState, useMemo } from 'react';
import { getTotalFilesAnalyzed } from '@/services/analysisTracker';
import { Users, FileCode, Shield, Award } from 'lucide-react';

interface Stat {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface StatsGridProps {
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ className = '' }) => {
  const [animatedValues, setAnimatedValues] = useState<string[]>(['0', '0', '0', '0']);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const stats: Stat[] = useMemo(() => {
    const totalFiles = getTotalFilesAnalyzed();
    return [
      { icon: <Users className="h-5 w-5" />, label: 'Enterprise Clients', value: '25,000+' },
      {
        icon: <FileCode className="h-5 w-5" />,
        label: 'Code Files Analyzed',
        value: totalFiles.toLocaleString()
      },
      { icon: <Shield className="h-5 w-5" />, label: 'Security Issues Detected', value: '150,000+' },
      { icon: <Award className="h-5 w-5" />, label: 'Programming Languages', value: '20+' }
    ];
  }, []);

  // Initialize animated values after component mounts
  useEffect(() => {
    setAnimatedValues([
      '25000',
      getTotalFilesAnalyzed().toString(),
      '150000',
      '20'
    ]);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stats.forEach((stat, index) => {
              const targetValue = parseFloat(stat.value.replace(/,/g, ''));
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
    <div ref={gridRef} className={`grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="stat-card-enhanced glass-card-ultra enhanced-card-hover glow-on-hover relative overflow-hidden p-6 lg:p-8 group"
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        >
          {/* Enhanced Gradient Border Effect */}
          <div className="animated-border absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          {/* Multiple Floating Orbs for Depth */}
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 float-animation"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-emerald-500/25 to-teal-500/25 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 float-animation delay-2s"></div>

          {/* Particle System */}
          <div className="particle-system opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="particle" style={{ left: '20%', animationDelay: '0s' }}></div>
            <div className="particle" style={{ left: '80%', animationDelay: '2s' }}></div>
          </div>

          <div className="relative z-10 text-center">
            {/* Enhanced Icon Container */}
            <div className="flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
              <div className="p-4 bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-pink-500/15 rounded-2xl group-hover:from-blue-500/30 group-hover:via-purple-500/20 group-hover:to-pink-500/30 transition-all duration-700 shadow-lg group-hover:shadow-xl">
                <div className="text-lg">
                  {stat.icon}
                </div>
              </div>
            </div>

            {/* Enhanced Value Display */}
            <div className="text-4xl lg:text-5xl font-bold mb-3 gradient-text-animated group-hover:scale-110 transition-transform duration-500">
              {animatedValues[index]}
            </div>

            {/* Enhanced Label */}
            <div className="text-sm lg:text-base font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors duration-300 tracking-wide">
              {stat.label}
            </div>
          </div>

          {/* Shimmer Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
