import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LucideIcon } from 'lucide-react';

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
  showProgress = false
}) => {
  return (
    <Card className={`border-0 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
            <p className={`text-2xl font-bold ${valueClassName}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${iconClassName}`} />
        </div>
        {showProgress && score !== undefined && (
          <Progress 
            value={score} 
            className="mt-2 h-2"
          />
        )}
      </CardContent>
    </Card>
  );
};
