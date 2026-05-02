"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, GitFork, Users, ArrowRight, ExternalLink } from "lucide-react";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { githubRepositoryService } from "@/services/githubRepositoryService";

interface Contributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

interface RepoStats {
  stars: number;
  forks: number;
  contributors: number;
}

export const ContributorsSection = () => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [stats, setStats] = useState<RepoStats>({
    stars: 0,
    forks: 0,
    contributors: 0,
  });
  const [loading, setLoading] = useState(true);

  // Configuration
  const REPO_OWNER = "Xenonesis";
  const REPO_NAME = "code-guardian-report";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch repository info for stars and forks
        const repoInfo = await githubRepositoryService.getRepositoryInfo(
          REPO_OWNER,
          REPO_NAME
        );

        // Fetch contributors
        const contributorsList = await githubRepositoryService.getContributors(
          REPO_OWNER,
          REPO_NAME
        );

        const newStats = {
          stars: repoInfo.stars || 0,
          forks: repoInfo.forks || 0,
          contributors: contributorsList.length || 0,
        };

        setStats(newStats);
        setContributors(contributorsList);

        // Cache the successful response
        localStorage.setItem("github_repo_stats", JSON.stringify(newStats));
        localStorage.setItem(
          "github_contributors",
          JSON.stringify(contributorsList)
        );
      } catch (error) {
        console.error("Failed to fetch GitHub data:", error);
        // Try to load from local storage
        try {
          const cachedStats = localStorage.getItem("github_repo_stats");
          const cachedContributors = localStorage.getItem(
            "github_contributors"
          );

          if (cachedStats && cachedContributors) {
            setStats(JSON.parse(cachedStats));
            setContributors(JSON.parse(cachedContributors));
          } else {
            // Fallback data if API fails and no cache
            setStats({ stars: 12, forks: 4, contributors: 2 });
          }
        } catch (_e) {
          setStats({ stars: 12, forks: 4, contributors: 2 });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="bg-background border-border/60 relative w-full overflow-hidden border-t border-dashed py-20 sm:py-24">
      {/* Background glow and technical overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/6 absolute top-[18%] right-[8%] h-[420px] w-[420px] rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12"
        >
          {/* Left Column: Stats & Text */}
          <div className="flex flex-col space-y-8 lg:col-span-5">
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="bg-primary/10 text-primary border-primary/30 inline-flex items-center space-x-2 border px-3 py-1 font-mono text-[11px] tracking-[0.18em] uppercase">
                <GitFork className="h-3 w-3" />
                <span>OPEN SOURCE</span>
              </div>

              <h2 className="text-foreground font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
                Built by developers,
                <br />
                <span className="text-primary/70 italic">for developers.</span>
              </h2>

              <p className="text-muted-foreground border-border/70 max-w-md border-l-2 pl-4 font-mono text-sm leading-relaxed md:border-l-0 md:pl-0">
                Code Guardian is open source and community driven. Join our
                mission to improve code security and quality for everyone.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-4"
            >
              <EnhancedCard
                variant="modern"
                className="bg-card/70 border-primary/20 rounded-none border p-5 backdrop-blur-sm"
              >
                <div className="flex flex-col">
                  <div className="text-muted-foreground mb-2 flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span className="font-mono text-[11px] tracking-[0.16em] uppercase">
                      Stars
                    </span>
                  </div>
                  <span className="font-mono text-3xl font-bold tracking-tight">
                    {loading ? (
                      <span className="bg-muted block h-8 w-16 animate-pulse" />
                    ) : (
                      stats.stars.toLocaleString()
                    )}
                  </span>
                </div>
              </EnhancedCard>

              <EnhancedCard
                variant="modern"
                className="bg-card/70 border-primary/20 rounded-none border p-5 backdrop-blur-sm"
              >
                <div className="flex flex-col">
                  <div className="text-muted-foreground mb-2 flex items-center space-x-2">
                    <GitFork className="h-4 w-4" />
                    <span className="font-mono text-[11px] tracking-[0.16em] uppercase">
                      Forks
                    </span>
                  </div>
                  <span className="font-mono text-3xl font-bold tracking-tight">
                    {loading ? (
                      <span className="bg-muted block h-8 w-16 animate-pulse" />
                    ) : (
                      stats.forks.toLocaleString()
                    )}
                  </span>
                </div>
              </EnhancedCard>

              <EnhancedCard
                variant="modern"
                className="bg-card/70 border-primary/20 col-span-2 rounded-none border p-5 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-muted-foreground mb-2 flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span className="font-mono text-[11px] tracking-[0.16em] uppercase">
                        Contributors
                      </span>
                    </div>
                    <span className="font-mono text-3xl font-bold tracking-tight">
                      {loading ? (
                        <span className="bg-muted block h-8 w-16 animate-pulse" />
                      ) : (
                        stats.contributors.toLocaleString()
                      )}
                    </span>
                  </div>
                  <a
                    href={`https://github.com/${REPO_OWNER}/${REPO_NAME}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 flex h-11 w-11 cursor-pointer items-center justify-center border transition-colors"
                    aria-label="Open repository on GitHub"
                  >
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </div>
              </EnhancedCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <a
                href={`https://github.com/${REPO_OWNER}/${REPO_NAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary focus-visible:ring-ring inline-flex h-11 items-center justify-center space-x-2 px-6 text-xs tracking-[0.14em] uppercase shadow-none transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <GitFork className="h-4 w-4" />
                <span>Star on GitHub</span>
                <ExternalLink className="ml-1 h-3 w-3 opacity-50" />
              </a>
            </motion.div>
          </div>

          {/* Right Column: Contributors Grid */}
          <div className="relative mt-12 lg:col-span-7 lg:mt-0">
            {/* Decorative elements behind grid */}
            <div className="from-background pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr via-transparent to-transparent opacity-0 lg:opacity-100" />

            <div className="relative z-10 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 md:gap-4">
              {loading
                ? // Loading skeletons
                  Array.from({ length: 18 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-muted/30 border-border/50 aspect-square animate-pulse border"
                    />
                  ))
                : // Actual contributors
                  [...contributors]
                    .sort((a, b) => b.contributions - a.contributions)
                    .slice(0, 24) // Limit to top 24 to keep the grid clean
                    .map((contributor, _index) => (
                      <motion.a
                        key={contributor.id}
                        href={contributor.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block"
                        variants={itemVariants}
                        whileHover={{
                          scale: 1.05,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <EnhancedCard
                          variant="modern"
                          className="aspect-square overflow-hidden rounded-none border-0 bg-transparent p-0 shadow-none"
                        >
                          <img
                            src={contributor.avatar_url}
                            alt={contributor.login}
                            className="border-border/60 group-hover:border-primary/60 h-full w-full border object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <p className="truncate text-center font-mono text-[10px] tracking-[0.08em] text-white uppercase dark:text-white">
                              {contributor.login}
                            </p>
                          </div>
                        </EnhancedCard>
                      </motion.a>
                    ))}

              {/* "And more" placeholder if many contributors */}
              {!loading && contributors.length > 24 && (
                <motion.a
                  href={`https://github.com/${REPO_OWNER}/${REPO_NAME}/graphs/contributors`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={itemVariants}
                  className="bg-muted/30 border-muted-foreground/30 hover:bg-muted/50 flex aspect-square items-center justify-center border border-dashed transition-colors"
                >
                  <span className="text-muted-foreground font-mono text-xs tracking-[0.12em]">
                    +{contributors.length - 24}
                  </span>
                </motion.a>
              )}
            </div>

            {/* Grid overlay lines for technical feel */}
            <div className="pointer-events-none absolute top-0 right-0 z-0 h-full w-full opacity-20">
              <div className="border-primary absolute top-4 right-4 h-4 w-4 border-t border-r" />
              <div className="border-primary absolute right-4 bottom-4 h-4 w-4 border-r border-b" />
            </div>
          </div>
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--glow) / 0.16), transparent)",
        }}
      />
    </section>
  );
};
