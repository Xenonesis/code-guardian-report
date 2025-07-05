import React from 'react';
import { Code } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface QualityScoreCardProps {
  score: number;
  className?: string;
}

export const QualityScoreCard: React.FC<QualityScoreCardProps> = ({ score, className = '' }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getQualityRating = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
  };

  return (
    <UITooltip>
      <TooltipTrigger asChild>
        <Card className={`${getScoreBgColor(score)} border-0 ring-2 ring-blue-200 dark:ring-blue-800 cursor-help ${className}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Code Quality Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(score)}`}>
                  {Math.round(score)}/100
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {getQualityRating(score)}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Code className={`h-8 w-8 ${getScoreColor(score)}`} />
                <span className="text-xs font-medium mt-1 text-slate-600 dark:text-slate-400">
                  Quality
                </span>
              </div>
            </div>
            <Progress
              value={score}
              className="mt-3 h-3"
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-w-xs">
          <p className="font-semibold">Code Quality Score</p>
          <p className="text-sm mt-1">
            Measures overall code quality based on:
          </p>
          <ul className="text-sm mt-2 space-y-1">
            <li>• Number of issues found</li>
            <li>• Code complexity</li>
            <li>• Maintainability index</li>
            <li>• Best practices adherence</li>
          </ul>
          <p className="text-xs mt-2 text-slate-400">
            Higher scores indicate better code quality
          </p>
        </div>
      </TooltipContent>
    </UITooltip>
  );
};
