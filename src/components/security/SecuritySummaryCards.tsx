import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { AnalysisResults } from '@/hooks/useAnalysis';

interface SecuritySummaryCardsProps {
  results: AnalysisResults;
}

export const SecuritySummaryCards: React.FC<SecuritySummaryCardsProps> = ({ results }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {results.summary.securityScore}
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400">Security Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                {results.summary.criticalIssues + results.summary.highIssues}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">Critical & High</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {results.metrics.vulnerabilityDensity}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Vuln/1000 Lines</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                {results.summary.qualityScore}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">Quality Score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};