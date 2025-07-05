import React, { useEffect, useRef, useState, useMemo } from 'react';
import { getTotalFilesAnalyzed } from '@services/analysisTracker';
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
    '10000',
    getTotalFilesAnalyzed().toString(),
    '50000',
    '15'
  ]);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const stats: Stat[] = useMemo(() => [
    { icon: <Users className="h-5 w-5" />, label: 'Developers Trust Us', value: '10,000+' },
    {
      icon: <FileCode className="h-5 w-5" />,
      label: 'Files Analyzed',
      value: getTotalFilesAnalyzed().toLocaleString()
    },
    { icon: <Shield className="h-5 w-5" />, label: 'Vulnerabilities Found', value: '50,000+' },
    { icon: <Award className="h-5 w-5" />, label: 'Languages Supported', value: '15+' }
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
    <div ref={gridRef} className={`grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-4xl mx-auto ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="modern-card text-center p-4 lg:p-6 group hover-float-subtle hover-glow cursor-pointer"
        >
          <div className="flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform hover-bounce">
            {stat.icon}
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {animatedValues[index]}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};
