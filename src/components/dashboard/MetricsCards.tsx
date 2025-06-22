import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Shield, Bug, Code } from 'lucide-react';

interface MetricsCardsProps {
  totalIssues: number;
  criticalIssues: number;
  securityIssues: number;
  codeQuality: number;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  totalIssues,
  criticalIssues,
  securityIssues,
  codeQuality
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 card-hover">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg sm:text-2xl font-bold text-blue-800 dark:text-blue-200">
                {totalIssues}
              </p>
              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">Total Issues</p>
            </div>
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800 card-hover">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg sm:text-2xl font-bold text-red-800 dark:text-red-200">
                {criticalIssues}
              </p>
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">Critical</p>
            </div>
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800 card-hover">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg sm:text-2xl font-bold text-amber-800 dark:text-amber-200">
                {securityIssues}
              </p>
              <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">Security</p>
            </div>
            <Bug className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600 dark:text-amber-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 card-hover">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg sm:text-2xl font-bold text-green-800 dark:text-green-200">
                {codeQuality}%
              </p>
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">Quality</p>
            </div>
            <Code className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};