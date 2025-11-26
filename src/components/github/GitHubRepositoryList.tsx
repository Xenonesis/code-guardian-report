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
      <div className="bg-[#252538] rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-400">Loading repositories...</span>
        </div>
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="bg-[#252538] rounded-lg shadow p-6">
        <div className="text-center py-8">
          <Github className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No repositories found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {repositories.map((repo) => (
        <div
          key={repo.id}
          className="bg-[#252538] rounded-lg shadow p-5 border border-gray-700 hover:border-purple-500/50 transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Repository name and visibility */}
              <div className="flex items-center gap-2 mb-2">
                <Github className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white hover:text-purple-400 transition-colors">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    {repo.name}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </h3>
                {repo.private && (
                  <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30">
                    Private
                  </span>
                )}
              </div>

              {/* Description */}
              {repo.description && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {repo.description}
                </p>
              )}

              {/* Repository stats */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                {repo.language && (
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <span>{repo.language}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{repo.stargazers_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="w-4 h-4" />
                  <span>{repo.forks_count}</span>
                </div>
                <span className="text-xs">
                  Updated {new Date(repo.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Analyze button */}
            <div className="ml-4">
              <button
                onClick={() => handleAnalyze(repo)}
                disabled={analyzingRepo === repo.full_name}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  analyzingRepo === repo.full_name
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:opacity-90'
                }`}
              >
                {analyzingRepo === repo.full_name ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Analyze
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
