import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { History, Calendar, GitCommit, Tag } from "lucide-react";
import { APP_VERSION_WITH_PREFIX } from "@/utils/version";

interface ChangelogPageLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  stats?: {
    releases?: number;
    commits?: number;
  };
}

export const ChangelogPageLayout: React.FC<ChangelogPageLayoutProps> = ({
  title,
  subtitle,
  lastUpdated,
  children,
  icon = <History className="h-8 w-8" />,
  stats,
}) => {
  return (
    <PageLayout>
      {/* Industrial Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#ffffff_100%)] opacity-80 dark:bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="border-border/40 relative overflow-hidden border-b pt-20 pb-16">
          <div className="bg-background/40 absolute inset-0 backdrop-blur-sm dark:bg-black/40" />
          <div className="relative z-10 container mx-auto px-4 text-center sm:px-6 lg:px-8">
            <div className="border-border/40 bg-background/5 mb-6 inline-flex items-center justify-center rounded-2xl border p-3 shadow-lg dark:border-white/10 dark:bg-white/5">
              <div className="text-primary">{icon}</div>
            </div>
            <h1 className="font-display text-foreground mb-4 text-4xl font-bold tracking-tight uppercase md:text-5xl dark:text-white">
              {title}
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl font-mono text-lg dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Info Bar */}
        <div className="border-border/40 bg-background/80 sticky top-0 z-20 border-b backdrop-blur-sm dark:border-white/10 dark:bg-black/40">
          <div className="container mx-auto px-4 py-3">
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 font-mono text-xs sm:flex-row dark:text-slate-400">
              {lastUpdated && (
                <div className="flex items-center gap-2">
                  <Calendar className="text-primary h-4 w-4" />
                  <span>LAST_UPDATED: {lastUpdated}</span>
                </div>
              )}
              <div className="text-border hidden sm:block dark:text-white/10">
                |
              </div>
              <div className="flex items-center gap-2">
                <Tag className="text-primary h-4 w-4" />
                <span>VERSION: {APP_VERSION_WITH_PREFIX}</span>
              </div>
              {stats && (
                <>
                  <div className="text-border hidden sm:block dark:text-white/10">
                    |
                  </div>
                  <div className="flex items-center gap-2">
                    <GitCommit className="text-primary h-4 w-4" />
                    <span>COMMITS: {stats.commits || 0}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">{children}</div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ChangelogPageLayout;
