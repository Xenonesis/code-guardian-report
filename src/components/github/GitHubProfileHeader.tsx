import React from "react";
import { Github, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  repoCount: number;
  avgScore: number;
  totalIssues: number;
  loading: boolean;
}

interface GitHubProfileHeaderProps {
  githubAvatarUrl: string | null;
  githubDisplayName: string | null;
  githubUsername: string | null;
  totalGitHubRepos: number;
  isLoadingProfile: boolean;
  dashboardStats: DashboardStats;
  openConnectGitHubPrompt: () => void;
}

export const GitHubProfileHeader: React.FC<GitHubProfileHeaderProps> = ({
  githubAvatarUrl,
  githubDisplayName,
  githubUsername,
  totalGitHubRepos,
  isLoadingProfile,
  dashboardStats,
  openConnectGitHubPrompt,
}) => {
  return (
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
              <Button
                variant="link"
                className="h-auto p-0 text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
                onClick={openConnectGitHubPrompt}
              >
                Connect GitHub Profile
              </Button>
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
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-500/20 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-400/20"
          >
            <div className="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
              {stat.label}
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className={cn("text-2xl font-bold transition-colors", {
                  "text-blue-600 dark:text-blue-400": stat.color === "blue",
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
  );
};
