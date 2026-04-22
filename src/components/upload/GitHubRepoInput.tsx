import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  GitFork,
  CheckCircle,
  AlertCircle,
  Download,
  Info,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { githubRepositoryService } from "@/services/githubRepositoryService";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useGitHubRepositories } from "@/hooks/useGitHubRepositories";
import { Skeleton } from "@/components/ui/skeleton";

import { logger } from "@/utils/logger";
interface GitHubRepoInputProps {
  onFileReady: (file: File) => void;
}

interface RepoSuggestion {
  id: string;
  source: "account" | "public";
  fullName: string;
  description: string | null;
  language: string | null;
  stars?: number;
  htmlUrl: string;
}

export const GitHubRepoInput: React.FC<GitHubRepoInputProps> = ({
  onFileReady,
}) => {
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const { user, userProfile, isGitHubUser } = useAuth();
  const {
    repositories,
    loading: reposLoading,
    setManualUsername,
    refreshRepositories,
  } = useGitHubRepositories({
    email: userProfile?.email || null,
    enabled: !!user,
  });

  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [repoInfo, setRepoInfo] = useState<any>(null);
  const [estimatedSize, setEstimatedSize] = useState<any>(null);
  const [publicSuggestions, setPublicSuggestions] = useState<RepoSuggestion[]>(
    []
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasBootstrappedAccountRepos, setHasBootstrappedAccountRepos] =
    useState(false);

  const normalizeRepoInput = (rawValue: string) => {
    if (rawValue.trimStart().startsWith("github.com/")) {
      return `https://${rawValue.trimStart()}`;
    }
    return rawValue;
  };

  const userSuggestions = useMemo<RepoSuggestion[]>(() => {
    if (!repositories.length) return [];

    const normalizedQuery = repoUrl.trim().toLowerCase();
    const filtered = normalizedQuery
      ? repositories.filter(
          (repo) =>
            repo.name.toLowerCase().includes(normalizedQuery) ||
            repo.full_name.toLowerCase().includes(normalizedQuery)
        )
      : repositories;

    return filtered.slice(0, 8).map((repo) => ({
      id: `account-${repo.id}`,
      source: "account" as const,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      htmlUrl: repo.html_url,
    }));
  }, [repositories, repoUrl]);

  const mergedSuggestions = useMemo<RepoSuggestion[]>(() => {
    const merged = [...userSuggestions];
    for (const suggestion of publicSuggestions) {
      const exists = merged.some(
        (item) => item.fullName === suggestion.fullName
      );
      if (!exists) merged.push(suggestion);
      if (merged.length >= 10) break;
    }
    return merged;
  }, [userSuggestions, publicSuggestions]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const url = normalizeRepoInput(raw);
    setRepoUrl(url);
    setError(null);
    setRepoInfo(null);
    setEstimatedSize(null);
    setShowSuggestions(true);

    const trimmed = url.trim();
    if (!trimmed) {
      setPublicSuggestions([]);
      return;
    }

    const parsed = githubRepositoryService.parseGitHubUrl(trimmed);
    if (parsed) {
      void fetchRepositoryInfo(trimmed);
      setPublicSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion: RepoSuggestion) => {
    setRepoUrl(suggestion.htmlUrl);
    setShowSuggestions(false);
    setPublicSuggestions([]);
    setError(null);
    void fetchRepositoryInfo(suggestion.htmlUrl);
  };

  const handleSuggestionsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleSuggestionsTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  useEffect(() => {
    const username =
      userProfile?.githubUsername || userProfile?.githubMetadata?.login || null;
    if (!isGitHubUser || !username || hasBootstrappedAccountRepos) return;

    if (repositories.length === 0 && !reposLoading) {
      setHasBootstrappedAccountRepos(true);
      void setManualUsername(username);
    } else if (repositories.length > 0) {
      setHasBootstrappedAccountRepos(true);
      refreshRepositories?.();
    }
  }, [
    hasBootstrappedAccountRepos,
    isGitHubUser,
    userProfile?.githubUsername,
    userProfile?.githubMetadata?.login,
    repositories.length,
    reposLoading,
    refreshRepositories,
    setManualUsername,
  ]);

  useEffect(() => {
    const query = repoUrl.trim();
    if (query.length < 2 || githubRepositoryService.parseGitHubUrl(query)) {
      setIsSearching(false);
      setPublicSuggestions([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(query.trim())}&per_page=6&sort=stars&order=desc`
        );
        if (!response.ok) {
          setPublicSuggestions([]);
          return;
        }

        const data = await response.json();
        if (!Array.isArray(data?.items)) {
          setPublicSuggestions([]);
          return;
        }

        const suggestions: RepoSuggestion[] = data.items.map((item: any) => ({
          id: `public-${item.id}`,
          source: "public",
          fullName: item.full_name,
          description: item.description,
          language: item.language,
          stars: item.stargazers_count,
          htmlUrl: item.html_url,
        }));

        setPublicSuggestions(suggestions);
      } catch (err) {
        logger.debug("Live repository search failed:", err);
        setPublicSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [repoUrl]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!searchContainerRef.current) return;
      if (!searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const fetchRepositoryInfo = async (url: string) => {
    const parsedRepo = githubRepositoryService.parseGitHubUrl(url);
    if (!parsedRepo) return;

    setIsFetchingInfo(true);
    try {
      const info = await githubRepositoryService.getRepositoryInfo(
        parsedRepo.owner,
        parsedRepo.repo
      );
      setRepoInfo(info);

      // Get estimated size
      const size = await githubRepositoryService.estimateRepositorySize(
        parsedRepo.owner,
        parsedRepo.repo,
        parsedRepo.branch || info.defaultBranch
      );
      setEstimatedSize(size);
    } catch (err) {
      logger.error("Error fetching repo info:", err);
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const handleAnalyze = async () => {
    const normalizedUrl = repoUrl.trim();
    if (!normalizedUrl) {
      setError("Please enter a GitHub repository URL");
      return;
    }

    // Security: Additional URL validation before processing
    if (!normalizedUrl.startsWith("https://github.com/")) {
      setError(
        "Invalid URL. Please use a valid GitHub URL starting with https://github.com/"
      );
      return;
    }

    setRepoUrl(normalizedUrl);
    setShowSuggestions(false);
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setProgressMessage("Initializing...");

    try {
      // Parse GitHub URL with security validation
      const parsedRepo = githubRepositoryService.parseGitHubUrl(normalizedUrl);

      if (!parsedRepo) {
        throw new Error(
          "Invalid GitHub URL. Please use format: https://github.com/owner/repo"
        );
      }

      // Validate repository exists
      const isValid = await githubRepositoryService.validateRepository(
        parsedRepo.owner,
        parsedRepo.repo
      );

      if (!isValid) {
        throw new Error(
          "Repository not found or not accessible. Please check the URL and try again."
        );
      }

      // If branch not specified, get default branch
      let branch = parsedRepo.branch;
      if (!branch) {
        const info = await githubRepositoryService.getRepositoryInfo(
          parsedRepo.owner,
          parsedRepo.repo
        );
        branch = info.defaultBranch;
      }

      // Download repository as zip
      const zipFile = await githubRepositoryService.downloadRepositoryAsZip(
        parsedRepo.owner,
        parsedRepo.repo,
        branch,
        (prog, msg) => {
          setProgress(prog);
          setProgressMessage(msg);
        }
      );

      // Pass the file to parent component for analysis
      onFileReady(zipFile);

      // Reset form
      setRepoUrl("");
      setRepoInfo(null);
      setEstimatedSize(null);
    } catch (err) {
      logger.error("Error analyzing GitHub repository:", err);
      setError(
        err instanceof Error ? err.message : "Failed to analyze repository"
      );
    } finally {
      setIsLoading(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleAnalyze();
    }
  };

  return (
    <div className="relative isolate space-y-4 sm:space-y-6">
      <div className="relative z-30 flex flex-col gap-3">
        <div ref={searchContainerRef} className="relative isolate z-40 w-full">
          <GitFork className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 transform sm:h-5 sm:w-5" />
          <Input
            type="text"
            placeholder="Search repos or paste a GitHub URL"
            value={repoUrl}
            onChange={handleUrlChange}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (repoUrl.trim() || mergedSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            disabled={isLoading}
            autoComplete="off"
            title="Search repositories or paste a GitHub URL"
            className="focus:border-primary h-12 w-full rounded-none border-2 bg-[hsl(var(--background))] pr-10 pl-9 font-mono text-sm transition-all focus:shadow-[4px_4px_0px_0px_hsl(var(--primary))] sm:h-14 sm:pl-10 sm:text-base"
          />
          {(isFetchingInfo || isSearching) && (
            <Skeleton className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 rounded-full sm:h-5 sm:w-5" />
          )}
          {!isFetchingInfo && !isSearching && (
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform sm:h-5 sm:w-5" />
          )}

          {showSuggestions && mergedSuggestions.length > 0 && (
            <div
              className="absolute top-full right-0 left-0 z-[120] mt-1"
              style={{ overscrollBehavior: "contain" }}
            >
              <Card
                data-lenis-prevent
                onWheelCapture={handleSuggestionsWheel}
                onTouchMoveCapture={handleSuggestionsTouchMove}
                className="border-border animate-in fade-in zoom-in-95 max-h-64 overflow-y-auto overscroll-contain rounded-none border-2 bg-[hsl(var(--card))] p-0 shadow-xl"
              >
                <div className="divide-border flex flex-col gap-0 divide-y">
                  {mergedSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      className="flex w-full flex-col items-start gap-0.5 rounded-none bg-[hsl(var(--card))] px-4 py-3 text-left transition-colors outline-none hover:bg-[hsl(var(--muted))] focus:bg-[hsl(var(--muted))]"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-foreground truncate text-sm font-medium">
                          {suggestion.fullName}
                        </span>
                        <span className="text-muted-foreground shrink-0 text-[10px] uppercase">
                          {suggestion.source === "account"
                            ? "Your repo"
                            : "Public"}
                        </span>
                      </div>
                      <div className="text-muted-foreground flex w-full items-center gap-2 text-xs">
                        {suggestion.language && (
                          <span>{suggestion.language}</span>
                        )}
                        {typeof suggestion.stars === "number" && (
                          <span>★ {suggestion.stars}</span>
                        )}
                      </div>
                      {suggestion.description && (
                        <span className="text-muted-foreground line-clamp-1 w-full text-xs">
                          {suggestion.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={isLoading || !repoUrl.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground border-primary relative z-10 h-12 w-full rounded-none border-2 px-4 text-sm font-bold tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none sm:h-14 sm:px-6 sm:text-base"
        >
          {isLoading ? (
            <>
              <Skeleton className="mr-2 h-4 w-4 rounded-full sm:h-5 sm:w-5" />
              <Skeleton className="h-3 w-24 sm:w-32" />
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Analyze Repository
            </>
          )}
        </Button>
      </div>

      {repoInfo && (
        <Card className="border-border bg-muted/20 rounded-none border-2 p-4 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-start gap-2 sm:gap-4">
            <CheckCircle className="text-primary mt-0.5 h-6 w-6 flex-shrink-0 sm:h-6 sm:w-6" />
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <p className="text-foreground text-sm font-semibold break-words sm:text-base dark:text-white">
                  {repoInfo.fullName}
                </p>
                {repoInfo.description && (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-xs sm:text-sm">
                    {repoInfo.description}
                  </p>
                )}
              </div>

              <div className="text-muted-foreground flex flex-wrap gap-2 text-xs sm:gap-3 sm:text-sm">
                {repoInfo.language && (
                  <span className="border-border bg-background flex items-center gap-2 border px-2 py-0.5 font-mono text-xs tracking-wider uppercase">
                    <span className="bg-primary h-2 w-2 flex-shrink-0 rounded-none sm:h-2 sm:w-2"></span>
                    <span className="truncate">{repoInfo.language}</span>
                  </span>
                )}
                {estimatedSize && (
                  <>
                    <span className="xs:inline hidden">•</span>
                    <span className="truncate">
                      {estimatedSize.fileCount} files
                    </span>
                    <span className="xs:inline hidden">•</span>
                    <span className="truncate">
                      {estimatedSize.formattedSize}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {isLoading && (
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground truncate pr-2 font-medium">
              {progressMessage}
            </span>
            <span className="text-primary dark:text-primary flex-shrink-0 font-semibold">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-1.5 sm:h-2" />
        </div>
      )}

      {error && (
        <Alert className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 sm:h-5 sm:w-5 dark:text-red-400" />
          <AlertDescription className="text-xs break-words text-red-800 sm:text-sm dark:text-red-200">
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      <Alert className="bg-muted border-l-4 border-l-blue-500 dark:bg-blue-950/20">
        <Info className="text-primary dark:text-primary h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
        <AlertDescription className="text-xs text-blue-800 sm:text-sm dark:text-blue-200">
          <strong className="mb-1 block">Supported formats:</strong>
          <ul className="list-inside list-disc space-y-1 text-xs sm:text-sm">
            <li className="break-all">https://github.com/owner/repository</li>
            <li className="break-all">
              https://github.com/owner/repository/tree/branch
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};
