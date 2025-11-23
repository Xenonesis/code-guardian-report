import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  GitBranch, 
  Search, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Filter
} from 'lucide-react';
import { GitHubAnalysisStorageService } from '@/services/storage/GitHubAnalysisStorageService';

import { logger } from '@/utils/logger';
interface AnalysisRecord {
  id: string;
  repositoryName: string;
  repositoryUrl: string;
  analyzedAt: Date;
  duration: number;
  issuesFound: number;
  criticalIssues: number;
  securityScore: number;
  language: string;
}

interface AnalysisHistorySectionProps {
  userId: string;
}

export const AnalysisHistorySection: React.FC<AnalysisHistorySectionProps> = ({ userId }) => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  useEffect(() => {
    loadAnalysisHistory();
  }, [userId]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredAnalyses(
        analyses.filter(a => 
          a.repositoryName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredAnalyses(analyses);
    }
  }, [searchQuery, analyses]);

  const loadAnalysisHistory = async () => {
    setLoading(true);
    try {
      const storageService = new GitHubAnalysisStorageService();
      const history = await storageService.getAnalysisHistory(userId);
      setAnalyses(history);
      setFilteredAnalyses(history);
    } catch (error) {
      logger.error('Error loading analysis history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8) {
      return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Excellent</Badge>;
    } else if (score >= 6) {
      return <Badge className="bg-yellow-500 text-white"><AlertTriangle className="w-3 h-3 mr-1" />Good</Badge>;
    } else {
      return <Badge className="bg-red-500 text-white"><AlertTriangle className="w-3 h-3 mr-1" />Poor</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Clock className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Analysis History
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            View your past repository security analyses
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            onClick={() => setViewMode('timeline')}
            size="sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Timeline
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            size="sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

          <div className="space-y-8">
            {filteredAnalyses.map((analysis, index) => (
              <div key={analysis.id} className="relative pl-16">
                {/* Timeline Dot */}
                <div className="absolute left-6 top-6 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900"></div>

                <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <GitBranch className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {analysis.repositoryName}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(analysis.analyzedAt).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {formatDuration(analysis.duration)}
                        </div>
                        <Badge variant="outline">{analysis.language}</Badge>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 items-start md:items-end">
                      {getScoreBadge(analysis.securityScore)}
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {analysis.issuesFound}
                          </span> issues
                        </div>
                        {analysis.criticalIssues > 0 && (
                          <div className="text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="font-semibold">{analysis.criticalIssues}</span> critical
                          </div>
                        )}
                      </div>

                      <Button size="sm" variant="outline">
                        View Report
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Repository
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Issues
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                {filteredAnalyses.map((analysis) => (
                  <tr key={analysis.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <GitBranch className="w-4 h-4 text-slate-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {analysis.repositoryName}
                          </div>
                          <div className="text-xs text-slate-500">{analysis.language}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {new Date(analysis.analyzedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getScoreBadge(analysis.securityScore)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {analysis.issuesFound}
                        </span>
                        {analysis.criticalIssues > 0 && (
                          <span className="text-red-600 dark:text-red-400 ml-2">
                            ({analysis.criticalIssues} critical)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {filteredAnalyses.length === 0 && (
        <Card className="p-12 text-center">
          <Clock className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {searchQuery ? 'No results found' : 'No analysis history yet'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {searchQuery 
              ? 'Try a different search term' 
              : 'Your repository analyses will appear here'}
          </p>
        </Card>
      )}
    </div>
  );
};
