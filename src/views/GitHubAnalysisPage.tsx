"use client";

import React, { useEffect, useState, Suspense, lazy } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigation } from "@/lib/navigation-context";
import {
  Github,
  Shield,
  Activity,
  GitBranch,
  BarChart3,
  ArrowLeft,
  FileCode,
  Lock,
  Terminal,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RepositoryAnalysisGrid } from "@/components/github/RepositoryAnalysisGrid";
import { AnalysisHistorySection } from "@/components/github/AnalysisHistorySection";
import { SecurityAnalyticsSection } from "@/components/github/SecurityAnalyticsSection";
import { RepositoryActivityAnalytics } from "@/components/github/RepositoryActivityAnalytics";
import { RepositoryComparisonTool } from "@/components/github/RepositoryComparisonTool";
import { CodeQualityAnalytics } from "@/components/github/CodeQualityAnalytics";
import { VulnerabilityPatternAnalytics } from "@/components/github/VulnerabilityPatternAnalytics";
import { useGitHubRepositories } from "@/hooks/useGitHubRepositories";
import GitHubUsernameInput from "@/components/github/GitHubUsernameInput";
import GitHubRepositoryPermissionModal from "@/components/github/GitHubRepositoryPermissionModal";
import GitHubRepositoryList from "@/components/github/GitHubRepositoryList";
import { toast } from "sonner";
import { logger } from "@/utils/logger";
import { isValidGitHubUsername } from "@/utils/githubValidation";
import { AnalysisResults } from "@/hooks/useAnalysis";
import { cn } from "@/lib/utils";
import { GitHubProfileHeader } from "@/components/github/GitHubProfileHeader";
import { GitHubNavigationTabs } from "@/components/github/GitHubNavigationTabs";
import { Skeleton } from "@/components/ui/skeleton";

const EnhancedSecurityResults = lazy(() =>
  import("@/components/analysis/EnhancedSecurityResults").then((m) => ({
    default: m.EnhancedSecurityResults,
  }))
);

