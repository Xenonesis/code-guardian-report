import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';

interface RiskMetrics {
  overallRisk: number;
  criticalIssues: number;
  securityIssues: number;
  technicalDebt: number;
}

interface RiskAssessmentProps {
  metrics: RiskMetrics;
}

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-600" />
            Risk Assessment
          </CardTitle>
          <CardDescription>Overall project risk evaluation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {metrics.overallRisk}%
              </div>
              <p className="text-slate-600 dark:text-slate-400">Overall Risk Score</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Critical Issues</span>
                <Badge variant="destructive">{metrics.criticalIssues}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Security Issues</span>
                <Badge variant="destructive">{metrics.securityIssues}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Technical Debt</span>
                <Badge variant="secondary">{metrics.technicalDebt}%</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Risk Mitigation</CardTitle>
          <CardDescription>Recommended actions to reduce risk</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-medium text-red-800 dark:text-red-200">High Priority</h4>
              <p className="text-sm text-red-600 dark:text-red-400">
                Address {metrics.criticalIssues} critical issues immediately
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-medium text-amber-800 dark:text-amber-200">Medium Priority</h4>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Review {metrics.securityIssues} security vulnerabilities
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Low Priority</h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Improve code quality and reduce technical debt
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};