import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useNavigation } from '@/lib/navigation-context';
import { Github, TrendingUp, Shield, Activity, GitBranch, Star, BarChart3, Code2, AlertTriangle, CheckCircle, ArrowLeft, FileCode } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RepositoryAnalysisGrid } from '@/components/github/RepositoryAnalysisGrid';
import { AnalysisHistorySection } from '@/components/github/AnalysisHistorySection';
import { SecurityAnalyticsSection } from '@/components/github/SecurityAnalyticsSection';
import { RepositoryActivityAnalytics } from '@/components/github/RepositoryActivityAnalytics';
import { RepositoryComparisonTool } from '@/components/github/RepositoryComparisonTool';
import { CodeQualityAnalytics } from '@/components/github/CodeQualityAnalytics';
import { VulnerabilityPatternAnalytics } from '@/components/github/VulnerabilityPatternAnalytics';
import { useGitHubRepositories } from '@/hooks/useGitHubRepositories';
import GitHubUsernameInput from '@/components/github/GitHubUsernameInput';
import GitHubRepositoryPermissionModal from '@/components/github/GitHubRepositoryPermissionModal';
import GitHubRepositoryList from '@/components/github/GitHubRepositoryList';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { AnalysisResults } from '@/hooks/useAnalysis';

// Lazy load the results component for better performance
const EnhancedSecurityResults = lazy(() => import('@/components/analysis/EnhancedSecurityResults').then(m => ({ default: m.EnhancedSecurityResults })));

