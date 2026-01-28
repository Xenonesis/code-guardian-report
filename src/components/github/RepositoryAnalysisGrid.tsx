import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GitBranch,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Plus,
  TrendingUp,
  Search,
  Shield,
  Code,
  Calendar,
} from "lucide-react";
import { GitHubAnalysisStorageService } from "@/services/storage/GitHubAnalysisStorageService";
import { githubRepositoryService } from "@/services/githubRepositoryService";
import { EnhancedAnalysisEngine } from "@/services/enhancedAnalysisEngine";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { cn } from "@/lib/utils";

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

export const RepositoryAnalysisGrid: React.FC<RepositoryAnalysisGridProps> = ({
  userId,
}) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "critical" | "recent">("all");
  const [repoUrl, setRepoUrl] = useState("");
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
      logger.error("Error loading repositories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeNewRepo = async () => {
    if (!repoUrl.trim()) {
      toast.error("Please enter a GitHub repository URL");
      return;
    }

    if (!repoUrl.startsWith("https://github.com/")) {
      toast.error(
        "Please enter a valid GitHub URL (https://github.com/owner/repo)"
      );
      return;
    }

    setIsAnalyzing(true);
    const progressToastId = toast.loading("Preparing to analyze repository...");

    try {
      const repoInfo = githubRepositoryService.parseGitHubUrl(repoUrl);
      if (!repoInfo) {
        throw new Error("Invalid GitHub repository URL");
      }

      let branch = repoInfo.branch;
      if (!branch) {
        try {
          toast.loading("Checking repository details...", {
            id: progressToastId,
          });
          const details = await githubRepositoryService.getRepositoryInfo(
            repoInfo.owner,
            repoInfo.repo
          );
          branch = details.defaultBranch;
        } catch {
          branch = "main";
        }
      }

      let lastUpdate = 0;
      let lastMessage = "";
      const zipFile = await githubRepositoryService.downloadRepositoryAsZip(
        repoInfo.owner,
        repoInfo.repo,
        branch || "main",
        (progress, message) => {
          const now = Date.now();
          if (
            (now - lastUpdate > 500 || progress === 100) &&
            message !== lastMessage
          ) {
            lastMessage = message;
            lastUpdate = now;
            setTimeout(
              () => toast.loading(message, { id: progressToastId }),
              0
            );
          }
        }
      );

      toast.loading("Analyzing code...", { id: progressToastId });

      const analysisEngine = new EnhancedAnalysisEngine();
      const results = await analysisEngine.analyzeCodebase(zipFile);

      toast.loading("Saving analysis results...", { id: progressToastId });

      const storageService = new GitHubAnalysisStorageService();
      await storageService.storeRepositoryAnalysis(userId, {
        name: repoInfo.repo,
        fullName: `${repoInfo.owner}/${repoInfo.repo}`,
        description: `Analysis of ${repoInfo.owner}/${repoInfo.repo}`,
        url: repoUrl,
        securityScore: results.summary.securityScore / 10,
        issuesFound: results.issues.length,
        criticalIssues: results.summary.criticalIssues,
        language:
          typeof results.languageDetection?.primaryLanguage === "string"
            ? results.languageDetection.primaryLanguage
            : results.languageDetection?.primaryLanguage?.name || "Unknown",
        stars: 0,
        forks: 0,
        duration: parseFloat(results.analysisTime) || 0,
      });

      // Store full analysis results
      const { firebaseAnalysisStorage } =
        await import("@/services/storage/firebaseAnalysisStorage");
      firebaseAnalysisStorage.setUserId(userId);
      const fileForStorage = new File(
        [zipFile],
        `${repoInfo.owner}-${repoInfo.repo}.zip`,
        { type: "application/zip" }
      );
      await firebaseAnalysisStorage.storeAnalysisResults(
        results,
        fileForStorage,
        [`github-${repoInfo.owner}-${repoInfo.repo}`],
        false
      );

      toast.success(
        `Analysis complete! Found ${results.issues.length} issues.`,
        {
          id: progressToastId,
          duration: 4000,
        }
      );

      setRepoUrl("");
      await loadRepositories();
    } catch (error: any) {
      toast.error(`Analysis failed: ${error.message}`, { id: progressToastId });
      logger.error("Repository analysis failed:", error);
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
        throw new Error("Invalid repository URL");
      }

      let branch = "main";
      try {
        const details = await githubRepositoryService.getRepositoryInfo(
          repoInfo.owner,
          repoInfo.repo
        );
        branch = details.defaultBranch;
      } catch {
        // Keep default
      }

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

      toast.loading("Analyzing code...", { id: progressToastId });

      const analysisEngine = new EnhancedAnalysisEngine();
      const results = await analysisEngine.analyzeCodebase(zipFile);

      const storageService = new GitHubAnalysisStorageService();
      await storageService.storeRepositoryAnalysis(userId, {
        name: repo.name,
        fullName: repo.fullName,
        description: repo.description,
        url: repo.url,
        securityScore: results.summary.securityScore / 10,
        issuesFound: results.issues.length,
        criticalIssues: results.summary.criticalIssues,
        language:
          typeof results.languageDetection?.primaryLanguage === "string"
            ? results.languageDetection.primaryLanguage
            : results.languageDetection?.primaryLanguage?.name || repo.language,
        stars: repo.stars,
        forks: repo.forks,
        duration: parseFloat(results.analysisTime) || 0,
      });

      // Store full analysis results
      const { firebaseAnalysisStorage } =
        await import("@/services/storage/firebaseAnalysisStorage");
      firebaseAnalysisStorage.setUserId(userId);
      const fileForStorage = new File(
        [zipFile],
        `${repoInfo.owner}-${repoInfo.repo}.zip`,
        { type: "application/zip" }
      );
      await firebaseAnalysisStorage.storeAnalysisResults(
        results,
        fileForStorage,
        [`github-${repoInfo.owner}-${repoInfo.repo}`],
        false
      );

      toast.success(
        `Re-analysis complete! Found ${results.issues.length} issues.`,
        {
          id: progressToastId,
          duration: 4000,
        }
      );

      await loadRepositories();
    } catch (error: any) {
      toast.error(`Re-analysis failed: ${error.message}`, {
        id: progressToastId,
      });
      logger.error("Repository re-analysis failed:", error);
    } finally {
      setAnalyzingRepoId(null);
    }
  };

  const getSecurityBadge = (score: number) => {
    if (score >= 8) {
      return (
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400">
          <CheckCircle className="h-3.5 w-3.5" />
          Excellent
        </div>
      );
    } else if (score >= 6) {
      return (
        <div className="flex items-center gap-1.5 rounded-full border border-yellow-100 bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-600 dark:border-yellow-900/30 dark:bg-yellow-900/20 dark:text-yellow-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          Good
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
          <XCircle className="h-3.5 w-3.5" />
          Needs Attention
        </div>
      );
    }
  };

  const filteredRepositories = repositories.filter((repo) => {
    if (filter === "critical") return repo.criticalIssues > 0;
    if (filter === "recent") {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return repo.lastAnalyzed > dayAgo;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-slate-200 p-6 dark:border-slate-800">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 h-5 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
                <div className="h-4 w-56 animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
              </div>
              <div className="h-8 w-8 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800"></div>
            </div>
            <div className="mb-4 h-16 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
            <div className="flex gap-2">
              <div className="h-8 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
              <div className="h-8 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* New Repository Input */}
      <div className="group relative">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur transition duration-500 group-hover:opacity-40"></div>
        <Card className="relative border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="w-full flex-1">
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Analyze New Repository
              </h3>
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                Enter a public GitHub repository URL to scan for security
                vulnerabilities and code quality issues.
              </p>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <GitBranch className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
                  <Input
                    type="url"
                    placeholder="https://github.com/owner/repository"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      !isAnalyzing &&
                      handleAnalyzeNewRepo()
                    }
                    disabled={isAnalyzing}
                    className="h-11 border-slate-200 bg-slate-50 pl-10 transition-all focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <Button
                  onClick={handleAnalyzeNewRepo}
                  disabled={isAnalyzing || !repoUrl.trim()}
                  className="h-11 bg-blue-600 px-6 font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:bg-blue-700"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="hidden h-24 w-px bg-slate-200 md:block dark:bg-slate-800" />

            <div className="flex gap-8 px-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {repositories.length}
                </div>
                <div className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                  Analyzed
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {repositories.reduce((acc, r) => acc + r.issuesFound, 0)}
                </div>
                <div className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                  Issues
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800/50">
          {[
            { id: "all", label: "All Repositories" },
            { id: "critical", label: "Critical Issues" },
            { id: "recent", label: "Recently Analyzed" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
                filter === f.id
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative hidden sm:block">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
          <Input
            placeholder="Search repositories..."
            className="h-9 w-64 border-slate-200 bg-transparent pl-9 dark:border-slate-800"
          />
        </div>
      </div>

      {/* Repository Grid */}
      {filteredRepositories.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <GitBranch className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
            No repositories found
          </h3>
          <p className="mx-auto max-w-md text-slate-500 dark:text-slate-400">
            {filter === "all"
              ? "You haven't analyzed any repositories yet. Start by entering a GitHub URL above."
              : "No repositories match the selected filter."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRepositories.map((repo) => (
            <Card
              key={repo.id}
              className="group overflow-hidden border-slate-200 transition-all duration-300 hover:border-blue-200 hover:shadow-xl dark:border-slate-800 dark:hover:border-blue-800"
            >
              <div className="p-6">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="mr-4 min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {repo.name}
                    </h3>
                    <p className="truncate text-sm text-slate-500">
                      {repo.fullName}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {getSecurityBadge(repo.securityScore)}
                  </div>
                </div>

                {/* Description */}
                <p className="mb-6 line-clamp-2 h-10 text-sm text-slate-600 dark:text-slate-400">
                  {repo.description || "No description provided."}
                </p>

                {/* Metrics Grid */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                    <div className="mb-1 text-xs text-slate-500">Issues</div>
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      {repo.issuesFound}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                    <div className="mb-1 text-xs text-slate-500">Score</div>
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                      <Shield className="h-4 w-4 text-emerald-500" />
                      {repo.securityScore}/10
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mb-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Code className="h-3 w-3" />
                      {repo.language}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {repo.stars}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(repo.lastAnalyzed).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() =>
                      window.open(repo.url, "_blank", "noopener,noreferrer")
                    }
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    onClick={() => handleReanalyze(repo)}
                    disabled={analyzingRepoId === repo.id}
                  >
                    <RefreshCw
                      className={cn(
                        "mr-2 h-4 w-4",
                        analyzingRepoId === repo.id && "animate-spin"
                      )}
                    />
                    Re-Analyze
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
