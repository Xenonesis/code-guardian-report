import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useNavigation } from '@/lib/navigation-context';
import { Github, TrendingUp, Shield, Activity, GitBranch, Star, BarChart3, Code2, AlertTriangle, CheckCircle } from 'lucide-react';
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

export const GitHubAnalysisPage: React.FC = () => {
  const { user, userProfile, isGitHubUser, signInWithGithub } = useAuth();
  const { navigateTo } = useNavigation();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'repositories' | 'history' | 'analytics' | 'comparison' | 'quality' | 'patterns'>('overview');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [showGitHubRepos, setShowGitHubRepos] = useState(false);
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
    setManualUsername
  } = useGitHubRepositories({
    email: userProfile?.email || null,
    enabled: !isGitHubUser && !!user // Only for non-GitHub users (Google sign-in)
  });

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
    setShowPermissionModal(false);
    toast.loading('Fetching your repositories...');
    await grantPermission();
    toast.dismiss();
    toast.success('GitHub repositories loaded successfully!');
    setShowGitHubRepos(true);
  };

  const handleDenyGitHubAccess = () => {
    setShowPermissionModal(false);
    denyPermission();
    toast.info('You can enable this later from settings.');
  };

  const handleManualUsernameSuccess = async (username: string) => {
    setShowUsernameInput(false);
    toast.loading('Fetching your repositories...');
    await setManualUsername(username);
    toast.dismiss();
    toast.success('GitHub repositories loaded successfully!');
    setShowGitHubRepos(true);
  };

  const handleSkipUsernameInput = () => {
    setShowUsernameInput(false);
    localStorage.setItem('github_repo_permission', 'denied');
    toast.info('You can connect your GitHub account later.');
  };

  const handleAnalyzeRepository = async (repoUrl: string, repoName: string) => {
    try {
      // Import required services
      const { githubRepositoryService } = await import('@/services/githubRepositoryService');
      const { EnhancedAnalysisEngine } = await import('@/services/enhancedAnalysisEngine');
      const { GitHubAnalysisStorageService } = await import('@/services/storage/GitHubAnalysisStorageService');
      
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
        if (!branch) {
          try {
            toast.loading('Checking repository details...', { id: progressToastId });
            const details = await githubRepositoryService.getRepositoryInfo(repoInfo.owner, repoInfo.repo);
            branch = details.defaultBranch;
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
            // Throttle updates to avoid React "Maximum update depth exceeded" error
            // Update at most every 500ms, or if it's the final step
            // AND ensure message has changed to avoid duplicate updates
            if ((now - lastUpdate > 500 || progress === 100) && message !== lastMessage) {
              lastMessage = message;
              lastUpdate = now;
              // Use setTimeout to break the synchronous call stack and let React render
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

        // Store analysis results in GitHub-specific storage
        if (user?.uid) {
          const storageService = new GitHubAnalysisStorageService();
          await storageService.storeRepositoryAnalysis(user.uid, {
            name: repoInfo.repo,
            fullName: `${repoInfo.owner}/${repoInfo.repo}`,
            description: `Analysis of ${repoInfo.owner}/${repoInfo.repo}`,
            url: repoUrl,
            securityScore: results.summary.securityScore / 10, // Convert to 0-10 scale
            issuesFound: results.issues.length,
            criticalIssues: results.summary.criticalIssues,
            language: typeof results.languageDetection?.primaryLanguage === 'string' 
              ? results.languageDetection.primaryLanguage 
              : results.languageDetection?.primaryLanguage?.name || 'Unknown',
            stars: 0, // Could fetch from repo info
            forks: 0, // Could fetch from repo info
            duration: parseFloat(results.analysisTime) || 0
          });
        }

        toast.success(`Analysis complete! Found ${results.issues.length} issues.`, { 
          id: progressToastId,
          duration: 4000 
        });

        // Optionally navigate to results or refresh analytics
        setSelectedTab('analytics');

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
              {userProfile?.githubMetadata?.avatarUrl ? (
                <img
                  src={userProfile.githubMetadata.avatarUrl}
                  alt={userProfile.displayName}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full ring-4 ring-white/20"
                />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-4 ring-white/20">
                  <Github className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {userProfile?.displayName || 'GitHub User'}
                </h1>
                <div className="flex items-center gap-2 text-blue-200">
                  <Github className="w-4 h-4" />
                  <span className="text-sm md:text-base">
                    @{userProfile?.githubUsername || 'user'}
                  </span>
                </div>
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
              onClick={() => setSelectedTab('analytics')}
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
      </div>
    </div>
  );
};
