import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  GitBranch, 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Star,
  GitFork,
  Clock,
  Plus,
  TrendingUp
} from 'lucide-react';
import { GitHubAnalysisStorageService } from '@/services/storage/GitHubAnalysisStorageService';
import { githubRepositoryService } from '@/services/githubRepositoryService';
import { EnhancedAnalysisEngine } from '@/services/enhancedAnalysisEngine';
import { toast } from 'sonner';

import { logger } from '@/utils/logger';
interface Repository {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  url: string;
  lastAnalyzed: Date;
  securityScore: number;
  issuesFound: number;
  criticalIssues: number;
  language: string;
  stars: number;
  forks: number;
}

interface RepositoryAnalysisGridProps {
  userId: string;
}

export const RepositoryAnalysisGrid: React.FC<RepositoryAnalysisGridProps> = ({ userId }) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'recent'>('all');
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingRepoId, setAnalyzingRepoId] = useState<string | null>(null);

  useEffect(() => {
    loadRepositories();
  }, [userId]);

  const loadRepositories = async () => {
    setLoading(true);
    try {
      const storageService = new GitHubAnalysisStorageService();
      const repos = await storageService.getUserRepositories(userId);
      setRepositories(repos);
    } catch (error) {
      logger.error('Error loading repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeNewRepo = async () => {
    if (!repoUrl.trim()) {
      toast.error('Please enter a GitHub repository URL');
      return;
    }

    // Validate URL format
    if (!repoUrl.startsWith('https://github.com/')) {
      toast.error('Please enter a valid GitHub URL (https://github.com/owner/repo)');
      return;
    }

    setIsAnalyzing(true);
    const progressToastId = toast.loading('Preparing to analyze repository...');

    try {
      const repoInfo = githubRepositoryService.parseGitHubUrl(repoUrl);
      if (!repoInfo) {
        throw new Error('Invalid GitHub repository URL');
      }

      // Get default branch if not specified
      let branch = repoInfo.branch;
      if (!branch) {
        try {
          toast.loading('Checking repository details...', { id: progressToastId });
          const details = await githubRepositoryService.getRepositoryInfo(repoInfo.owner, repoInfo.repo);
          branch = details.defaultBranch;
        } catch {
          branch = 'main';
        }
      }

      // Download repository as ZIP
      let lastUpdate = 0;
      let lastMessage = '';
      const zipFile = await githubRepositoryService.downloadRepositoryAsZip(
        repoInfo.owner,
        repoInfo.repo,
        branch || 'main',
        (progress, message) => {
          const now = Date.now();
          if ((now - lastUpdate > 500 || progress === 100) && message !== lastMessage) {
            lastMessage = message;
            lastUpdate = now;
            setTimeout(() => toast.loading(message, { id: progressToastId }), 0);
          }
        }
      );

      toast.loading('Analyzing code...', { id: progressToastId });

      // Analyze the repository
      const analysisEngine = new EnhancedAnalysisEngine();
      const results = await analysisEngine.analyzeCodebase(zipFile);

      toast.loading('Saving analysis results...', { id: progressToastId });

      // Store analysis results
      const storageService = new GitHubAnalysisStorageService();
      await storageService.storeRepositoryAnalysis(userId, {
        name: repoInfo.repo,
        fullName: `${repoInfo.owner}/${repoInfo.repo}`,
        description: `Analysis of ${repoInfo.owner}/${repoInfo.repo}`,
        url: repoUrl,
        securityScore: results.summary.securityScore / 10,
        issuesFound: results.issues.length,
        criticalIssues: results.summary.criticalIssues,
        language: typeof results.languageDetection?.primaryLanguage === 'string' 
          ? results.languageDetection.primaryLanguage 
          : results.languageDetection?.primaryLanguage?.name || 'Unknown',
        stars: 0,
        forks: 0,
        duration: parseFloat(results.analysisTime) || 0
      });

      toast.success(`Analysis complete! Found ${results.issues.length} issues.`, { 
        id: progressToastId,
        duration: 4000 
      });

      // Clear input and reload repositories
      setRepoUrl('');
      await loadRepositories();

    } catch (error: any) {
      toast.error(`Analysis failed: ${error.message}`, { id: progressToastId });
      logger.error('Repository analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReanalyze = async (repo: Repository) => {
    setAnalyzingRepoId(repo.id);
    const progressToastId = toast.loading(`Re-analyzing ${repo.name}...`);

    try {
      const repoInfo = githubRepositoryService.parseGitHubUrl(repo.url);
      if (!repoInfo) {
        throw new Error('Invalid repository URL');
      }

      // Get default branch
      let branch = 'main';
      try {
        const details = await githubRepositoryService.getRepositoryInfo(repoInfo.owner, repoInfo.repo);
        branch = details.defaultBranch;
      } catch {
        // Keep default
      }

      // Download and analyze
      const zipFile = await githubRepositoryService.downloadRepositoryAsZip(
        repoInfo.owner,
        repoInfo.repo,
        branch,
        (progress, message) => {
          if (progress === 100 || progress % 25 === 0) {
            toast.loading(message, { id: progressToastId });
          }
        }
      );

      toast.loading('Analyzing code...', { id: progressToastId });

      const analysisEngine = new EnhancedAnalysisEngine();
      const results = await analysisEngine.analyzeCodebase(zipFile);

      // Store updated results
      const storageService = new GitHubAnalysisStorageService();
      await storageService.storeRepositoryAnalysis(userId, {
        name: repo.name,
        fullName: repo.fullName,
        description: repo.description,
        url: repo.url,
        securityScore: results.summary.securityScore / 10,
        issuesFound: results.issues.length,
        criticalIssues: results.summary.criticalIssues,
        language: typeof results.languageDetection?.primaryLanguage === 'string' 
          ? results.languageDetection.primaryLanguage 
          : results.languageDetection?.primaryLanguage?.name || repo.language,
        stars: repo.stars,
        forks: repo.forks,
        duration: parseFloat(results.analysisTime) || 0
      });

      toast.success(`Re-analysis complete! Found ${results.issues.length} issues.`, { 
        id: progressToastId,
        duration: 4000 
      });

      await loadRepositories();

    } catch (error: any) {
      toast.error(`Re-analysis failed: ${error.message}`, { id: progressToastId });
      logger.error('Repository re-analysis failed:', error);
    } finally {
      setAnalyzingRepoId(null);
    }
  };

  const getSecurityBadge = (score: number) => {
    if (score >= 8) {
      return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Excellent</Badge>;
    } else if (score >= 6) {
      return <Badge className="bg-yellow-500 text-white"><AlertTriangle className="w-3 h-3 mr-1" />Good</Badge>;
    } else {
      return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Needs Attention</Badge>;
    }
  };

  const filteredRepositories = repositories.filter(repo => {
    if (filter === 'critical') return repo.criticalIssues > 0;
    if (filter === 'recent') {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return repo.lastAnalyzed > dayAgo;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-56 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
              <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-8 w-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* New Repository Input */}
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border-2 border-purple-200 dark:border-purple-800/50">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-purple-600" />
          Analyze New Repository
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="url"
              placeholder="https://github.com/owner/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isAnalyzing && handleAnalyzeNewRepo()}
              disabled={isAnalyzing}
              className="pl-10 h-12 text-base border-2 focus:border-purple-500"
            />
          </div>
          <Button
            onClick={handleAnalyzeNewRepo}
            disabled={isAnalyzing || !repoUrl.trim()}
            className="h-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Enter a public GitHub repository URL to analyze its security
        </p>
      </Card>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All Repositories ({repositories.length})
        </Button>
        <Button
          variant={filter === 'critical' ? 'default' : 'outline'}
          onClick={() => setFilter('critical')}
          size="sm"
        >
          Critical Issues ({repositories.filter(r => r.criticalIssues > 0).length})
        </Button>
        <Button
          variant={filter === 'recent' ? 'default' : 'outline'}
          onClick={() => setFilter('recent')}
          size="sm"
        >
          Recently Analyzed
        </Button>
      </div>

      {/* Repository Grid */}
      {filteredRepositories.length === 0 ? (
        <Card className="p-12 text-center">
          <GitBranch className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No repositories analyzed yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Analyze your first GitHub repository to see it here.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepositories.map((repo) => (
            <Card key={repo.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
              {/* Repository Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1 truncate">
                    {repo.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                    {repo.fullName}
                  </p>
                </div>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Description */}
              {repo.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                  {repo.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {repo.stars}
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="w-3 h-3" />
                  {repo.forks}
                </div>
                <Badge variant="outline">{repo.language}</Badge>
              </div>

              {/* Security Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Security Score</span>
                  {getSecurityBadge(repo.securityScore)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Issues Found</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {repo.issuesFound}
                  </span>
                </div>

                {repo.criticalIssues > 0 && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {repo.criticalIssues} Critical
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Clock className="w-3 h-3" />
                  Last analyzed {new Date(repo.lastAnalyzed).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.open(repo.url, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View on GitHub
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleReanalyze(repo)}
                  disabled={analyzingRepoId === repo.id}
                >
                  <RefreshCw className={`w-3 h-3 ${analyzingRepoId === repo.id ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
