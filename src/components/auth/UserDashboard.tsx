// components/user-dashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigation } from "@/lib/navigation-context";
import { useGitHubRepositories } from "@/hooks/useGitHubRepositories";
import GitHubRepositoryPermissionModal from "@/components/github/GitHubRepositoryPermissionModal";
import GitHubRepositoryList from "@/components/github/GitHubRepositoryList";
import GitHubUsernameInput from "@/components/github/GitHubUsernameInput";
import { GitFork } from "lucide-react";
import { toast } from "sonner";

import { logger } from "@/utils/logger";

const UserDashboard: React.FC = () => {
  const { user, userProfile, logout } = useAuth();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [showGitHubRepos, setShowGitHubRepos] = useState(false);

  const getGithubAvatarUrl = () => {
    const githubProvider = user?.providerData?.find(
      (p) => p.providerId === "github.com"
    );
    const githubUserId = githubProvider?.uid;

    return (
      githubProvider?.photoURL ||
      user?.photoURL ||
      userProfile?.githubMetadata?.avatarUrl ||
      (githubUserId
        ? `https://avatars.githubusercontent.com/u/${githubUserId}`
        : null)
    );
  };

  // GitHub repositories integration
  const {
    repositories,
    loading: reposLoading,
    error: _reposError,
    hasGitHubAccount,
    permissionGranted,
    permissionDenied,
    grantPermission,
    denyPermission,
    revokePermission: _revokePermission,
    setManualUsername,
  } = useGitHubRepositories({
    email: userProfile?.email || null,
    enabled: !userProfile?.isGitHubUser, // For email/password users linking GitHub
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      logger.error("Error signing out:", error);
    }
  };

  // Show permission modal if user has GitHub account but hasn't granted/denied permission
  useEffect(() => {
    if (
      hasGitHubAccount &&
      !permissionGranted &&
      !permissionDenied &&
      !userProfile?.isGitHubUser
    ) {
      // Delay showing the modal by 2 seconds to not overwhelm the user immediately
      const timer = setTimeout(() => {
        setShowPermissionModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [
    hasGitHubAccount,
    permissionGranted,
    permissionDenied,
    userProfile?.isGitHubUser,
  ]);

  // Show username input if no GitHub account detected but user wants to connect
  useEffect(() => {
    if (
      !hasGitHubAccount &&
      !permissionGranted &&
      !permissionDenied &&
      !userProfile?.isGitHubUser &&
      userProfile?.email
    ) {
      // Check if we should prompt for manual username input
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
    userProfile?.isGitHubUser,
    userProfile?.email,
  ]);

  const handleAllowGitHubAccess = async () => {
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
    setShowUsernameInput(false);
    const t = toast.loading("Fetching your repositories...");
    await setManualUsername(username);
    toast.success("GitHub repositories loaded successfully!", { id: t });
    setShowGitHubRepos(true);
  };

  const handleSkipUsernameInput = () => {
    setShowUsernameInput(false);
    localStorage.setItem("github_repo_permission", "denied");
    toast.info("You can connect your GitHub account later from settings.");
  };

  const { navigateTo, setCurrentSection, setCurrentTab } = useNavigation();

  const handleAnalyzeRepository = async (repoUrl: string, repoName: string) => {
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

      const toastId = toast.loading(`Analyzing ${repoName}...`);

      try {
        // Ensure branch
        let branch = repoInfo.branch;
        if (!branch) {
          try {
            const details = await githubRepositoryService.getRepositoryInfo(
              repoInfo.owner,
              repoInfo.repo
            );
            branch = details.defaultBranch;
          } catch {
            branch = "main";
          }
        }

        // Download ZIP with progress updates (throttled)
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
              setTimeout(() => toast.loading(message, { id: toastId }), 0);
            }
          }
        );

        // Analyze
        toast.loading("Analyzing code...", { id: toastId });
        const engine = new EnhancedAnalysisEngine();
        const results = await engine.analyzeCodebase(zipFile);

        toast.success(
          `Analysis complete! Found ${results.issues.length} issues.`,
          { id: toastId, duration: 2000 }
        );
        // Navigate to GitHub Analysis page Analytics tab
        localStorage.setItem("github_selected_tab", "analytics");
        if (navigateTo) {
          navigateTo("github-analysis", "analytics");
        } else {
          setCurrentSection?.("github-analysis");
          setCurrentTab?.("analytics");
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        toast.error(`Analysis failed: ${errMsg}`, {
          id: toastId,
        });
        logger.error("Repository analysis failed:", err);
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to analyze repository: ${errMsg}`);
      logger.error("Error in handleAnalyzeRepository:", error);
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Access Denied</h2>
          <p>Please sign in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 text-foreground dark:text-muted-foreground min-h-screen dark:bg-gradient-to-br dark:from-[#0d0d1f] dark:via-[#1b1b3a] dark:to-[#0d0d1f]">
      {/* GitHub Permission Modal */}
      <GitHubRepositoryPermissionModal
        isOpen={showPermissionModal}
        email={userProfile?.email || ""}
        onAllow={handleAllowGitHubAccess}
        onDeny={handleDenyGitHubAccess}
        onClose={() => setShowPermissionModal(false)}
      />

      {/* GitHub Username Input Modal */}
      <GitHubUsernameInput
        isOpen={showUsernameInput}
        email={userProfile?.email || ""}
        onSuccess={handleManualUsernameSuccess}
        onSkip={handleSkipUsernameInput}
        onClose={() => setShowUsernameInput(false)}
      />

      <header className="border-border bg-card border-b shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-3 py-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              {/* GitHub Profile Avatar Only */}
              {getGithubAvatarUrl() ? (
                <img
                  src={getGithubAvatarUrl() as string}
                  alt="Profile"
                  className="h-12 w-12 rounded-full border-2 border-purple-500 shadow-md"
                />
              ) : null}
            </div>
            <button
              onClick={handleLogout}
              className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none sm:w-auto"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* GitHub Repositories Section - Show if permission granted */}
        {permissionGranted && repositories.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <GitFork className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <h2 className="text-foreground text-lg font-bold sm:text-xl dark:text-white">
                  Your GitHub Repositories
                </h2>
                <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                  {repositories.length} repos
                </span>
              </div>
              <button
                onClick={() => setShowGitHubRepos(!showGitHubRepos)}
                className="hover:text-muted-foreground text-sm text-purple-600 transition-colors dark:text-purple-400 dark:hover:text-purple-300"
              >
                {showGitHubRepos ? "Hide" : "Show"}
              </button>
            </div>

            {showGitHubRepos && (
              <GitHubRepositoryList
                repositories={repositories}
                onAnalyzeRepository={handleAnalyzeRepository}
                loading={reposLoading}
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Profile and Stats */}
          <div className="space-y-6 lg:col-span-1">
            <div className="border-border rounded-lg border bg-white p-6 shadow dark:border-transparent dark:bg-[#252538]">
              {/* Profile Avatar Only */}
              {getGithubAvatarUrl() ? (
                <div className="flex justify-center">
                  <img
                    src={getGithubAvatarUrl() as string}
                    alt="Profile"
                    className="h-20 w-20 rounded-full border-4 border-purple-500 shadow-lg"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
