// components/github/GitHubRepositoryList.tsx
import React, { useState } from 'react';
import { Github, Star, GitFork, AlertCircle, CheckCircle, ExternalLink, TrendingUp } from 'lucide-react';
import { logger } from '@/utils/logger';

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  private: boolean;
}

interface GitHubRepositoryListProps {
  repositories: GitHubRepository[];
  onAnalyzeRepository: (repoUrl: string, repoName: string) => void;
  loading?: boolean;
}

const GitHubRepositoryList: React.FC<GitHubRepositoryListProps> = ({
  repositories,
  onAnalyzeRepository,
  loading = false
}) => {
  const [analyzingRepo, setAnalyzingRepo] = useState<string | null>(null);

  const handleAnalyze = async (repo: GitHubRepository) => {
    setAnalyzingRepo(repo.full_name);
    try {
      await onAnalyzeRepository(repo.html_url, repo.name);
    } catch (error) {
      logger.error('Error analyzing repository:', error);
    } finally {
      setAnalyzingRepo(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">Loading repositories...</span>
        </div>
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <Github className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">No repositories found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {repositories.map((repo) => (
        <div
          key={repo.id}
          className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-sm p-4 sm:p-5 border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 transition-all hover:shadow-purple-500/10 hover:shadow-lg group"
        >
          {/* Mobile: Stack layout, Desktop: Side by side */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Repository name and visibility */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Github className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-purple-500 transition-colors flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:underline"
                  >
                    <span className="truncate">{repo.name}</span>
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </h3>
                {repo.private && (
                  <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 rounded-full border border-yellow-200 dark:border-yellow-500/30 whitespace-nowrap">
                    Private
                  </span>
                )}
              </div>

              {/* Description */}
              {repo.description && (
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mb-3 line-clamp-2">
                  {repo.description}
                </p>
              )}

              {/* Repository stats - Responsive wrap */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-500">
                {repo.language && (
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <span className="truncate max-w-[100px] sm:max-w-none">{repo.language}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{repo.stargazers_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{repo.forks_count.toLocaleString()}</span>
                </div>
                <span className="text-xs whitespace-nowrap">
                  Updated {new Date(repo.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Analyze button - Full width on mobile, auto on desktop */}
            <div className="w-full lg:w-auto lg:ml-4">
              <button
                onClick={() => handleAnalyze(repo)}
                disabled={analyzingRepo === repo.full_name}
                className={`w-full lg:w-auto px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  analyzingRepo === repo.full_name
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95'
                }`}
              >
                {analyzingRepo === repo.full_name ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GitHubRepositoryList;
