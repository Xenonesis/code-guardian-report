// components/user-dashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigation } from "@/lib/navigation-context";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useGitHubRepositories } from "@/hooks/useGitHubRepositories";
import GitHubRepositoryPermissionModal from "@/components/github/GitHubRepositoryPermissionModal";
import GitHubRepositoryList from "@/components/github/GitHubRepositoryList";
import GitHubUsernameInput from "@/components/github/GitHubUsernameInput";
import { Github } from "lucide-react";
import { toast } from "sonner";

import { logger } from "@/utils/logger";
interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  userId: string;
}

const UserDashboard: React.FC = () => {
  const { user, userProfile, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [showGitHubRepos, setShowGitHubRepos] = useState(false);

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

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const userTasks: Task[] = [];

      querySnapshot.forEach((doc) => {
        userTasks.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        } as Task);
      });

      setTasks(
        userTasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      );
    } catch (error) {
      logger.warn(
        "Firestore connection error - tasks feature unavailable:",
        error
      );
      // You could show a message to the user here if needed
      setTasks([]);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTaskTitle.trim()) return;

    setLoading(true);
    try {
      const newTask = {
        title: newTaskTitle,
        description: newTaskDescription,
        completed: false,
        createdAt: new Date(),
        userId: user.uid,
      };

      await addDoc(collection(db, "tasks"), newTask);
      setNewTaskTitle("");
      setNewTaskDescription("");
      await fetchTasks();
    } catch (error) {
      logger.warn("Firestore connection error - unable to add task:", error);
      // You could show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, { completed: !completed });
      await fetchTasks();
    } catch (error) {
      logger.warn("Firestore connection error - unable to update task:", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      await fetchTasks();
    } catch (error) {
      logger.warn("Firestore connection error - unable to delete task:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      logger.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

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
      const { GitHubAnalysisStorageService } =
        await import("@/services/storage/GitHubAnalysisStorageService");

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
            // Update stored metadata with stars/forks
            var stars = details.stars;
            var forks = details.forks;
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

        // Store results
        if (user?.uid) {
          const storage = new GitHubAnalysisStorageService();
          await storage.storeRepositoryAnalysis(user.uid, {
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
            stars: typeof stars === "number" ? stars : 0,
            forks: typeof forks === "number" ? forks : 0,
            duration: parseFloat(results.analysisTime) || 0,
          });
        }

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
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gradient-to-br dark:from-[#0d0d1f] dark:via-[#1b1b3a] dark:to-[#0d0d1f] dark:text-gray-100">
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
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Welcome back, {userProfile.displayName}!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
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
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Your GitHub Repositories
                </h2>
                <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                  {repositories.length} repos
                </span>
              </div>
              <button
                onClick={() => setShowGitHubRepos(!showGitHubRepos)}
                className="text-sm text-purple-600 transition-colors hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
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
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-transparent dark:bg-[#252538]">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Display Name
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {userProfile.displayName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {userProfile.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-border bg-card rounded-lg border p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Task Statistics
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Total Tasks</span>
                  <span className="font-semibold">{tasks.length}</span>
                </div>
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Completed</span>
                  <span className="font-semibold">
                    {tasks.filter((task) => task.completed).length}
                  </span>
                </div>
                <div className="flex justify-between text-yellow-600 dark:text-yellow-400">
                  <span>Pending</span>
                  <span className="font-semibold">
                    {tasks.filter((task) => !task.completed).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Manager */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-transparent dark:bg-[#252538]">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Task Manager
              </h2>

              <form
                onSubmit={addTask}
                className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-[#1e1e2f]"
              >
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label
                      htmlFor="taskTitle"
                      className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Task Title
                    </label>
                    <input
                      type="text"
                      id="taskTitle"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-[#2c2c3e] dark:text-white"
                      placeholder="Enter task title..."
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="taskDescription"
                      className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Description (Optional)
                    </label>
                    <textarea
                      id="taskDescription"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-[#2c2c3e] dark:text-white"
                      placeholder="Enter task description..."
                      rows={3}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-2 text-white hover:opacity-90 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add Task"}
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No tasks yet. Add your first task above!
                  </p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`rounded-lg border p-4 ${
                        task.completed
                          ? "border-green-200 bg-green-50 dark:border-green-600 dark:bg-green-900/30"
                          : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id, task.completed)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                          />
                          <div>
                            <h3
                              className={`font-medium ${
                                task.completed
                                  ? "text-gray-500 line-through dark:text-gray-400"
                                  : "text-gray-900 dark:text-white"
                              }`}
                            >
                              {task.title}
                            </h3>
                            {task.description && (
                              <p
                                className={`mt-1 text-sm ${
                                  task.completed
                                    ? "text-gray-500"
                                    : "text-gray-600 dark:text-gray-300"
                                }`}
                              >
                                {task.description}
                              </p>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                              Created: {task.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-sm font-medium text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
