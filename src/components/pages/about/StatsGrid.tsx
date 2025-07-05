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
  const [animatedValues, setAnimatedValues] = useState<string[]>([
    '25000',
    getTotalFilesAnalyzed().toString(),
    '150000',
    '20'
  ]);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const stats: Stat[] = useMemo(() => [
    { icon: <Users className="h-5 w-5" />, label: 'Developers Trust Us', value: '25,000+' },
    {
      icon: <FileCode className="h-5 w-5" />,
      label: 'Files Analyzed',
      value: getTotalFilesAnalyzed().toLocaleString()
    },
    { icon: <Shield className="h-5 w-5" />, label: 'Vulnerabilities Found', value: '150,000+' },
    { icon: <Award className="h-5 w-5" />, label: 'Languages Supported', value: '20+' }
  ], []);

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
    <div ref={gridRef} className={`grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-5xl mx-auto ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="relative overflow-hidden bg-gradient-to-br from-white/90 to-white/70 dark:from-slate-800/90 dark:to-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl p-6 lg:p-8 group hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 cursor-pointer"
          style={{
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10"></div>
          
          {/* Animated background orb */}
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
              <div className="p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-colors duration-500">
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2 group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-500">
              {animatedValues[index]}
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
