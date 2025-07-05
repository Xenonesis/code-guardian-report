import React from 'react';
import { CheckCircle, AlertTriangle, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResults } from '@/hooks/useAnalysis';

interface SecurityRecommendationsProps {
  results: AnalysisResults;
  className?: string;
}

export const SecurityRecommendations: React.FC<SecurityRecommendationsProps> = ({ 
  results, 
  className = '' 
}) => {
  const recommendations = [];

  // Critical issues recommendation
  if (results.summary.criticalIssues > 0) {
    recommendations.push({
      type: 'critical',
      icon: AlertTriangle,
      title: `Address ${results.summary.criticalIssues} critical security issues immediately`,
      description: 'These issues pose immediate security risks and should be fixed as soon as possible.',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800 dark:text-red-200',
      descColor: 'text-red-600 dark:text-red-400'
    });
  }

  // Security score recommendation
  if (results.summary.securityScore < 70) {
    recommendations.push({
      type: 'security',
      icon: Shield,
      title: 'Improve security score to at least 70',
      description: 'Focus on high and medium severity issues to improve overall security posture.',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800 dark:text-yellow-200',
      descColor: 'text-yellow-600 dark:text-yellow-400'
    });
  }

  // Dependencies recommendation
  if (results.dependencies && results.dependencies.vulnerable > 0) {
    recommendations.push({
      type: 'dependencies',
      icon: Zap,
      title: `Update ${results.dependencies.vulnerable} vulnerable dependencies`,
      description: 'Outdated dependencies may contain known security vulnerabilities.',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600',
      titleColor: 'text-orange-800 dark:text-orange-200',
      descColor: 'text-orange-600 dark:text-orange-400'
    });
  }

  // Positive recommendation
  if (results.summary.securityScore >= 80 && results.summary.criticalIssues === 0) {
    recommendations.push({
      type: 'excellent',
      icon: CheckCircle,
      title: 'Excellent security posture!',
      description: 'Your code demonstrates good security practices. Continue monitoring for new issues.',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800 dark:text-green-200',
      descColor: 'text-green-600 dark:text-green-400'
    });
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Security Recommendations
        </CardTitle>
        <CardDescription>
          Priority actions to improve your security posture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className={`flex items-start gap-3 p-3 ${rec.bgColor} rounded-lg`}>
              <rec.icon className={`h-5 w-5 ${rec.iconColor} mt-0.5`} />
              <div>
                <p className={`font-medium ${rec.titleColor}`}>
                  {rec.title}
                </p>
                <p className={`text-sm ${rec.descColor}`}>
                  {rec.description}
                </p>
              </div>
            </div>
          ))}
          
          {recommendations.length === 0 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  No immediate recommendations
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Your code appears to be in good shape. Continue following security best practices.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
