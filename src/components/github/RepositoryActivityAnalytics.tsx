import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Activity, GitBranch, Code, Zap } from 'lucide-react';
import { GitHubAnalysisStorageService } from '@/services/storage/GitHubAnalysisStorageService';

import { logger } from '@/utils/logger';
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
      <div className="flex items-center justify-center py-12">
        <Activity className="w-8 h-8 animate-pulse text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Repository Activity
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Insights into your repository analysis patterns
        </p>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg w-fit mb-4">
            <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {activityStats.totalAnalyses}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total Analyses
          </div>
        </Card>

        <Card className="p-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg w-fit mb-4">
            <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {activityStats.averageDuration}s
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Avg. Analysis Time
          </div>
        </Card>

        <Card className="p-6">
          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg w-fit mb-4">
            <GitBranch className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mb-1 truncate">
            {activityStats.mostAnalyzedRepo || 'N/A'}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Most Analyzed Repo
          </div>
        </Card>

        <Card className="p-6">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg w-fit mb-4">
            <Code className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            {activityStats.mostCommonLanguage || 'N/A'}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Most Common Language
          </div>
        </Card>
      </div>

      {/* Language Distribution */}
      {detailed && languageDistribution.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Language Distribution
          </h3>
          <div className="space-y-4">
            {languageDistribution.map((lang, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {lang.language}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {lang.count} repos ({lang.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${lang.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