export const GitHubAnalysisPage: React.FC = () => {
  const { user, userProfile, isGitHubUser, signInWithGithub } = useAuth();
  const { navigateTo } = useNavigation();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'repositories' | 'history' | 'analytics' | 'comparison' | 'quality' | 'patterns' | 'results'>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('github_selected_tab') : null;
    return (stored as any) || 'overview';
  });
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [showGitHubRepos, setShowGitHubRepos] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [analyzedRepoName, setAnalyzedRepoName] = useState<string>('');
  const [dashboardStats, setDashboardStats] = useState({
    repoCount: 0,
    avgScore: 0,
    totalIssues: 0,
    loading: true
  });

  // Fetch dashboard stats
  useEffect(() => {
    const loadDashboardStats = async () => {
      if (!user?.uid) return;
      
      try {
        // Dynamically import to avoid circular dependencies if any, though direct import is also fine
        const { GitHubAnalysisStorageService } = await import('@/services/storage/GitHubAnalysisStorageService');
        const storageService = new GitHubAnalysisStorageService();
        
        const [repos, trends] = await Promise.all([
          storageService.getUserRepositories(user.uid),
          storageService.getSecurityTrends(user.uid)
        ]);

        setDashboardStats({
          repoCount: repos.length,
          avgScore: trends.stats.averageScore,
          totalIssues: trends.stats.totalIssues,
          loading: false
        });
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        setDashboardStats(prev => ({ ...prev, loading: false }));
      }
    };

    loadDashboardStats();
  }, [user?.uid, selectedTab]); // Reload when tab changes (e.g. after analysis)

  // GitHub repositories integration for Google users
  const {
    repositories,
    loading: reposLoading,
    hasGitHubAccount,
    permissionGranted,
    permissionDenied,
    grantPermission,
    denyPermission,
    setManualUsername,
    githubUser
  } = useGitHubRepositories({
    email: userProfile?.email || null,
    enabled: !isGitHubUser && !!user // Only for non-GitHub users (Google sign-in)
  });

  // Derive header profile view from either GitHub sign-in metadata or connected GitHub profile
  const nonGithubConnected = !isGitHubUser;
  const githubAvatarUrl = nonGithubConnected
    ? (githubUser?.avatar_url || null)
    : (userProfile?.githubMetadata?.avatarUrl || user?.photoURL || null);
  const githubDisplayName = nonGithubConnected
    ? (githubUser?.name || githubUser?.login || null)
    : (userProfile?.displayName || userProfile?.githubMetadata?.login || user?.displayName || null);
  const githubUsername = nonGithubConnected
    ? (githubUser?.login || null)
    : (userProfile?.githubUsername || userProfile?.githubMetadata?.login || null);
  const totalGitHubRepos = nonGithubConnected
    ? (githubUser?.public_repos || 0)
    : (userProfile?.githubMetadata?.publicRepos || 0);
  const isLoadingProfile = !githubUsername && isGitHubUser;

  // Show permission modal if user has GitHub account but hasn't granted/denied permission
  useEffect(() => {
    if (!isGitHubUser && hasGitHubAccount && !permissionGranted && !permissionDenied && user) {
      const timer = setTimeout(() => {
        setShowPermissionModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasGitHubAccount, permissionGranted, permissionDenied, isGitHubUser, user]);

  // Show username input if no GitHub account detected but user wants to connect
  useEffect(() => {
    if (!isGitHubUser && !hasGitHubAccount && !permissionGranted && !permissionDenied && user && userProfile?.email) {
      const hasAskedForUsername = localStorage.getItem('github_username_asked');
      if (!hasAskedForUsername) {
        const timer = setTimeout(() => {
          setShowUsernameInput(true);
          localStorage.setItem('github_username_asked', 'true');
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [hasGitHubAccount, permissionGranted, permissionDenied, isGitHubUser, user, userProfile?.email]);

  const handleAllowGitHubAccess = async () => {
    localStorage.setItem('github_selected_tab', 'analytics');
    setShowPermissionModal(false);
    const t = toast.loading('Fetching your repositories...');
    await grantPermission();
    toast.success('GitHub repositories loaded successfully!', { id: t });
    setShowGitHubRepos(true);
  };

  const handleDenyGitHubAccess = () => {
    setShowPermissionModal(false);
    denyPermission();
    toast.info('You can enable this later from settings.');
  };

  const handleManualUsernameSuccess = async (username: string) => {
    localStorage.setItem('github_selected_tab', 'analytics');
    setShowUsernameInput(false);
    const t = toast.loading('Fetching your repositories...');
    await setManualUsername(username);
    toast.success('GitHub repositories loaded successfully!', { id: t });
    setShowGitHubRepos(true);
  };

  const handleSkipUsernameInput = () => {
    setShowUsernameInput(false);
    localStorage.setItem('github_repo_permission', 'denied');
    toast.info('You can connect your GitHub account later.');
  };

  // Prompt user to connect GitHub until a profile is fetched (for non-GitHub sign-ins)
  const openConnectGitHubPrompt = () => {
    if (hasGitHubAccount && !permissionDenied) {
      setShowPermissionModal(true);
    } else {
      setShowUsernameInput(true);
    }
  };

  const handleAnalyzeRepository = async (repoUrl: string, repoName: string) => {
    try {
      // Import required services
      const { githubRepositoryService } = await import('@/services/githubRepositoryService');
      const { EnhancedAnalysisEngine } = await import('@/services/enhancedAnalysisEngine');
      const { GitHubAnalysisStorageService } = await import('@/services/storage/GitHubAnalysisStorageService');
      const { firebaseAnalysisStorage } = await import('@/services/storage/firebaseAnalysisStorage');
      
      // Parse GitHub URL
      const repoInfo = githubRepositoryService.parseGitHubUrl(repoUrl);
      if (!repoInfo) {
        toast.error('Invalid GitHub repository URL');
        return;
      }

      // Show progress toast
      const progressToastId = toast.loading('Preparing to analyze repository...');

      try {
        // If branch is not specified, fetch repo info to get default branch
        let branch = repoInfo.branch;
        let repoDetails: any = null;
        if (!branch) {
          try {
            toast.loading('Checking repository details...', { id: progressToastId });
            repoDetails = await githubRepositoryService.getRepositoryInfo(repoInfo.owner, repoInfo.repo);
            branch = repoDetails.defaultBranch;
          } catch (err) {
            console.warn('Failed to fetch repo info, defaulting to main', err);
            branch = 'main';
          }
        }

        // Download repository as ZIP
        let lastUpdate = 0;
        let lastMessage = '';
        const zipFile = await githubRepositoryService.downloadRepositoryAsZip(
          repoInfo.owner,
          repoInfo.repo,
          branch || 'main',
          (progress, message) => {
            const now = Date.now();
            if ((now - lastUpdate > 500 || progress === 100) && message !== lastMessage) {
              lastMessage = message;
              lastUpdate = now;
              setTimeout(() => {
                toast.loading(message, { id: progressToastId });
              }, 0);
            }
          }
        );

        toast.loading('Analyzing code...', { id: progressToastId });

        // Analyze the repository
        const analysisEngine = new EnhancedAnalysisEngine();
        const results = await analysisEngine.analyzeCodebase(zipFile);

        toast.loading('Saving analysis results...', { id: progressToastId });

        // Store analysis results in GitHub-specific storage (summary)
        if (user?.uid) {
          const storageService = new GitHubAnalysisStorageService();
          await storageService.storeRepositoryAnalysis(user.uid, {
            name: repoInfo.repo,
            fullName: `${repoInfo.owner}/${repoInfo.repo}`,
            description: repoDetails?.description || `Analysis of ${repoInfo.owner}/${repoInfo.repo}`,
            url: repoUrl,
            securityScore: results.summary.securityScore / 10,
            issuesFound: results.issues.length,
            criticalIssues: results.summary.criticalIssues,
            language: typeof results.languageDetection?.primaryLanguage === 'string' 
              ? results.languageDetection.primaryLanguage 
              : results.languageDetection?.primaryLanguage?.name || 'Unknown',
            stars: repoDetails?.stars || 0,
            forks: repoDetails?.forks || 0,
            duration: Number.parseFloat(results.analysisTime) || 0
          });

          // Also store full analysis results in Firebase for viewing later
          firebaseAnalysisStorage.setUserId(user.uid);
          // Create a File object from the zip data for storage
          const fileForStorage = new File([zipFile], `${repoInfo.owner}-${repoInfo.repo}.zip`, { type: 'application/zip' });
          await firebaseAnalysisStorage.storeAnalysisResults(
            results,
            fileForStorage,
            [`github-${repoInfo.owner}-${repoInfo.repo}`],
            false
          );
        }

        toast.success(`Analysis complete! Found ${results.issues.length} issues.`, { 
          id: progressToastId,
          duration: 4000 
        });

        // Store results in state and show results tab
        setAnalysisResults(results);
        setAnalyzedRepoName(`${repoInfo.owner}/${repoInfo.repo}`);
        setSelectedTab('results');
        localStorage.setItem('github_selected_tab', 'results');

      } catch (error: any) {
        toast.error(`Analysis failed: ${error.message}`, { id: progressToastId });
        logger.error('Repository analysis failed:', error);
      }

    } catch (error: any) {
      toast.error(`Failed to analyze repository: ${error.message}`);
      logger.error('Error in handleAnalyzeRepository:', error);
    }
  };

  // Modified: Allow Google users if they have connected GitHub repos
  if (!isGitHubUser && !permissionGranted && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 md:p-12 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6">
              <Github className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              GitHub Sign-In Required
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
              The GitHub Analysis Dashboard is exclusively available for users who sign in with their GitHub account.
            </p>
            <p className="text-slate-500 dark:text-slate-500 mb-8">
              Get access to advanced features like repository comparison, code quality analytics, and vulnerability pattern detection.
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  Repository Comparison
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Compare up to 4 repositories side-by-side
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Code2 className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  Code Quality Metrics
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Track complexity, maintainability, and coverage
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  Vulnerability Patterns
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Detect and track security vulnerabilities
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={signInWithGithub}
              size="lg"
              className="w-full md:w-auto px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Github className="w-5 h-5 mr-3" />
              Sign In with GitHub
            </Button>
            
            {user && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Currently signed in as: <strong>{user.email}</strong>
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  You're signed in, but not with GitHub. Sign in with GitHub to access the dashboard.
                </p>
              </div>
            )}
            
            {!user && (
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Don't have a GitHub account? <a href="https://github.com/signup" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Create one for free</a>
              </p>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Why GitHub Sign-In?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">Access Your Repositories</strong>
                  <p className="text-slate-600 dark:text-slate-400">Analyze your GitHub repositories directly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">Personalized Dashboard</strong>
                  <p className="text-slate-600 dark:text-slate-400">See metrics specific to your projects</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">Track Progress</strong>
                  <p className="text-slate-600 dark:text-slate-400">Monitor security improvements over time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">Advanced Analytics</strong>
                  <p className="text-slate-600 dark:text-slate-400">Get detailed insights and comparisons</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* GitHub Permission Modal */}
      <GitHubRepositoryPermissionModal
        isOpen={showPermissionModal}
        email={userProfile?.email || ''}
        onAllow={handleAllowGitHubAccess}
        onDeny={handleDenyGitHubAccess}
        onClose={() => setShowPermissionModal(false)}
      />

      {/* GitHub Username Input Modal */}
      <GitHubUsernameInput
        isOpen={showUsernameInput}
        email={userProfile?.email || ''}
        onSuccess={handleManualUsernameSuccess}
        onSkip={handleSkipUsernameInput}
        onClose={() => setShowUsernameInput(false)}
      />
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* User Info Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              {githubAvatarUrl ? (
                <img
                  src={githubAvatarUrl}
                  alt={githubDisplayName}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full ring-4 ring-white/20"
                />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-4 ring-white/20">
                  <Github className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {isLoadingProfile ? (
                    <span className="animate-pulse bg-white/20 rounded h-9 w-48 inline-block"></span>
                  ) : githubDisplayName ? (
                    githubDisplayName
                  ) : (
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={openConnectGitHubPrompt}
                        size="sm"
                        className="bg-white text-slate-900 hover:bg-white/90"
                      >
                        Connect GitHub
                      </Button>
                      <span className="text-blue-200 text-base">to show your profile</span>
                    </div>
                  )}
                </h1>
                <div className="flex items-center gap-2 text-blue-200">
                  <Github className="w-4 h-4" />
                  {isLoadingProfile ? (
                    <span className="animate-pulse bg-white/10 rounded h-5 w-24 inline-block"></span>
                  ) : githubUsername ? (
                    <a 
                      href={`https://github.com/${githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm md:text-base hover:text-white transition-colors"
                    >
                      @{githubUsername}
                    </a>
                  ) : (
                    <button
                      onClick={openConnectGitHubPrompt}
                      className="text-sm md:text-base text-blue-200 underline underline-offset-2 decoration-blue-300/60 hover:text-white"
                    >
                      Connect GitHub to show profile
                    </button>
                  )}
                </div>
                {totalGitHubRepos > 0 && (
                  <div className="text-xs text-blue-300 mt-1">
                    {totalGitHubRepos} public repositories
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 md:ml-auto">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 hover:bg-white/20 transition-all duration-300 group">
                <div className="text-blue-200 text-xs md:text-sm mb-1 group-hover:text-blue-100 transition-colors">Repositories Analyzed</div>
                <div className="text-2xl md:text-3xl font-bold text-white flex items-baseline gap-2">
                  {dashboardStats.loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    dashboardStats.repoCount
                  )}
                  <span className="text-xs font-normal text-blue-300/80">repos</span>
                </div>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 hover:bg-white/20 transition-all duration-300 group">
                <div className="text-blue-200 text-xs md:text-sm mb-1 group-hover:text-blue-100 transition-colors">Security Score</div>
                <div className="text-2xl md:text-3xl font-bold text-white flex items-baseline gap-1">
                  {dashboardStats.loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    dashboardStats.avgScore.toFixed(1)
                  )}
                  <span className="text-lg text-blue-300/80 font-normal">/10</span>
                </div>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 col-span-2 md:col-span-1 hover:bg-white/20 transition-all duration-300 group">
                <div className="text-blue-200 text-xs md:text-sm mb-1 group-hover:text-blue-100 transition-colors">Issues Found</div>
                <div className="text-2xl md:text-3xl font-bold text-white flex items-baseline gap-2">
                  {dashboardStats.loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    dashboardStats.totalIssues.toLocaleString()
                  )}
                  <span className="text-xs font-normal text-blue-300/80">total</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('overview')}
              className={selectedTab === 'overview' 
                ? 'bg-white text-slate-900 hover:bg-white/90' 
                : 'text-white hover:bg-white/10'}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={selectedTab === 'repositories' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('repositories')}
              className={selectedTab === 'repositories' 
                ? 'bg-white text-slate-900 hover:bg-white/90' 
                : 'text-white hover:bg-white/10'}
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Repositories
            </Button>
            <Button
              variant={selectedTab === 'history' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('history')}
              className={selectedTab === 'history' 
                ? 'bg-white text-slate-900 hover:bg-white/90' 
                : 'text-white hover:bg-white/10'}
            >
              <Activity className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button
              variant={selectedTab === 'analytics' ? 'default' : 'ghost'}
              onClick={() => {
                setSelectedTab('analytics');
                localStorage.setItem('github_selected_tab', 'analytics');
              }}
              className={selectedTab === 'analytics' 
                ? 'bg-white text-slate-900 hover:bg-white/90' 
                : 'text-white hover:bg-white/10'}
            >
              <Shield className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant={selectedTab === 'comparison' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('comparison')}
              className={selectedTab === 'comparison' 
                ? 'bg-white text-slate-900 hover:bg-white/90' 
                : 'text-white hover:bg-white/10'}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Compare
            </Button>
            <Button
              variant={selectedTab === 'quality' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('quality')}
              className={selectedTab === 'quality' 
                ? 'bg-white text-slate-900 hover:bg-white/90' 
                : 'text-white hover:bg-white/10'}
            >
              <Code2 className="w-4 h-4 mr-2" />
              Quality
            </Button>
            <Button
              variant={selectedTab === 'patterns' ? 'default' : 'ghost'}
              onClick={() => setSelectedTab('patterns')}
              className={selectedTab === 'patterns' 
                ? 'bg-white text-slate-900 hover:bg-white/90' 
                : 'text-white hover:bg-white/10'}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Patterns
            </Button>
            {analysisResults && (
              <Button
                variant={selectedTab === 'results' ? 'default' : 'ghost'}
                onClick={() => setSelectedTab('results')}
                className={selectedTab === 'results' 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'text-white hover:bg-white/10 ring-2 ring-green-400/50'}
              >
                <FileCode className="w-4 h-4 mr-2" />
                Results
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {analysisResults.issues.length}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* GitHub Repositories Section for Google Users */}
        {!isGitHubUser && permissionGranted && repositories.length > 0 && (
          <div className="mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Github className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your GitHub Repositories</h2>
                  <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-600 dark:text-purple-300 rounded-full">
                    {repositories.length} repos
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGitHubRepos(!showGitHubRepos)}
                  className="text-purple-600 dark:text-purple-400"
                >
                  {showGitHubRepos ? 'Hide' : 'Show'}
                </Button>
              </div>
              
              {showGitHubRepos && (
                <GitHubRepositoryList
                  repositories={repositories}
                  onAnalyzeRepository={handleAnalyzeRepository}
                  loading={reposLoading}
                />
              )}
            </Card>
          </div>
        )}

        {selectedTab === 'overview' && (
          <div className="space-y-8">
            <SecurityAnalyticsSection userId={user.uid} />
            <RepositoryActivityAnalytics userId={user.uid} />
          </div>
        )}

        {selectedTab === 'repositories' && (
          <RepositoryAnalysisGrid userId={user.uid} />
        )}

        {selectedTab === 'history' && (
          <AnalysisHistorySection userId={user.uid} />
        )}

        {selectedTab === 'analytics' && (
          <div className="space-y-8">
            <SecurityAnalyticsSection userId={user.uid} detailed />
            <RepositoryActivityAnalytics userId={user.uid} detailed />
          </div>
        )}

        {selectedTab === 'comparison' && (
          <RepositoryComparisonTool userId={user.uid} />
        )}

        {selectedTab === 'quality' && (
          <CodeQualityAnalytics userId={user.uid} />
        )}

        {selectedTab === 'patterns' && (
          <VulnerabilityPatternAnalytics userId={user.uid} />
        )}

        {selectedTab === 'results' && analysisResults && (
          <div className="space-y-6">
            {/* Results Header */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <FileCode className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Analysis Results
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      {analyzedRepoName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {analysisResults.summary.securityScore}
                      <span className="text-lg text-slate-500">/100</span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Security Score</div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAnalysisResults(null);
                      setAnalyzedRepoName('');
                      setSelectedTab('overview');
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {analysisResults.summary.criticalIssues}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">Critical</div>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {analysisResults.summary.highIssues}
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">High</div>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {analysisResults.summary.mediumIssues}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Medium</div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {analysisResults.summary.lowIssues}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Low</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                    {analysisResults.totalFiles}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Files Analyzed</div>
                </div>
              </div>
            </Card>

            {/* Detailed Results using EnhancedSecurityResults */}
            <Suspense fallback={
              <Card className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">Loading results...</p>
              </Card>
            }>
              <EnhancedSecurityResults results={analysisResults} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};