export const GitHubAnalysisPage: React.FC = () => {
  const { user, userProfile, isGitHubUser, signInWithGithub } = useAuth();
  const { navigateTo: _navigateTo } = useNavigation();
  const [selectedTab, setSelectedTab] = useState<
    | "overview"
    | "repositories"
    | "history"
    | "analytics"
    | "comparison"
    | "quality"
    | "patterns"
    | "results"
  >(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("github_selected_tab")
        : null;
    return (
      (stored as
        | "overview"
        | "repositories"
        | "history"
        | "analytics"
        | "comparison"
        | "quality"
        | "patterns"
        | "results") || "overview"
    );
  });
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [showGitHubRepos, setShowGitHubRepos] = useState(true);
  const [analysisResults, setAnalysisResults] =
    useState<AnalysisResults | null>(null);
  const [analyzedRepoName, setAnalyzedRepoName] = useState<string>("");

  // Wrapper to persist tab selection to localStorage
  const handleTabChange = (tab: typeof selectedTab) => {
    setSelectedTab(tab);
    if (typeof window !== "undefined") {
      localStorage.setItem("github_selected_tab", tab);
    }
  };

  const [dashboardStats, setDashboardStats] = useState({
    repoCount: 0,
    avgScore: 0,
    totalIssues: 0,
    loading: true,
  });

  useEffect(() => {
    const loadDashboardStats = async () => {
      if (!user?.uid) return;

      try {
        const { GitHubAnalysisStorageService } =
          await import("@/services/storage/GitHubAnalysisStorageService");
        const storageService = new GitHubAnalysisStorageService();

        const [repos, trends] = await Promise.all([
          storageService.getUserRepositories(user.uid),
          storageService.getSecurityTrends(user.uid),
        ]);

        setDashboardStats({
          repoCount: repos.length,
          avgScore: trends.stats.averageScore,
          totalIssues: trends.stats.totalIssues,
          loading: false,
        });
      } catch (error) {
        logger.error("Failed to load dashboard stats:", error);
        setDashboardStats((prev) => ({ ...prev, loading: false }));
      }
    };

    loadDashboardStats();
  }, [user?.uid, selectedTab]);

  const {
    repositories,
    loading: reposLoading,
    error: reposError,
    hasGitHubAccount,
    permissionGranted,
    permissionDenied,
    grantPermission,
    denyPermission,
    setManualUsername,
    githubUser,
    refreshRepositories,
  } = useGitHubRepositories({
    email: userProfile?.email || null,
    enabled: !!user,
  });

  useEffect(() => {
    if (reposError) {
      toast.error(reposError, {
        duration: 6000,
        description: "Please try again or check your internet connection",
      });
    }
  }, [reposError]);

  useEffect(() => {
    const autoFetchGitHubData = async () => {
      if (!isGitHubUser) return;

      const username =
        userProfile?.githubUsername ||
        userProfile?.githubMetadata?.login ||
        null;

      if (!username) {
        return;
      }

      if (!isValidGitHubUsername(username)) {
        const storedUsername = localStorage.getItem("github_username");
        if (storedUsername === username) {
          localStorage.removeItem("github_username");
          localStorage.removeItem("github_repo_permission");
        }
        return;
      }

      const storedUsername = localStorage.getItem("github_username");
      if (storedUsername !== username) {
        localStorage.setItem("github_username", username);
        localStorage.setItem("github_repo_permission", "granted");
        const success = await setManualUsername(username);
        if (success) {
          logger.debug("Auto-fetched GitHub data for:", username);
        }
      } else if (repositories.length === 0 && !reposLoading) {
        refreshRepositories?.();
      }
    };

    autoFetchGitHubData();
  }, [
    isGitHubUser,
    userProfile?.githubUsername,
    userProfile?.githubMetadata?.login,
    setManualUsername,
    repositories.length,
    reposLoading,
    refreshRepositories,
  ]);

  const nonGithubConnected = !isGitHubUser;
  const githubAvatarUrl = nonGithubConnected
    ? githubUser?.avatar_url || null
    : userProfile?.githubMetadata?.avatarUrl || user?.photoURL || null;
  const githubDisplayName = nonGithubConnected
    ? githubUser?.name || githubUser?.login || null
    : userProfile?.displayName ||
      userProfile?.githubMetadata?.login ||
      user?.displayName ||
      null;
  const githubUsername = nonGithubConnected
    ? githubUser?.login || null
    : userProfile?.githubUsername || userProfile?.githubMetadata?.login || null;
  const totalGitHubRepos = nonGithubConnected
    ? githubUser?.public_repos || 0
    : userProfile?.githubMetadata?.publicRepos || 0;
  const isLoadingProfile = !githubUsername && isGitHubUser;

  useEffect(() => {
    if (
      !isGitHubUser &&
      hasGitHubAccount &&
      !permissionGranted &&
      !permissionDenied &&
      user
    ) {
      const timer = setTimeout(() => setShowPermissionModal(true), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [
    hasGitHubAccount,
    permissionGranted,
    permissionDenied,
    isGitHubUser,
    user,
  ]);

  useEffect(() => {
    if (
      !isGitHubUser &&
      !hasGitHubAccount &&
      !permissionGranted &&
      !permissionDenied &&
      user &&
      userProfile?.email
    ) {
      const hasAskedForUsername = localStorage.getItem("github_username_asked");
      if (!hasAskedForUsername) {
        const timer = setTimeout(() => {
          setShowUsernameInput(true);
          localStorage.setItem("github_username_asked", "true");
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [
    hasGitHubAccount,
    permissionGranted,
    permissionDenied,
    isGitHubUser,
    user,
    userProfile?.email,
  ]);

  const handleAllowGitHubAccess = async () => {
    localStorage.setItem("github_selected_tab", "analytics");
    setShowPermissionModal(false);
    const t = toast.loading("Fetching your repositories...");
    await grantPermission();
    toast.success("GitHub repositories loaded successfully!", { id: t });
    setShowGitHubRepos(true);
  };

  const handleDenyGitHubAccess = () => {
    setShowPermissionModal(false);
    denyPermission();
    toast.info("You can enable this later from settings.");
  };

  const handleManualUsernameSuccess = async (username: string) => {
    localStorage.setItem("github_selected_tab", "analytics");
    setShowUsernameInput(false);
    const t = toast.loading("Fetching your repositories...");
    await setManualUsername(username);
    toast.success("GitHub repositories loaded successfully!", { id: t });
    setShowGitHubRepos(true);
  };

  const handleSkipUsernameInput = () => {
    setShowUsernameInput(false);
    localStorage.setItem("github_repo_permission", "denied");
    toast.info("You can connect your GitHub account later.");
  };

  const openConnectGitHubPrompt = () => {
    if (hasGitHubAccount && !permissionDenied) {
      setShowPermissionModal(true);
    } else {
      setShowUsernameInput(true);
    }
  };

  const handleAnalyzeRepository = async (
    repoUrl: string,
    _repoName: string
  ) => {
    try {
      const { githubRepositoryService } =
        await import("@/services/githubRepositoryService");
      const { EnhancedAnalysisEngine } =
        await import("@/services/enhancedAnalysisEngine");
      const { GitHubAnalysisStorageService } =
        await import("@/services/storage/GitHubAnalysisStorageService");
      const { firebaseAnalysisStorage } =
        await import("@/services/storage/firebaseAnalysisStorage");

      const repoInfo = githubRepositoryService.parseGitHubUrl(repoUrl);
      if (!repoInfo) {
        toast.error("Invalid GitHub repository URL");
        return;
      }

      const progressToastId = toast.loading(
        "Preparing to analyze repository..."
      );

      try {
        let branch = repoInfo.branch;
        let repoDetails: {
          name?: string;
          fullName?: string;
          description?: string;
          defaultBranch?: string;
          default_branch?: string;
          size?: number;
          language?: string;
          stars?: number;
          forks?: number;
          openIssues?: number;
          private?: boolean;
          createdAt?: string;
          updatedAt?: string;
        } | null = null;
        if (!branch) {
          try {
            toast.loading("Checking repository details...", {
              id: progressToastId,
            });
            repoDetails = await githubRepositoryService.getRepositoryInfo(
              repoInfo.owner,
              repoInfo.repo
            );
            branch = repoDetails?.defaultBranch || repoDetails?.default_branch;
          } catch (err) {
            logger.warn("Failed to fetch repo info, defaulting to main", err);
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
              setTimeout(() => {
                toast.loading(message, { id: progressToastId });
              }, 0);
            }
          }
        );

        toast.loading("Analyzing code...", { id: progressToastId });

        const analysisEngine = new EnhancedAnalysisEngine();
        const results = await analysisEngine.analyzeCodebase(zipFile);

        toast.loading("Saving analysis results...", { id: progressToastId });

        if (user?.uid) {
          const storageService = new GitHubAnalysisStorageService();
          await storageService.storeRepositoryAnalysis(user.uid, {
            name: repoInfo.repo,
            fullName: `${repoInfo.owner}/${repoInfo.repo}`,
            description:
              repoDetails?.description ||
              `Analysis of ${repoInfo.owner}/${repoInfo.repo}`,
            url: repoUrl,
            securityScore: results.summary.securityScore / 10,
            issuesFound: results.issues.length,
            criticalIssues: results.summary.criticalIssues,
            language:
              typeof results.languageDetection?.primaryLanguage === "string"
                ? results.languageDetection.primaryLanguage
                : results.languageDetection?.primaryLanguage?.name || "Unknown",
            stars: repoDetails?.stars || 0,
            forks: repoDetails?.forks || 0,
            duration: Number.parseFloat(results.analysisTime) || 0,
          });

          firebaseAnalysisStorage.setUserId(user.uid);
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
        }

        toast.success(
          `Analysis complete! Found ${results.issues.length} issues.`,
          {
            id: progressToastId,
            duration: 4000,
          }
        );

        setAnalysisResults(results);
        setAnalyzedRepoName(`${repoInfo.owner}/${repoInfo.repo}`);
        setSelectedTab("results");
        localStorage.setItem("github_selected_tab", "results");
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Analysis failed: ${errMsg}`, {
          id: progressToastId,
        });
        logger.error("Repository analysis failed:", error);
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to analyze repository: ${errMsg}`);
      logger.error("Error in handleAnalyzeRepository:", error);
    }
  };

  if (!user) {
    return (
      <div className="bg-background selection:bg-primary/20 selection:text-primary relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        {/* Industrial Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#ffffff_100%)] opacity-80 dark:bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]" />
        </div>

        <Card className="border-border/40 bg-card/80 relative z-10 w-full max-w-4xl overflow-hidden shadow-2xl backdrop-blur-sm dark:border-white/10 dark:bg-black/40">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col justify-center p-8 md:p-12">
              <div className="border-border/40 bg-muted/50 mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-lg dark:border-white/10 dark:bg-white/5">
                <Github className="text-foreground h-8 w-8 dark:text-white" />
              </div>

              <h1 className="font-display text-foreground mb-4 text-3xl font-bold tracking-tight md:text-4xl dark:text-white">
                GITHUB <span className="text-primary">ANALYSIS</span>
              </h1>
              <p className="text-muted-foreground mb-8 font-mono text-sm leading-relaxed dark:text-slate-400">
                CONNECT_GITHUB // ENABLE_ADVANCED_SECURITY_PROTOCOLS
                <br />
                System will perform automated vulnerability scanning on
                repositories.
              </p>

              <div className="space-y-4">
                <Button
                  onClick={signInWithGithub}
                  size="lg"
                  className="w-full border border-white/10 bg-[#24292F] font-bold text-white shadow-lg hover:bg-[#24292F]/80"
                >
                  <Github className="mr-2 h-5 w-5" />
                  Continue with GitHub
                </Button>

                {!user && (
                  <p className="text-muted-foreground text-center font-mono text-xs dark:text-slate-500">
                    NO_ACCOUNT?{" "}
                    <a
                      href="https://github.com/signup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 hover:underline"
                    >
                      INITIALIZE_REGISTRATION
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="border-border/40 bg-muted/30 flex flex-col justify-center border-l p-8 md:p-12 dark:border-white/10 dark:bg-black/20">
              <h3 className="font-display text-foreground mb-6 flex items-center gap-2 font-bold tracking-wide dark:text-white">
                <Shield className="text-primary h-5 w-5" />
                PREMIUM_MODULES
              </h3>

              <div className="space-y-6">
                {[
                  {
                    icon: BarChart3,
                    title: "DEEP_SCAN",
                    desc: "Comprehensive security scanning and code quality metrics",
                    color: "text-primary",
                  },
                  {
                    icon: Activity,
                    title: "REAL_TIME_MONITOR",
                    desc: "Monitor repository health and vulnerability patterns",
                    color: "text-primary",
                  },
                  {
                    icon: Lock,
                    title: "THREAT_PREVENTION",
                    desc: "Identify critical issues before they become threats",
                    color: "text-muted-foreground dark:text-slate-400",
                  },
                ].map((feature, i) => (
                  <div key={i} className="group flex gap-4">
                    <div
                      className={cn(
                        "group-hover:border-primary/30 border-border/40 bg-background flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border shadow-sm transition-colors dark:border-white/10 dark:bg-white/5",
                        feature.color
                      )}
                    >
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-foreground font-mono text-sm font-bold dark:text-white">
                        {feature.title}
                      </h4>
                      <p className="text-muted-foreground mt-1 text-xs leading-relaxed dark:text-slate-500">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-background text-foreground selection:bg-primary/20 selection:text-primary relative min-h-screen overflow-hidden">
      {/* Industrial Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />
      </div>

      <div className="relative z-10 bg-transparent">
        <GitHubRepositoryPermissionModal
          isOpen={showPermissionModal}
          email={userProfile?.email || ""}
          onAllow={handleAllowGitHubAccess}
          onDeny={handleDenyGitHubAccess}
          onClose={() => setShowPermissionModal(false)}
        />

        <GitHubUsernameInput
          isOpen={showUsernameInput}
          email={userProfile?.email || ""}
          onSuccess={handleManualUsernameSuccess}
          onSkip={handleSkipUsernameInput}
          onClose={() => setShowUsernameInput(false)}
        />

        {/* Hero Section */}
        <div className="relative border-b border-white/10">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
            <GitHubProfileHeader
              githubAvatarUrl={githubAvatarUrl}
              githubDisplayName={githubDisplayName}
              githubUsername={githubUsername}
              totalGitHubRepos={totalGitHubRepos}
              isLoadingProfile={isLoadingProfile}
              dashboardStats={dashboardStats}
              openConnectGitHubPrompt={openConnectGitHubPrompt}
            />

            <GitHubNavigationTabs
              selectedTab={selectedTab}
              setSelectedTab={handleTabChange}
              analysisResults={analysisResults}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Repository Selection Card */}
          {repositories.length > 0 && (
            <div className="mb-8">
              <Card className="border-white/10 bg-black/40 p-4 shadow-sm backdrop-blur-sm sm:p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-primary/10 border-primary/20 rounded-lg border p-2">
                      <Github className="text-primary h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-bold tracking-wide text-white">
                        ACTIVE REPOSITORIES
                      </h2>
                      <p className="font-mono text-xs break-words text-slate-400">
                        SELECT_TARGET // ({repositories.length} NODES_DETECTED)
                      </p>
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refreshRepositories?.()}
                      disabled={reposLoading}
                      className="w-full border-white/10 font-mono text-xs text-slate-300 hover:bg-white/5 sm:w-auto"
                    >
                      {reposLoading ? "SCANNING..." : "REFRESH_NODES"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowGitHubRepos(!showGitHubRepos)}
                      className="w-full border-white/10 font-mono text-xs text-slate-300 hover:bg-white/5 sm:w-auto"
                    >
                      {showGitHubRepos ? "HIDE_LIST" : "SHOW_LIST"}
                    </Button>
                  </div>
                </div>
                {showGitHubRepos && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <GitHubRepositoryList
                      repositories={repositories}
                      onAnalyzeRepository={handleAnalyzeRepository}
                      loading={reposLoading}
                    />
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Empty State / Connect Prompt */}
          {repositories.length === 0 &&
            !reposLoading &&
            !isGitHubUser &&
            !permissionGranted && (
              <div className="mb-8">
                <Card className="hover:border-primary/30 border-2 border-dashed border-white/10 bg-black/40 p-8 text-center backdrop-blur-sm transition-colors">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <Github className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-display mb-2 text-xl font-bold text-white">
                    CONNECT_GITHUB_ACCOUNT
                  </h3>
                  <p className="mx-auto mb-6 max-w-md font-mono text-xs text-slate-400">
                    Link your GitHub username to automatically load your
                    repositories for security analysis.
                  </p>
                  <Button
                    onClick={openConnectGitHubPrompt}
                    className="border border-white/20 bg-white/10 font-bold text-white hover:bg-white/20"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    INITIALIZE_CONNECTION
                  </Button>
                </Card>
              </div>
            )}

          {/* Loading Skeleton */}
          {reposLoading && repositories.length === 0 && (
            <div className="mb-8">
              <Card className="relative overflow-hidden border border-white/10 bg-black/40 p-6 backdrop-blur-sm sm:p-8">
                <div className="relative space-y-6">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <Skeleton className="h-16 w-16 rounded-full bg-white/5" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48 bg-white/5" />
                      <Skeleton className="h-3 w-32 bg-white/5" />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`repo-skeleton-${index}`}
                        className="rounded-xl border border-white/5 bg-white/5 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-9 w-9 rounded bg-white/10" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-3/4 bg-white/10" />
                            <Skeleton className="h-2 w-1/2 bg-white/10" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div className="space-y-6">
            {selectedTab === "overview" && (
              <div className="animate-in fade-in space-y-8 duration-500">
                <SecurityAnalyticsSection userId={user.uid} />
                <RepositoryActivityAnalytics userId={user.uid} />
              </div>
            )}

            {selectedTab === "repositories" && (
              <div className="animate-in fade-in duration-500">
                <RepositoryAnalysisGrid
                  userId={user.uid}
                  liveRepositories={repositories}
                  onAnalyzeRepository={handleAnalyzeRepository}
                  isLoadingLive={reposLoading}
                />
              </div>
            )}

            {selectedTab === "history" && (
              <div className="animate-in fade-in duration-500">
                <AnalysisHistorySection userId={user.uid} />
              </div>
            )}

            {selectedTab === "analytics" && (
              <div className="animate-in fade-in space-y-8 duration-500">
                <SecurityAnalyticsSection userId={user.uid} detailed />
                <RepositoryActivityAnalytics userId={user.uid} detailed />
              </div>
            )}

            {selectedTab === "comparison" && (
              <div className="animate-in fade-in duration-500">
                <RepositoryComparisonTool userId={user.uid} />
              </div>
            )}

            {selectedTab === "quality" && (
              <div className="animate-in fade-in duration-500">
                <CodeQualityAnalytics userId={user.uid} />
              </div>
            )}

            {selectedTab === "patterns" && (
              <div className="animate-in fade-in duration-500">
                <VulnerabilityPatternAnalytics userId={user.uid} />
              </div>
            )}

            {selectedTab === "results" && analysisResults && (
              <div className="animate-in fade-in space-y-6 duration-500">
                {/* Results Header Card */}
                <Card className="relative overflow-hidden border-white/10 bg-black/40 p-4 shadow-sm backdrop-blur-sm sm:p-6">
                  {/* Glow effect */}
                  <div className="bg-primary/5 pointer-events-none absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full blur-3xl" />

                  <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                      <div className="border-primary/30 flex h-14 w-14 items-center justify-center rounded-2xl border bg-black/40 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)] sm:h-16 sm:w-16">
                        <FileCode className="text-primary h-8 w-8" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-display mb-1 text-xl font-bold tracking-wide text-white sm:text-2xl">
                          ANALYSIS RESULTS
                        </h2>
                        <div className="flex min-w-0 items-center gap-2 font-mono text-xs text-slate-400">
                          <GitBranch className="h-3 w-3" />
                          <span className="truncate">{analyzedRepoName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-6">
                      <div className="text-left sm:text-right">
                        <div className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                          {analysisResults.summary.securityScore}
                          <span className="text-xl font-medium text-slate-500">
                            /100
                          </span>
                        </div>
                        <div className="text-primary font-mono text-xs font-bold tracking-wider uppercase">
                          Security Score
                        </div>
                      </div>
                      <div className="hidden h-12 w-px bg-white/10 sm:block" />
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAnalysisResults(null);
                          setAnalyzedRepoName("");
                          setSelectedTab("overview");
                        }}
                        className="w-full border-white/10 text-slate-300 hover:bg-white/5 sm:w-auto"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        BACK_TO_DASHBOARD
                      </Button>
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
                    {[
                      {
                        label: "Critical",
                        value: analysisResults.summary.criticalIssues,
                        color: "red",
                      },
                      {
                        label: "High",
                        value: analysisResults.summary.highIssues,
                        color: "orange",
                      },
                      {
                        label: "Medium",
                        value: analysisResults.summary.mediumIssues,
                        color: "yellow",
                      },
                      {
                        label: "Low",
                        value: analysisResults.summary.lowIssues,
                        color: "blue",
                      },
                      {
                        label: "Files",
                        value: analysisResults.totalFiles,
                        color: "slate",
                      },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-lg border bg-black/20 p-4 backdrop-blur-sm transition-all",
                          stat.color === "red" &&
                            "border-red-500/30 text-red-500",
                          stat.color === "orange" &&
                            "border-orange-500/30 text-orange-500",
                          stat.color === "yellow" &&
                            "border-amber-500/30 text-amber-500",
                          stat.color === "blue" &&
                            "border-emerald-500/30 text-emerald-500",
                          stat.color === "slate" &&
                            "border-white/10 text-slate-400"
                        )}
                      >
                        <div className="font-display mb-1 text-2xl font-bold">
                          {stat.value}
                        </div>
                        <div className="font-mono text-[10px] font-bold tracking-wider uppercase opacity-80">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Detailed Results */}
                <Suspense
                  fallback={
                    <div className="flex flex-col items-center justify-center py-12">
                      <Terminal className="text-primary/50 mb-4 h-12 w-12 animate-pulse" />
                      <p className="font-mono text-sm text-slate-400">
                        DECRYPTING_RESULTS...
                      </p>
                    </div>
                  }
                >
                  <EnhancedSecurityResults results={analysisResults} />
                </Suspense>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
