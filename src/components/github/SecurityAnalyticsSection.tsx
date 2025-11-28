import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Shield, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { GitHubAnalysisStorageService } from '@/services/storage/GitHubAnalysisStorageService';
import { logger } from '@/utils/logger';
import { cn } from '@/lib/utils';

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
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6 border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                <div className="h-4 w-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-28 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
            </Card>
          ))}
        </div>
        {detailed && (
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <div className="h-6 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-24 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                  <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse"></div>
                  <div className="w-12 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Security Analytics
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Comprehensive overview of your security posture and trends
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-6 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            {stats.trend === 'up' ? (
              <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2.4%
              </div>
            ) : (
              <div className="flex items-center text-red-600 text-sm font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                <TrendingDown className="w-3 h-3 mr-1" />
                -1.2%
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
            {stats.averageScore.toFixed(1)}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Average Security Score
          </div>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
            {stats.totalIssues.toLocaleString()}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Issues Found
          </div>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
            {stats.criticalIssues.toLocaleString()}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Critical Issues
          </div>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
            {trends.length.toLocaleString()}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Analyses Completed
          </div>
        </Card>
      </div>

      {/* Trend Chart */}
      {detailed && trends.length > 0 && (
        <Card className="p-8 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Security Score Trend
              </h3>
              <p className="text-sm text-slate-500">
                Historical performance of your repository security scores
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div> Excellent
              </div>
              <div className="flex items-center text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div> Good
              </div>
              <div className="flex items-center text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div> Poor
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {trends.slice(0, 10).map((trend, index) => (
              <div key={index} className="group">
                <div className="flex items-end justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {new Date(trend.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-slate-500">
                    {trend.issues} issues found
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 ease-out relative",
                        trend.score >= 8 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 
                        trend.score >= 6 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : 
                        'bg-gradient-to-r from-red-500 to-rose-400'
                      )}
                      style={{ width: `${(trend.score / 10) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
                    </div>
                  </div>
                  <div className="w-12 text-right font-bold text-slate-900 dark:text-white">
                    {trend.score.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
