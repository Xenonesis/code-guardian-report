import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GitBranch, 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Star,
  GitFork,
  Clock
} from 'lucide-react';
import { GitHubAnalysisStorageService } from '@/services/storage/GitHubAnalysisStorageService';

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
      console.error('Error loading repositories:', error);
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                <Button size="sm" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
