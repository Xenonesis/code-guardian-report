import React, { useState } from "react";
import {
  Github,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { githubRepositoryService } from "@/services/githubRepositoryService";
import { Card } from "@/components/ui/card";

import { logger } from "@/utils/logger";
interface GitHubRepoInputProps {
  onFileReady: (file: File) => void;
}

export const GitHubRepoInput: React.FC<GitHubRepoInputProps> = ({
  onFileReady,
}) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [repoInfo, setRepoInfo] = useState<any>(null);
  const [estimatedSize, setEstimatedSize] = useState<any>(null);

  const handleUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setRepoUrl(url);
    setError(null);
    setRepoInfo(null);
    setEstimatedSize(null);

    // Security: Validate URL format before making any requests
    // Only fetch info if URL starts with https://github.com/ (not just contains it)
    if (url.startsWith("https://github.com/") && url.split("/").length >= 5) {
      await fetchRepositoryInfo(url);
    }
  };

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
    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL");
      return;
    }

    // Security: Additional URL validation before processing
    if (!repoUrl.startsWith("https://github.com/")) {
      setError(
        "Invalid URL. Please use a valid GitHub URL starting with https://github.com/"
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);
    setProgressMessage("Initializing...");

    try {
      // Parse GitHub URL with security validation
      const parsedRepo = githubRepositoryService.parseGitHubUrl(repoUrl);

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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Github className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 transform text-slate-400 sm:h-5 sm:w-5" />
          <Input
            type="url"
            placeholder="https://github.com/owner/repository"
            value={repoUrl}
            onChange={handleUrlChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            pattern="https://github\.com/[^\/]+/[^\/]+(/.*)?"
            title="Enter a valid GitHub repository URL"
            className="h-11 w-full border-2 pr-10 pl-9 text-sm transition-all focus:border-blue-500 sm:h-12 sm:pl-10 sm:text-base"
          />
          {isFetchingInfo && (
            <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform animate-spin text-blue-500 sm:h-5 sm:w-5" />
          )}
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={isLoading || !repoUrl.trim()}
          className="h-11 w-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 text-sm font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl sm:h-12 sm:px-6 sm:text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin sm:h-5 sm:w-5" />
              Analyzing...
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
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-3 sm:p-4 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-start gap-2 sm:gap-3">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 sm:h-5 sm:w-5 dark:text-green-400" />
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <p className="text-sm font-semibold break-words text-slate-900 sm:text-base dark:text-white">
                  {repoInfo.fullName}
                </p>
                {repoInfo.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600 sm:text-sm dark:text-slate-300">
                    {repoInfo.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-600 sm:gap-3 sm:text-sm dark:text-slate-300">
                {repoInfo.language && (
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500 sm:h-3 sm:w-3"></span>
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
            <span className="truncate pr-2 font-medium text-slate-600 dark:text-slate-300">
              {progressMessage}
            </span>
            <span className="flex-shrink-0 font-semibold text-blue-600 dark:text-blue-400">
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

      <Alert className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
        <Info className="h-4 w-4 flex-shrink-0 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400" />
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
