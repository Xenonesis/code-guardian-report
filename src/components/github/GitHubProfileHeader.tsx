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

import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="flex flex-col justify-between gap-6 sm:gap-8 lg:flex-row lg:items-center">
      {/* Profile Section */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative">
          {githubAvatarUrl ? (
            <img
              src={githubAvatarUrl}
              alt={githubDisplayName || "User"}
              className="ring-background h-20 w-20 rounded-2xl object-cover shadow-lg ring-4"
            />
          ) : (
            <div className="bg-muted ring-background flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg ring-4">
              <Github className="text-muted-foreground h-10 w-10" />
            </div>
          )}
          <div className="bg-background ring-border absolute -right-2 -bottom-2 rounded-full p-1.5 shadow-md ring-1">
            <Github className="text-foreground h-4 w-4" />
          </div>
        </div>

        <div className="min-w-0">
          <h1 className="text-foreground mb-1 text-2xl font-bold tracking-tight break-words sm:text-3xl">
            {isLoadingProfile ? (
              <Skeleton className="inline-block h-8 w-48 rounded" />
            ) : (
              githubDisplayName || "GitHub User"
            )}
          </h1>
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 sm:gap-3">
            {isLoadingProfile ? (
              <Skeleton className="inline-block h-5 w-32 rounded" />
            ) : githubUsername ? (
              <a
                href={`https://github.com/${githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary dark:hover:text-primary flex items-center gap-1.5 transition-colors"
              >
                @{githubUsername}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            ) : (
              <Button
                variant="link"
                className="text-primary dark:text-primary dark:hover:text-primary h-auto p-0 hover:text-teal-600"
                onClick={openConnectGitHubPrompt}
              >
                Connect GitHub Profile
              </Button>
            )}
            {totalGitHubRepos > 0 && (
              <>
                <span className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
                <span>{totalGitHubRepos} repositories</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:min-w-[500px]">
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
            className="group border-border bg-card hover:border-primary/20 rounded-xl border p-3 shadow-sm transition-all hover:shadow-md sm:p-4"
          >
            <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
              {stat.label}
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className={cn("text-2xl font-bold transition-colors", {
                  "text-primary dark:text-primary": stat.color === "blue",
                  "text-emerald-600 dark:text-emerald-400":
                    stat.color === "green",
                  "text-orange-600 dark:text-orange-400":
                    stat.color === "orange",
                })}
              >
                {dashboardStats.loading ? "..." : stat.value}
              </span>
              <span className="text-muted-foreground text-xs font-medium">
                {stat.sub}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
