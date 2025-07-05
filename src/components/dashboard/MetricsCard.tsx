import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  score?: number;
  className?: string;
  iconClassName?: string;
  valueClassName?: string;
  showProgress?: boolean;
  variant?: 'default' | 'modern' | 'glass' | 'gradient';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  colorScheme?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  score,
  className = '',
  iconClassName = '',
  valueClassName = '',
  showProgress = false,
  variant = 'modern',
  trend,
  trendValue,
  colorScheme = 'blue'
}) => {
  const colorSchemes = {
    blue: {
      icon: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      gradient: 'from-blue-500 to-indigo-500'
    },
    green: {
      icon: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      gradient: 'from-emerald-500 to-teal-500'
    },
    red: {
      icon: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      gradient: 'from-red-500 to-pink-500'
    },
    purple: {
      icon: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      gradient: 'from-purple-500 to-indigo-500'
    },
    orange: {
      icon: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      gradient: 'from-orange-500 to-red-500'
    }
  };

  const colors = colorSchemes[colorScheme];

  return (
    <Card variant={variant} className={cn('group cursor-pointer', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
                {title}
              </p>
              {trend && trendValue && (
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                )}>
                  {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : 
                   trend === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
                  {trendValue}
                </div>
              )}
            </div>
            <p className={cn(
              "text-3xl font-bold mb-1 transition-all duration-300 group-hover:scale-105",
              valueClassName || 'text-slate-900 dark:text-white'
            )}>
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-tight">
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn(
            "flex-shrink-0 p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
            colors.bg
          )}>
            <Icon className={cn('h-6 w-6', colors.icon, iconClassName)} />
          </div>
        </div>
        
        {showProgress && score !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Progress
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {score}%
              </span>
            </div>
            <div className="relative">
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    `bg-gradient-to-r ${colors.gradient}`
                  )}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};