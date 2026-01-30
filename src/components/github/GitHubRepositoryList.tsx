// components/github/GitHubRepositoryList.tsx
import React, { useState } from "react";
import { Github, Star, GitFork, ExternalLink, TrendingUp } from "lucide-react";
import { logger } from "@/utils/logger";

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
  loading = false,
}) => {
  const [analyzingRepo, setAnalyzingRepo] = useState<string | null>(null);

  const handleAnalyze = async (repo: GitHubRepository) => {
    setAnalyzingRepo(repo.full_name);
    try {
      await onAnalyzeRepository(repo.html_url, repo.name);
    } catch (error) {
      logger.error("Error analyzing repository:", error);
    } finally {
      setAnalyzingRepo(null);
    }
  };

  if (loading) {
    return (
      <div className="border-border bg-muted/5 rounded-lg border p-6 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-500"></div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">
            Loading repositories...
          </span>
        </div>
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="border-border bg-muted/5 rounded-lg border p-6 shadow-sm backdrop-blur-sm">
        <div className="py-8 text-center">
          <Github className="mx-auto mb-4 h-12 w-12 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">
            No repositories found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {repositories.map((repo) => (
        <div
          key={repo.id}
          className="group border-border bg-card/50 rounded-lg border p-4 shadow-sm backdrop-blur-sm transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 sm:p-5"
        >
          {/* Mobile: Stack layout, Desktop: Side by side */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              {/* Repository name and visibility */}
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Github className="h-5 w-5 flex-shrink-0 text-slate-600 transition-colors group-hover:text-purple-500 dark:text-slate-400" />
                <h3 className="text-foreground truncate text-base font-semibold transition-colors hover:text-purple-600 sm:text-lg">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:underline"
                  >
                    <span className="truncate">{repo.name}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100 sm:h-4 sm:w-4" />
                  </a>
                </h3>
                {repo.private && (
                  <span className="rounded-full border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-xs whitespace-nowrap text-yellow-700 dark:border-yellow-500/30 dark:bg-yellow-500/20 dark:text-yellow-300">
                    Private
                  </span>
                )}
              </div>

              {/* Description */}
              {repo.description && (
                <p className="mb-3 line-clamp-2 text-xs text-slate-600 sm:text-sm dark:text-slate-400">
                  {repo.description}
                </p>
              )}

              {/* Repository stats - Responsive wrap */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:gap-4 sm:text-sm dark:text-slate-500">
                {repo.language && (
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-purple-500"></span>
                    <span className="max-w-[100px] truncate sm:max-w-none">
                      {repo.language}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{repo.stargazers_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{repo.forks_count.toLocaleString()}</span>
                </div>
                <span className="text-xs whitespace-nowrap">
                  Updated {new Date(repo.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Analyze button - Full width on mobile, auto on desktop */}
            <div className="w-full lg:ml-4 lg:w-auto">
              <button
                onClick={() => handleAnalyze(repo)}
                disabled={analyzingRepo === repo.full_name}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all sm:py-2 lg:w-auto ${
                  analyzingRepo === repo.full_name
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95"
                }`}
              >
                {analyzingRepo === repo.full_name ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-slate-400"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4" />
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
