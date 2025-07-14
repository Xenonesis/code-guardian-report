import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle, Target, TrendingUp, Key } from 'lucide-react';
import { AnalysisResults } from '@/hooks/useAnalysis';

interface SecuritySummaryCardsProps {
  results: AnalysisResults;
}

export const SecuritySummaryCards: React.FC<SecuritySummaryCardsProps> = ({ results }) => {
  // Calculate secret detection metrics
  const secretIssues = results.issues.filter(issue => issue.category === 'Secret Detection' || issue.type === 'Secret');
  const criticalSecrets = secretIssues.filter(s => s.severity === 'Critical').length;
  const highSecrets = secretIssues.filter(s => s.severity === 'High').length;

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-4 md:gap-6">
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200 truncate">
                {results.summary.securityScore}
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400 truncate">Security Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800 hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-red-800 dark:text-red-200 truncate">
                {results.summary.criticalIssues + results.summary.highIssues}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 truncate">Critical & High</p>
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

      <Card className={`bg-gradient-to-br ${secretIssues.length > 0
        ? 'from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800'
        : 'from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${secretIssues.length > 0 ? 'bg-orange-500' : 'bg-green-500'}`}>
              <Key className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${secretIssues.length > 0
                ? 'text-orange-800 dark:text-orange-200'
                : 'text-green-800 dark:text-green-200'
              }`}>
                {secretIssues.length}
              </p>
              <p className={`text-sm ${secretIssues.length > 0
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-green-600 dark:text-green-400'
              }`}>
                Secrets Found
              </p>
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