import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Activity, GitBranch, Code, Zap, BarChart2 } from 'lucide-react';
import { GitHubAnalysisStorageService } from '@/services/storage/GitHubAnalysisStorageService';
import { logger } from '@/utils/logger';
import { cn } from '@/lib/utils';

interface LanguageDistribution {
  language: string;
  count: number;
  percentage: number;
}

interface RepositoryActivityAnalyticsProps {
  userId: string;
  detailed?: boolean;
}

export const RepositoryActivityAnalytics: React.FC<RepositoryActivityAnalyticsProps> = ({ 
  userId, 
  detailed = false 
}) => {
  const [languageDistribution, setLanguageDistribution] = useState<LanguageDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityStats, setActivityStats] = useState({
    totalAnalyses: 0,
    averageDuration: 0,
    mostAnalyzedRepo: '',
    mostCommonLanguage: ''
  });

  useEffect(() => {
    loadActivityAnalytics();
  }, [userId]);

  const loadActivityAnalytics = async () => {
    setLoading(true);
    try {
      const storageService = new GitHubAnalysisStorageService();
      const data = await storageService.getActivityAnalytics(userId);
      setLanguageDistribution(data.languageDistribution);
      setActivityStats(data.stats);
    } catch (error) {
      logger.error('Error loading activity analytics:', error);
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
              <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse mb-4"></div>
              <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-28 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          Repository Activity
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Insights into your repository analysis patterns and language usage
        </p>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-6 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 group">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
            <BarChart2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
            {activityStats.totalAnalyses.toLocaleString()}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Analyses
          </div>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 group">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
            <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
            {activityStats.averageDuration}s
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Avg. Analysis Time
          </div>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 group">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
            <GitBranch className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mb-1 truncate" title={activityStats.mostAnalyzedRepo}>
            {activityStats.mostAnalyzedRepo || 'N/A'}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Most Analyzed Repo
          </div>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 group">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
            <Code className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mb-1 truncate">
            {activityStats.mostCommonLanguage || 'N/A'}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Most Common Language
          </div>
        </Card>
      </div>

      {/* Language Distribution */}
      {detailed && languageDistribution.length > 0 && (
        <Card className="p-8 border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Code className="w-5 h-5 text-slate-500" />
            Language Distribution
          </h3>
          <div className="space-y-6">
            {languageDistribution.map((lang, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    {lang.language}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {lang.count} repos <span className="text-slate-300 dark:text-slate-600 mx-1">|</span> {lang.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out relative",
                      index === 0 ? "bg-gradient-to-r from-blue-500 to-indigo-600" :
                      index === 1 ? "bg-gradient-to-r from-purple-500 to-pink-600" :
                      index === 2 ? "bg-gradient-to-r from-orange-500 to-red-600" :
                      "bg-gradient-to-r from-slate-500 to-slate-600"
                    )}
                    style={{ width: `${lang.percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
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
