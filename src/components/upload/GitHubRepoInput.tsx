import React, { useState } from 'react';
import { Github, Loader2, CheckCircle, AlertCircle, Download, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { githubRepositoryService } from '@/services/githubRepositoryService';
import { Card } from '@/components/ui/card';

interface GitHubRepoInputProps {
  onFileReady: (file: File) => void;
}

export const GitHubRepoInput: React.FC<GitHubRepoInputProps> = ({ onFileReady }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
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
    if (url.startsWith('https://github.com/') && url.split('/').length >= 5) {
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
      console.error('Error fetching repo info:', err);
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    // Security: Additional URL validation before processing
    if (!repoUrl.startsWith('https://github.com/')) {
      setError('Invalid URL. Please use a valid GitHub URL starting with https://github.com/');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);
    setProgressMessage('Initializing...');

    try {
      // Parse GitHub URL with security validation
      const parsedRepo = githubRepositoryService.parseGitHubUrl(repoUrl);

      if (!parsedRepo) {
        throw new Error('Invalid GitHub URL. Please use format: https://github.com/owner/repo');
      }

      // Validate repository exists
      const isValid = await githubRepositoryService.validateRepository(
        parsedRepo.owner,
        parsedRepo.repo
      );

      if (!isValid) {
        throw new Error('Repository not found or not accessible. Please check the URL and try again.');
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
      setRepoUrl('');
      setRepoInfo(null);
      setEstimatedSize(null);

    } catch (err) {
      console.error('Error analyzing GitHub repository:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze repository');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleAnalyze();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="url"
            placeholder="https://github.com/owner/repository"
            value={repoUrl}
            onChange={handleUrlChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            pattern="https://github\.com/[^/]+/[^/]+(/.*)?"
            title="Enter a valid GitHub repository URL"
            className="pl-10 h-12 text-base border-2 focus:border-blue-500 transition-all"
          />
          {isFetchingInfo && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500 animate-spin" />
          )}
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={isLoading || !repoUrl.trim()}
          className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Download className="mr-2 h-5 w-5" />
              Analyze Repository
            </>
          )}
        </Button>
      </div>

      {repoInfo && (
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border-blue-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {repoInfo.fullName}
                </p>
                {repoInfo.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {repoInfo.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                {repoInfo.language && (
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    {repoInfo.language}
                  </span>
                )}
                {estimatedSize && (
                  <>
                    <span>•</span>
                    <span>{estimatedSize.fileCount} code files</span>
                    <span>•</span>
                    <span>{estimatedSize.formattedSize}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {isLoading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {progressMessage}
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {error && (
        <Alert className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      <Alert className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
          <strong>Supported formats:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>https://github.com/owner/repository</li>
            <li>https://github.com/owner/repository/tree/branch</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

