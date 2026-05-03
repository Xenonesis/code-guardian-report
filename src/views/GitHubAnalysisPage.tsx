"use client";

import React, { useEffect, useState, Suspense, lazy, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigation } from "@/lib/navigation-context";
import {
  GitFork,
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
    "overview" | "repositories" | "results"
  >(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("github_selected_tab")
        : null;
    return (stored as "overview" | "repositories" | "results") || "overview";
  });
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showUsernameInput, setShowUsernameInput] = useState(false);
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
    // Dashboard stats loading disabled - Firebase removed
    setDashboardStats((prev) => ({ ...prev, loading: false }));
  }, [user]);

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
    githubUsername: hookGithubUsername,
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

  // Track whether we've already initiated a fetch for the current username to
  // prevent duplicate calls from React Strict Mode double-invocation or dep re-runs.
  const fetchInitiatedRef = useRef<string | null>(null);

  useEffect(() => {
    const autoFetchGitHubData = async () => {
      if (!isGitHubUser) return;

      const username =
        userProfile?.githubUsername ||
        userProfile?.githubMetadata?.login ||
        null;

      if (!username) return;

      if (!isValidGitHubUsername(username)) {
        const storedUsername = localStorage.getItem("github_username");
        if (storedUsername === username) {
          localStorage.removeItem("github_username");
          localStorage.removeItem("github_repo_permission");
        }
        return;
      }

      // Always keep localStorage in sync with the resolved username
      localStorage.setItem("github_username", username);
      localStorage.setItem("github_repo_permission", "granted");

      // If the hook already has this username from its own localStorage init,
      // no need to call setManualUsername — it already fetched or is fetching.
      if (hookGithubUsername === username) return;

      // Guard against Strict Mode double-invocation for the same username
      if (fetchInitiatedRef.current === username) return;
      fetchInitiatedRef.current = username;

      const success = await setManualUsername(username);
      if (success) {
        logger.debug("Auto-fetched GitHub data for:", username);
      }
    };

    autoFetchGitHubData();
  }, [
    isGitHubUser,
    userProfile?.githubUsername,
    userProfile?.githubMetadata?.login,
    hookGithubUsername,
    setManualUsername,
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
    setSelectedTab("repositories");
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
    setSelectedTab("repositories");
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
      <div className="bg-background selection:bg-primary/20 selection:text-primary relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden p-4">
        {/* Premium Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
          <div className="from-background via-background/90 to-background/50 absolute inset-0 bg-gradient-to-tr" />
          <div className="bg-primary/20 pointer-events-none absolute -top-1/4 -left-1/4 h-[800px] w-[800px] rounded-full blur-[150px]" />
          <div className="pointer-events-none absolute -right-1/4 -bottom-1/4 h-[800px] w-[800px] rounded-full bg-purple-500/10 blur-[150px]" />
        </div>

        <Card className="border-border/30 bg-background/60 relative z-10 w-full max-w-5xl overflow-hidden shadow-2xl backdrop-blur-2xl">
          <div className="grid grid-cols-1 md:grid-cols-5">
            <div className="col-span-3 flex flex-col justify-center p-8 md:p-16">
              <div className="border-primary/20 bg-primary/10 mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-lg">
                <GitFork className="text-primary h-8 w-8" />
              </div>

              <h1 className="font-display text-foreground mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                GitHub{" "}
                <span className="from-primary bg-gradient-to-r to-purple-500 bg-clip-text text-transparent">
                  Analysis
                </span>
              </h1>
              <p className="text-muted-foreground mb-10 max-w-md text-lg leading-relaxed">
                Connect your GitHub account to enable advanced security
                protocols and perform automated vulnerability scanning on your
                repositories.
              </p>

              <div className="max-w-sm space-y-4">
                <Button
                  onClick={signInWithGithub}
                  size="lg"
                  className="bg-foreground text-background hover:bg-foreground/90 w-full font-semibold shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <GitFork className="mr-2 h-5 w-5" />
                  Authenticate with GitHub
                </Button>

                <p className="text-muted-foreground text-center text-sm">
                  Don't have an account?{" "}
                  <a
                    href="https://github.com/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline"
                  >
                    Sign up for GitHub
                  </a>
                </p>
              </div>
            </div>

            <div className="border-border/30 bg-muted/20 col-span-2 flex flex-col justify-center border-l p-8 md:p-12">
              <h3 className="font-display text-foreground mb-8 flex items-center gap-2 text-lg font-semibold tracking-wide">
                <Shield className="text-primary h-5 w-5" />
                Premium Features
              </h3>

              <div className="space-y-8">
                {[
                  {
                    icon: BarChart3,
                    title: "Deep Security Scan",
                    desc: "Comprehensive security scanning and code quality metrics for all your repositories.",
                    color: "text-blue-500",
                    bg: "bg-blue-500/10",
                    border: "border-blue-500/20",
                  },
                  {
                    icon: Activity,
                    title: "Real-time Monitoring",
                    desc: "Monitor repository health and vulnerability patterns as they emerge.",
                    color: "text-primary",
                    bg: "bg-primary/10",
                    border: "border-primary/20",
                  },
                  {
                    icon: Lock,
                    title: "Threat Prevention",
                    desc: "Identify critical issues and architectural flaws before they become threats.",
                    color: "text-purple-500",
                    bg: "bg-purple-500/10",
                    border: "border-purple-500/20",
                  },
                ].map((feature, i) => (
                  <div key={i} className="group flex gap-5">
                    <div
                      className={cn(
                        "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110",
                        feature.bg,
                        feature.border
                      )}
                    >
                      <feature.icon className={cn("h-6 w-6", feature.color)} />
                    </div>
                    <div>
                      <h4 className="text-foreground text-base font-semibold">
                        {feature.title}
                      </h4>
                      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
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

  return (
    <div className="bg-background text-foreground selection:bg-primary/20 selection:text-primary relative min-h-screen overflow-hidden">
      {/* Industrial Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)] opacity-80 dark:bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]" />
        <div className="bg-primary/5 pointer-events-none absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full blur-[120px]" />
        <div className="bg-primary/5 pointer-events-none absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full blur-[120px]" />
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
        <div className="border-border/50 relative border-b dark:border-white/10">
          <div className="bg-background/40 absolute inset-0 backdrop-blur-sm dark:bg-black/40" />

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
          {/* Missing GitHub Account Premium Dashboard State */}
          {!isGitHubUser &&
            !hasGitHubAccount &&
            !permissionGranted &&
            !reposLoading &&
            repositories.length === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 mb-8 duration-700">
                <Card className="border-border/40 bg-background/60 relative overflow-hidden p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12">
                  <div className="bg-primary/5 pointer-events-none absolute inset-0" />
                  <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
                    <div className="border-primary/20 bg-primary/10 ring-primary/5 mb-6 flex h-24 w-24 items-center justify-center rounded-full border shadow-lg ring-8">
                      <GitFork className="text-primary h-12 w-12" />
                    </div>
                    <h2 className="font-display text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                      Connect Your Workspace
                    </h2>
                    <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                      You're logged in, but your GitHub account isn't connected
                      yet. Link your account to instantly unlock deep security
                      scanning, vulnerability analysis, and real-time repository
                      monitoring.
                    </p>
                    <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
                      <Button
                        onClick={openConnectGitHubPrompt}
                        size="lg"
                        className="bg-foreground text-background hover:bg-foreground/90 w-full font-semibold shadow-xl transition-all duration-300 hover:-translate-y-1 sm:w-auto"
                      >
                        <GitFork className="mr-2 h-5 w-5" />
                        Connect GitHub Account
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

          {/* Loading Skeleton */}
          {reposLoading && repositories.length === 0 && (
            <div className="mb-8">
              <Card className="border-border/50 bg-background/40 relative overflow-hidden border p-6 backdrop-blur-sm sm:p-8 dark:border-white/10 dark:bg-black/40">
                <div className="relative space-y-6">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <Skeleton className="bg-muted/50 h-16 w-16 rounded-full dark:bg-white/5" />
                    <div className="space-y-2">
                      <Skeleton className="bg-muted/50 h-4 w-48 dark:bg-white/5" />
                      <Skeleton className="bg-muted/50 h-3 w-32 dark:bg-white/5" />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`repo-skeleton-${index}`}
                        className="border-border/50 bg-muted/50 rounded-xl border p-4 dark:border-white/5 dark:bg-white/5"
                      >
                        <div className="flex items-start gap-3">
                          <Skeleton className="bg-muted h-9 w-9 rounded dark:bg-white/10" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="bg-muted h-3 w-3/4 dark:bg-white/10" />
                            <Skeleton className="bg-muted h-2 w-1/2 dark:bg-white/10" />
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
            {selectedTab === "overview" && repositories.length > 0 && (
              <div className="animate-in fade-in space-y-6 duration-500">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card className="border-border/40 bg-background/40 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
                    <h3 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold">
                      <Activity className="text-primary h-5 w-5" />
                      Activity Overview
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Select the Repositories tab to view and analyze your code.
                      We currently track {repositories.length} repositories
                      across your account.
                    </p>
                    <Button
                      variant="outline"
                      className="border-border/50 mt-6 w-full sm:w-auto"
                      onClick={() => handleTabChange("repositories")}
                    >
                      <GitFork className="mr-2 h-4 w-4" />
                      View Repositories
                    </Button>
                  </Card>

                  <Card className="border-border/40 bg-background/40 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
                    <h3 className="font-display mb-4 flex items-center gap-2 text-lg font-semibold">
                      <Shield className="text-primary h-5 w-5" />
                      Security Posture
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Run deep security scans on your repositories to detect
                      vulnerabilities, secrets, and architectural flaws.
                    </p>
                    <Button
                      variant="outline"
                      className="border-border/50 mt-6 w-full sm:w-auto"
                      onClick={() => handleTabChange("repositories")}
                    >
                      Start Analysis
                    </Button>
                  </Card>
                </div>
              </div>
            )}

            {selectedTab === "repositories" && (
              <div className="animate-in fade-in duration-500">
                {repositories.length > 0 && (
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-primary/10 border-primary/20 rounded-lg border p-2">
                        <GitFork className="text-primary h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-display text-foreground text-lg font-bold tracking-wide">
                          ACTIVE REPOSITORIES
                        </h2>
                        <p className="text-muted-foreground truncate text-sm">
                          Select a repository to begin analysis
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refreshRepositories?.()}
                        disabled={reposLoading}
                        className="border-border/50 text-foreground/80 hover:bg-muted w-full transition-all active:scale-95 sm:w-auto"
                      >
                        {reposLoading ? "Refreshing..." : "Refresh Nodes"}
                      </Button>
                    </div>
                  </div>
                )}

                <GitHubRepositoryList
                  repositories={repositories}
                  onAnalyzeRepository={handleAnalyzeRepository}
                  loading={reposLoading}
                />
              </div>
            )}

            {selectedTab === "results" && analysisResults && (
              <div className="animate-in fade-in space-y-6 duration-500">
                {/* Results Header Card */}
                <Card className="border-border/50 bg-background/40 relative overflow-hidden p-4 shadow-sm backdrop-blur-sm sm:p-6 dark:border-white/10 dark:bg-black/40">
                  {/* Glow effect */}
                  <div className="bg-primary/5 pointer-events-none absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full blur-3xl" />

                  <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                      <div className="border-primary/30 bg-background/40 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-transform hover:scale-105 sm:h-16 sm:w-16 dark:bg-black/40">
                        <FileCode className="text-primary h-8 w-8 animate-pulse" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-display text-foreground mb-1 text-xl font-bold tracking-wide sm:text-2xl dark:text-white">
                          ANALYSIS RESULTS
                        </h2>
                        <div className="text-muted-foreground flex min-w-0 items-center gap-2 font-mono text-xs dark:text-slate-400">
                          <GitBranch className="h-3 w-3" />
                          <span className="truncate">{analyzedRepoName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-6">
                      <div className="text-left sm:text-right">
                        <div className="font-display text-foreground text-3xl font-bold tracking-tight sm:text-4xl dark:text-white">
                          {analysisResults.summary.securityScore}
                          <span className="text-muted-foreground text-xl font-medium dark:text-slate-500">
                            /100
                          </span>
                        </div>
                        <div className="text-primary font-mono text-xs font-bold tracking-wider uppercase">
                          Security Score
                        </div>
                      </div>
                      <div className="bg-border/50 hidden h-12 w-px sm:block dark:bg-white/10" />
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAnalysisResults(null);
                          setAnalyzedRepoName("");
                          setSelectedTab("repositories");
                        }}
                        className="border-border/50 text-muted-foreground hover:bg-muted/50 w-full transition-all duration-300 hover:scale-105 active:scale-95 sm:w-auto dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
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
                          "bg-background/20 rounded-lg border p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-black/20",
                          stat.color === "red" &&
                            "border-red-500/30 text-red-500 hover:border-red-500/50 hover:shadow-red-500/20",
                          stat.color === "orange" &&
                            "border-orange-500/30 text-orange-500 hover:border-orange-500/50 hover:shadow-orange-500/20",
                          stat.color === "yellow" &&
                            "border-amber-500/30 text-amber-500 hover:border-amber-500/50 hover:shadow-amber-500/20",
                          stat.color === "blue" &&
                            "border-emerald-500/30 text-emerald-500 hover:border-emerald-500/50 hover:shadow-emerald-500/20",
                          stat.color === "slate" &&
                            "border-border/50 text-muted-foreground hover:shadow-border/20 hover:border-border/80 dark:border-white/10 dark:text-slate-400"
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
                      <p className="text-muted-foreground font-mono text-sm dark:text-slate-400">
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
