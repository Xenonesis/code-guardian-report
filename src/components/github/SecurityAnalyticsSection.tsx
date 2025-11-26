import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Shield, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { GitHubAnalysisStorageService } from '@/services/storage/GitHubAnalysisStorageService';

import { logger } from '@/utils/logger';
interface SecurityTrend {
  date: string;
  score: number;
  issues: number;
}

interface SecurityAnalyticsSectionProps {
  userId: string;
  detailed?: boolean;
}

export const SecurityAnalyticsSection: React.FC<SecurityAnalyticsSectionProps> = ({ 
  userId, 
  detailed = false 
}) => {
  const [trends, setTrends] = useState<SecurityTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageScore: 0,
    totalIssues: 0,
    criticalIssues: 0,
    trend: 'up' as 'up' | 'down' | 'stable'
  });

  useEffect(() => {
    loadSecurityAnalytics();
  }, [userId]);

  const loadSecurityAnalytics = async () => {
    setLoading(true);
    try {
      const storageService = new GitHubAnalysisStorageService();
      const data = await storageService.getSecurityTrends(userId);
      setTrends(data.trends);
      setStats(data.stats);
    } catch (error) {
      logger.error('Error loading security analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Shield className="w-8 h-8 animate-pulse text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Security Analytics
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Track your security posture over time
        </p>
      </div>

      {/* Stats Cards - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            {stats.trend === 'up' && <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />}
            {stats.trend === 'down' && <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />}
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {stats.averageScore.toFixed(1)}
          </div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Average Security Score
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {stats.totalIssues.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Total Issues Found
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {stats.criticalIssues.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Critical Issues
          </div>
        </Card>

        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {trends.length.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Analyses Completed
          </div>
        </Card>
      </div>

      {/* Trend Chart - Simplified visualization */}
      {detailed && trends.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Security Score Trend
          </h3>
          <div className="space-y-3">
            {trends.slice(0, 10).map((trend, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-slate-600 dark:text-slate-400">
                  {new Date(trend.date).toLocaleDateString()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          trend.score >= 8 ? 'bg-green-500' : 
                          trend.score >= 6 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${(trend.score / 10) * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm font-semibold text-slate-900 dark:text-white">
                      {trend.score.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="w-20 text-sm text-slate-600 dark:text-slate-400 text-right">
                  {trend.issues} issues
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
