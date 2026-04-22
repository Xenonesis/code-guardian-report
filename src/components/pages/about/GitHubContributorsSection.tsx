import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  ExternalLink,
  Star,
  GitFork,
  Eye,
  MapPin,
  Building,
  Globe,
  Terminal,
  Code2,
} from "lucide-react";
import {
  githubService,
  ContributorWithDetails,
} from "@/services/api/githubService";

import { logger } from "@/utils/logger";
import { openUrlInNewTab } from "./utils";

const GitHubContributorsSection = () => {
  const [contributors, setContributors] = useState<ContributorWithDetails[]>(
    []
  );
  const [repoStats, setRepoStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contributorsData, statsData] = await Promise.all([
          githubService.getContributorsWithDetails(),
          githubService.getRepositoryStats(),
        ]);

        setContributors(contributorsData);
        setRepoStats(statsData);
      } catch (err) {
        setError("Failed to load network nodes.");
        logger.error("Error loading GitHub data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="bg-background relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="mb-4 flex justify-center">
            <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
          <p className="text-primary animate-pulse font-mono">
            {">"} ESTABLISHING_UPLINK...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-background relative py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block border border-red-500/20 bg-red-500/5 p-8">
            <p className="mb-4 font-mono text-red-500">
              {">"} ERROR: {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="font-mono text-xs uppercase"
            >
              RETRY_CONNECTION
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background relative overflow-hidden py-24">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="bg-background/90 absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <div className="bg-primary/20 h-px w-12"></div>
              <span className="text-primary font-mono text-xs font-bold tracking-widest uppercase">
                NETWORK // OPERATIVES
              </span>
              <div className="bg-primary/20 h-px w-12"></div>
            </div>
            <h2 className="text-foreground mb-6 text-3xl font-bold tracking-tight md:text-5xl">
              OPEN_SOURCE <span className="text-primary">CONTRIBUTORS</span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl font-mono text-lg">
              {">"} Network node operators contributing to the central codebase.
            </p>

            {/* Repository Stats */}
            {repoStats && (
              <div className="border-primary/20 mx-auto mt-12 max-w-3xl border bg-black/40 backdrop-blur-sm">
                <div className="border-primary/20 bg-primary/5 flex items-center justify-between border-b p-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="text-primary h-4 w-4" />
                    <span className="text-muted-foreground font-mono text-xs">
                      REPO_STATUS.log
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-500/50" />
                    <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                    <div className="h-2 w-2 rounded-full bg-green-500/50" />
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                    <div className="text-left">
                      <h3 className="text-foreground mb-1 font-mono text-xl font-bold">
                        Code Guardian Protocol
                      </h3>
                      <p className="text-muted-foreground font-mono text-xs">
                        TARGET: github.com/Xenonesis/code-guardian-report
                      </p>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-6 text-center md:w-auto md:grid-cols-4">
                      <div className="flex flex-col items-center">
                        <Star className="mb-2 h-4 w-4 text-yellow-500" />
                        <span className="font-mono text-xl font-bold">
                          {repoStats.stars}
                        </span>
                        <span className="text-muted-foreground font-mono text-[10px]">
                          STARS
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <GitFork className="mb-2 h-4 w-4 text-blue-500" />
                        <span className="font-mono text-xl font-bold">
                          {repoStats.forks}
                        </span>
                        <span className="text-muted-foreground font-mono text-[10px]">
                          FORKS
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Eye className="mb-2 h-4 w-4 text-green-500" />
                        <span className="font-mono text-xl font-bold">
                          {repoStats.watchers}
                        </span>
                        <span className="text-muted-foreground font-mono text-[10px]">
                          OBSERVERS
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Users className="mb-2 h-4 w-4 text-purple-500" />
                        <span className="font-mono text-xl font-bold">
                          {contributors.length}
                        </span>
                        <span className="text-muted-foreground font-mono text-[10px]">
                          NODES
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-primary/10 mt-8 flex justify-center border-t pt-6">
                    <Button
                      variant="outline"
                      className="border-primary/50 text-primary hover:bg-primary/10 font-mono text-xs uppercase"
                      onClick={() =>
                        openUrlInNewTab(
                          "https://github.com/Xenonesis/code-guardian-report"
                        )
                      }
                    >
                      <GitFork className="mr-2 h-4 w-4" />
                      ACCESS_REPOSITORY
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contributors Grid */}
          {contributors.length > 0 ? (
            <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {contributors.map((contributor, index) => (
                <div
                  key={contributor.id}
                  className="group border-primary/20 bg-card/30 hover:border-primary/50 hover:bg-primary/5 relative border p-6 transition-all"
                >
                  <div className="text-muted-foreground absolute top-0 right-0 p-2 font-mono text-[10px] opacity-50">
                    OP-{index < 9 ? `0${index + 1}` : index + 1}
                  </div>

                  <div className="mb-4 flex items-start gap-4">
                    <div className="relative">
                      <div className="border-primary/20 h-16 w-16 overflow-hidden border-2 bg-black">
                        <img
                          src={contributor.avatar_url}
                          alt={contributor.login}
                          className="h-full w-full object-cover grayscale transition-all group-hover:scale-110 group-hover:grayscale-0"
                        />
                      </div>
                      <div className="border-primary bg-background text-primary absolute -right-2 -bottom-2 border px-1.5 py-0.5 font-mono text-[10px]">
                        Lvl.
                        {Math.min(10, Math.ceil(contributor.contributions / 5))}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <h3 className="text-foreground truncate font-mono text-lg font-bold">
                        {contributor.name || contributor.login}
                      </h3>
                      <div className="text-primary mt-1 flex items-center gap-2 font-mono text-xs">
                        <span>{contributor.contributions} COMMITS</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-muted-foreground min-h-[80px] space-y-3 font-mono text-xs">
                    {contributor.location && (
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="text-primary/50 h-3 w-3" />
                        {contributor.location}
                      </div>
                    )}
                    {contributor.company && (
                      <div className="flex items-center gap-2 truncate">
                        <Building className="text-primary/50 h-3 w-3" />
                        {contributor.company}
                      </div>
                    )}
                    {contributor.blog && (
                      <div className="flex items-center gap-2 truncate">
                        <Globe className="text-primary/50 h-3 w-3" />
                        <a
                          href={
                            contributor.blog.startsWith("http")
                              ? contributor.blog
                              : `https://${contributor.blog}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-primary max-w-[200px] truncate transition-colors"
                        >
                          LINK_UPLINK
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="border-primary/10 mt-4 flex justify-end border-t pt-4">
                    <button
                      onClick={() => openUrlInNewTab(contributor.html_url)}
                      className="hover:text-primary flex items-center gap-1 font-mono text-[10px] transition-colors"
                    >
                      VIEW_PROFILE <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-primary/20 border border-dashed py-12 text-center">
              <Users className="text-primary/20 mx-auto mb-4 h-16 w-16" />
              <p className="text-muted-foreground font-mono">NODES_OFFLINE</p>
            </div>
          )}

          {/* Call to Action */}
          <div className="border-primary/20 bg-primary/5 group relative mx-auto max-w-3xl overflow-hidden border p-8 text-center">
            {/* Scanline */}
            <div className="bg-primary/20 animate-scan-vertical absolute top-0 left-0 h-[2px] w-full" />

            <h3 className="text-foreground mb-4 font-mono text-2xl font-bold">
              INITIATE_CONTRIBUTION_PROTOCOL
            </h3>
            <p className="text-muted-foreground mx-auto mb-8 max-w-xl font-mono text-sm">
              {">"} Access requested. Join the operational network. Submit
              patches and security definitions.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10 h-12 bg-transparent px-8 font-mono text-xs uppercase"
                onClick={() =>
                  openUrlInNewTab(
                    "https://github.com/Xenonesis/code-guardian-report"
                  )
                }
              >
                <GitFork className="mr-2 h-4 w-4" />
                SOURCE_CODE
              </Button>
              <Button
                variant="default"
                className="h-12 px-8 font-mono text-xs uppercase"
                onClick={() =>
                  openUrlInNewTab(
                    "https://github.com/Xenonesis/code-guardian-report/issues"
                  )
                }
              >
                <Code2 className="mr-2 h-4 w-4" />
                SUBMIT_ISSUE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { GitHubContributorsSection };
