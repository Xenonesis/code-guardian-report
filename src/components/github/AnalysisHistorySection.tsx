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
  Filter,
  ExternalLink,
  X,
  Shield,
  Bug,
  FileCode
} from 'lucide-react';
import { GitHubAnalysisStorageService } from '@/services/storage/GitHubAnalysisStorageService';
import { toast } from 'sonner';

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
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);

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

  const handleViewReport = (analysis: AnalysisRecord) => {
    setSelectedAnalysis(analysis);
    toast.info(`Viewing report for ${analysis.repositoryName}`);
  };

  const handleCloseReport = () => {
    setSelectedAnalysis(null);
  };

  const handleOpenInGitHub = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-4 w-56 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            </Card>
          ))}
        </div>
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

                      <Button size="sm" variant="outline" onClick={() => handleViewReport(analysis)}>
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
                      <Button size="sm" variant="outline" onClick={() => handleViewReport(analysis)}>
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

      {/* Analysis Report Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GitBranch className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedAnalysis.repositoryName}
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={handleCloseReport}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Security Score */}
              <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg">
                <div className={`text-5xl font-bold mb-2 ${
                  selectedAnalysis.securityScore >= 8 ? 'text-green-500' : 
                  selectedAnalysis.securityScore >= 6 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {selectedAnalysis.securityScore.toFixed(1)}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">Security Score (out of 10)</div>
                <div className="mt-3">
                  {getScoreBadge(selectedAnalysis.securityScore)}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                  <Bug className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{selectedAnalysis.issuesFound}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Total Issues</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{selectedAnalysis.criticalIssues}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Critical Issues</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatDuration(selectedAnalysis.duration)}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Duration</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                  <FileCode className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{selectedAnalysis.language}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Language</div>
                </div>
              </div>

              {/* Analysis Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Analysis Details
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Analyzed At</span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {new Date(selectedAnalysis.analyzedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Repository URL</span>
                    <a 
                      href={selectedAnalysis.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      View on GitHub <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Summary</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedAnalysis.criticalIssues > 0 ? (
                    <>
                      ⚠️ This repository has <strong className="text-red-600">{selectedAnalysis.criticalIssues} critical security issues</strong> that 
                      require immediate attention. Review the security vulnerabilities and apply recommended fixes.
                    </>
                  ) : selectedAnalysis.issuesFound > 0 ? (
                    <>
                      This repository has {selectedAnalysis.issuesFound} issues detected. While there are no critical vulnerabilities, 
                      consider addressing the identified issues to improve code quality and security.
                    </>
                  ) : (
                    <>
                      ✅ Excellent! No security issues were detected in this repository. 
                      Continue following security best practices to maintain this status.
                    </>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  className="flex-1" 
                  onClick={() => handleOpenInGitHub(selectedAnalysis.repositoryUrl)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in GitHub
                </Button>
                <Button variant="outline" onClick={handleCloseReport}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
