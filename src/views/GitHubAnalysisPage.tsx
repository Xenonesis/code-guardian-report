"use client";

import React, { useEffect, useState, Suspense, lazy } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigation } from "@/lib/navigation-context";
import { AnimatedBackground } from "@/components/pages/about/AnimatedBackground";
import {
  Github,
  TrendingUp,
  Shield,
  Activity,
  GitBranch,
  BarChart3,
  Code2,
  AlertTriangle,
  ArrowLeft,
  FileCode,
  Lock,
  ExternalLink,
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
import { AnalysisResults } from "@/hooks/useAnalysis";
import { cn } from "@/lib/utils";

// Lazy load the results component for better performance
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
  const [showGitHubRepos, setShowGitHubRepos] = useState(false);
  const [analysisResults, setAnalysisResults] =
    useState<AnalysisResults | null>(null);
  const [analyzedRepoName, setAnalyzedRepoName] = useState<string>("");
  const [dashboardStats, setDashboardStats] = useState({
    repoCount: 0,
    avgScore: 0,
    totalIssues: 0,
    loading: true,
  });

  // Fetch dashboard stats
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

  // GitHub repositories integration - now always enabled for authenticated users
  const {
    repositories,
    loading: reposLoading,
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
    enabled: !!user && !isGitHubUser, // For non-GitHub OAuth users
  });

  // Auto-fetch GitHub data for GitHub authenticated users
  useEffect(() => {
    const autoFetchGitHubData = async () => {
      if (!isGitHubUser || !userProfile?.githubUsername) return;

      // For GitHub users, automatically set their username to trigger repo fetch
      const storedUsername = localStorage.getItem("github_username");
      if (storedUsername !== userProfile.githubUsername) {
        localStorage.setItem("github_username", userProfile.githubUsername);
        localStorage.setItem("github_repo_permission", "granted");
        await setManualUsername(userProfile.githubUsername);
        logger.debug(
          "Auto-fetched GitHub data for:",
          userProfile.githubUsername
        );
      }
    };

    autoFetchGitHubData();
  }, [isGitHubUser, userProfile?.githubUsername, setManualUsername]);

  // Derive header profile view
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

  // Show permission modal logic
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

  // Show username input logic
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

  const handleAnalyzeRepository = async (repoUrl: string, repoName: string) => {
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

  // Not signed in with GitHub and no permission granted
  if (!isGitHubUser && !permissionGranted && !user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-4 dark:bg-slate-950">
        {/* Background Elements */}
        <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-blue-500/10 blur-[100px] dark:bg-blue-500/10" />
          <div className="absolute top-[40%] -right-[10%] h-[40%] w-[40%] rounded-full bg-purple-500/10 blur-[100px] dark:bg-purple-500/10" />
        </div>

        <Card className="w-full max-w-4xl overflow-hidden border-0 bg-white/80 p-0 shadow-2xl ring-1 ring-slate-200 backdrop-blur-xl dark:bg-slate-900/80 dark:ring-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col justify-center p-8 md:p-12">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 shadow-lg dark:from-white dark:to-slate-300">
                <Github className="h-8 w-8 text-white dark:text-slate-900" />
              </div>

              <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                GitHub Analysis
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                Connect your GitHub account to unlock advanced security
                insights, repository tracking, and automated code analysis.
              </p>

              <div className="space-y-4">
                <Button
                  onClick={signInWithGithub}
                  size="lg"
                  className="h-12 w-full bg-[#24292F] text-base text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#24292F]/90 hover:shadow-xl dark:bg-white dark:text-[#24292F] dark:hover:bg-white/90"
                >
                  <Github className="mr-2 h-5 w-5" />
                  Continue with GitHub
                </Button>

                {!user && (
                  <p className="text-center text-sm text-slate-500">
                    Don't have an account?{" "}
                    <a
                      href="https://github.com/signup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Sign up
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center border-l border-slate-200 bg-slate-50 p-8 md:p-12 dark:border-slate-800 dark:bg-slate-800/50">
              <h3 className="mb-6 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <Shield className="h-5 w-5 text-blue-500" />
                Premium Features
              </h3>

              <div className="space-y-6">
                {[
                  {
                    icon: BarChart3,
                    title: "Deep Analysis",
                    desc: "Comprehensive security scanning and code quality metrics",
                    color: "text-blue-500",
                  },
                  {
                    icon: Activity,
                    title: "Real-time Tracking",
                    desc: "Monitor repository health and vulnerability patterns",
                    color: "text-green-500",
                  },
                  {
                    icon: Lock,
                    title: "Security First",
                    desc: "Identify critical issues before they become threats",
                    color: "text-purple-500",
                  },
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div
                      className={cn(
                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800",
                        feature.color
                      )}
                    >
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {feature.title}
                      </h4>
                      <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
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
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-slate-950">
      <AnimatedBackground />
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
        <div className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              {/* Profile Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  {githubAvatarUrl ? (
                    <img
                      src={githubAvatarUrl}
                      alt={githubDisplayName || "User"}
                      className="h-20 w-20 rounded-2xl object-cover shadow-lg ring-4 ring-white dark:ring-slate-800"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg ring-4 ring-white dark:from-slate-800 dark:to-slate-700 dark:ring-slate-800">
                      <Github className="h-10 w-10 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute -right-2 -bottom-2 rounded-full bg-white p-1.5 shadow-md ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                    <Github className="h-4 w-4 text-slate-900 dark:text-white" />
                  </div>
                </div>

                <div>
                  <h1 className="mb-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {isLoadingProfile ? (
                      <span className="inline-block h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    ) : (
                      githubDisplayName || "GitHub User"
                    )}
                  </h1>
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    {isLoadingProfile ? (
                      <span className="inline-block h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    ) : githubUsername ? (
                      <a
                        href={`https://github.com/${githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        @{githubUsername}
                        <ExternalLink className="h-3 w-3 opacity-50" />
                      </a>
                    ) : (
                      <button
                        onClick={openConnectGitHubPrompt}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Connect GitHub Profile
                      </button>
                    )}
                    {totalGitHubRepos > 0 && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span>{totalGitHubRepos} repositories</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 lg:min-w-[500px]">
                {[
                  {
                    label: "Analyzed",
                    value: dashboardStats.repoCount,
                    sub: "repos",
                    color: "blue",
                  },
                  {
                    label: "Score",
                    value: dashboardStats.avgScore.toFixed(1),
                    sub: "/10",
                    color: "green",
                  },
                  {
                    label: "Issues",
                    value: dashboardStats.totalIssues,
                    sub: "total",
                    color: "orange",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
                      {stat.label}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={cn("text-2xl font-bold", {
                          "text-blue-600 dark:text-blue-400":
                            stat.color === "blue",
                          "text-emerald-600 dark:text-emerald-400":
                            stat.color === "green",
                          "text-orange-600 dark:text-orange-400":
                            stat.color === "orange",
                        })}
                      >
                        {dashboardStats.loading ? "..." : stat.value}
                      </span>
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {stat.sub}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="scrollbar-hide mt-12 flex items-center gap-1 overflow-x-auto pb-2">
              {[
                { id: "overview", icon: TrendingUp, label: "Overview" },
                { id: "repositories", icon: GitBranch, label: "Repositories" },
                { id: "history", icon: Activity, label: "History" },
                { id: "analytics", icon: Shield, label: "Analytics" },
                { id: "comparison", icon: BarChart3, label: "Compare" },
                { id: "quality", icon: Code2, label: "Quality" },
                { id: "patterns", icon: AlertTriangle, label: "Patterns" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setSelectedTab(
                      tab.id as
                        | "overview"
                        | "repositories"
                        | "history"
                        | "analytics"
                        | "comparison"
                        | "quality"
                        | "patterns"
                        | "results"
                    )
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all",
                    selectedTab === tab.id
                      ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}

              {analysisResults && (
                <>
                  <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />
                  <button
                    onClick={() => setSelectedTab("results")}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all",
                      selectedTab === "results"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                    )}
                  >
                    <FileCode className="h-4 w-4" />
                    Results
                    <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">
                      {analysisResults.issues.length}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* GitHub Repositories Section - Always show for authenticated users with repos */}
          {repositories.length > 0 && (
            <div className="mb-8">
              <Card className="border-slate-200 p-6 shadow-sm dark:border-slate-800">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                      <Github className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Your GitHub Repositories
                      </h2>
                      <p className="text-sm text-slate-500">
                        Select a repository to analyze ({repositories.length}{" "}
                        repos)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refreshRepositories?.()}
                      disabled={reposLoading}
                    >
                      {reposLoading ? "Loading..." : "Refresh"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowGitHubRepos(!showGitHubRepos)}
                    >
                      {showGitHubRepos ? "Hide List" : "Show List"}
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

          <div className="space-y-6">
            {selectedTab === "overview" && (
              <div className="animate-in fade-in space-y-8 duration-500">
                <SecurityAnalyticsSection userId={user.uid} />
                <RepositoryActivityAnalytics userId={user.uid} />
              </div>
            )}

            {selectedTab === "repositories" && (
              <div className="animate-in fade-in duration-500">
                <RepositoryAnalysisGrid userId={user.uid} />
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
                {/* Results Header */}
                <Card className="relative overflow-hidden border-slate-200 p-6 shadow-sm dark:border-slate-800">
                  <div className="pointer-events-none absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />

                  <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div className="flex items-center gap-5">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                        <FileCode className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h2 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">
                          Analysis Results
                        </h2>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <GitBranch className="h-4 w-4" />
                          {analyzedRepoName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                          {analysisResults.summary.securityScore}
                          <span className="text-xl font-medium text-slate-400">
                            /100
                          </span>
                        </div>
                        <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          Security Score
                        </div>
                      </div>
                      <div className="h-12 w-px bg-slate-200 dark:bg-slate-700" />
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAnalysisResults(null);
                          setAnalyzedRepoName("");
                          setSelectedTab("overview");
                        }}
                        className="hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
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
                          "rounded-xl border p-4 transition-all",
                          stat.color === "red" &&
                            "border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10",
                          stat.color === "orange" &&
                            "border-orange-100 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-900/10",
                          stat.color === "yellow" &&
                            "border-yellow-100 bg-yellow-50 dark:border-yellow-900/30 dark:bg-yellow-900/10",
                          stat.color === "blue" &&
                            "border-blue-100 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10",
                          stat.color === "slate" &&
                            "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50"
                        )}
                      >
                        <div
                          className={cn(
                            "mb-1 text-2xl font-bold",
                            stat.color === "red" &&
                              "text-red-600 dark:text-red-400",
                            stat.color === "orange" &&
                              "text-orange-600 dark:text-orange-400",
                            stat.color === "yellow" &&
                              "text-yellow-600 dark:text-yellow-400",
                            stat.color === "blue" &&
                              "text-blue-600 dark:text-blue-400",
                            stat.color === "slate" &&
                              "text-slate-600 dark:text-slate-400"
                          )}
                        >
                          {stat.value}
                        </div>
                        <div
                          className={cn(
                            "text-xs font-semibold tracking-wider uppercase",
                            stat.color === "red" &&
                              "text-red-700 dark:text-red-300",
                            stat.color === "orange" &&
                              "text-orange-700 dark:text-orange-300",
                            stat.color === "yellow" &&
                              "text-yellow-700 dark:text-yellow-300",
                            stat.color === "blue" &&
                              "text-blue-700 dark:text-blue-300",
                            stat.color === "slate" &&
                              "text-slate-500 dark:text-slate-500"
                          )}
                        >
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
                      <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                      <p className="text-slate-500">
                        Loading detailed analysis...
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
