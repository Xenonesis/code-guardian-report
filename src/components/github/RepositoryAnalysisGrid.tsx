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
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-900/30">
          <CheckCircle className="w-3.5 h-3.5" />
          Excellent
        </div>
      );
    } else if (score >= 6) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-xs font-medium border border-yellow-100 dark:border-yellow-900/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          Good
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium border border-red-100 dark:border-red-900/30">
          <XCircle className="w-3.5 h-3.5" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-6 border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-5 w-40 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-56 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse"></div>
            </div>
            <div className="h-16 w-full bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-4"></div>
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* New Repository Input */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
        <Card className="relative p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Analyze New Repository
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                Enter a public GitHub repository URL to scan for security
                vulnerabilities and code quality issues.
              </p>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
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
                    className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <Button
                  onClick={handleAnalyzeNewRepo}
                  disabled={isAnalyzing || !repoUrl.trim()}
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
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
            </div>

            <div className="hidden md:block w-px h-24 bg-slate-200 dark:bg-slate-800" />

            <div className="flex gap-8 px-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {repositories.length}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Analyzed
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {repositories.reduce((acc, r) => acc + r.issuesFound, 0)}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Issues
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
          {[
            { id: "all", label: "All Repositories" },
            { id: "critical", label: "Critical Issues" },
            { id: "recent", label: "Recently Analyzed" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                filter === f.id
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search repositories..."
            className="pl-9 h-9 w-64 bg-transparent border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>

      {/* Repository Grid */}
      {filteredRepositories.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No repositories found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {filter === "all"
              ? "You haven't analyzed any repositories yet. Start by entering a GitHub URL above."
              : "No repositories match the selected filter."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepositories.map((repo) => (
            <Card
              key={repo.id}
              className="group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {repo.name}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">
                      {repo.fullName}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {getSecurityBadge(repo.securityScore)}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 h-10">
                  {repo.description || "No description provided."}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Issues</div>
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      {repo.issuesFound}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Score</div>
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      {repo.securityScore}/10
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Code className="w-3 h-3" />
                      {repo.language}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {repo.stars}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(repo.lastAnalyzed).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() =>
                      window.open(repo.url, "_blank", "noopener,noreferrer")
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    onClick={() => handleReanalyze(repo)}
                    disabled={analyzingRepoId === repo.id}
                  >
                    <RefreshCw
                      className={cn(
                        "w-4 h-4 mr-2",
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
