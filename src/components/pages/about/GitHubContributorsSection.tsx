import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Github,
  Loader2,
} from "lucide-react";
import {
  githubService,
  ContributorWithDetails,
} from "@/services/api/githubService";

import { logger } from "@/utils/logger";
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
        setError("Failed to load GitHub data");
        logger.error("Error loading GitHub data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getContributorRole = (contributions: number, index: number) => {
    if (index === 0) return "Lead Contributor";
    if (contributions > 50) return "Core Contributor";
    if (contributions > 20) return "Active Contributor";
    if (contributions > 10) return "Regular Contributor";
    return "Contributor";
  };

  const getContributorBadgeColor = (contributions: number, index: number) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-500 to-orange-500";
    if (contributions > 50)
      return "bg-gradient-to-r from-purple-500 to-pink-500";
    if (contributions > 20) return "bg-gradient-to-r from-blue-500 to-cyan-500";
    if (contributions > 10)
      return "bg-gradient-to-r from-green-500 to-emerald-500";
    return "bg-gradient-to-r from-gray-500 to-slate-500";
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-16 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
            <p className="text-slate-600 dark:text-slate-400">
              Loading GitHub contributors...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-16 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl text-center">
            <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-16 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
              Our GitHub Contributors
            </h2>
            <p className="mx-auto mb-6 max-w-3xl text-lg text-slate-600 dark:text-slate-400">
              Meet the amazing developers who have contributed to making Code
              Guardian better. Their dedication and expertise drive our mission
              forward.
            </p>

            {/* Repository Stats */}
            {repoStats && (
              <Card className="mx-auto mb-8 max-w-2xl border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-center gap-3">
                    <Github className="h-6 w-6" />
                    <CardTitle className="text-2xl">
                      Code Guardian Repository
                    </CardTitle>
                  </div>
                  <CardDescription className="text-blue-100">
                    Open source security analysis platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="text-center">
                      <div className="mb-1 flex items-center justify-center gap-1">
                        <Star className="h-4 w-4" />
                        <span className="font-bold">{repoStats.stars}</span>
                      </div>
                      <p className="text-xs text-blue-100">Stars</p>
                    </div>
                    <div className="text-center">
                      <div className="mb-1 flex items-center justify-center gap-1">
                        <GitFork className="h-4 w-4" />
                        <span className="font-bold">{repoStats.forks}</span>
                      </div>
                      <p className="text-xs text-blue-100">Forks</p>
                    </div>
                    <div className="text-center">
                      <div className="mb-1 flex items-center justify-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span className="font-bold">{repoStats.watchers}</span>
                      </div>
                      <p className="text-xs text-blue-100">Watchers</p>
                    </div>
                    <div className="text-center">
                      <div className="mb-1 flex items-center justify-center gap-1">
                        <Users className="h-4 w-4" />
                        <span className="font-bold">{contributors.length}</span>
                      </div>
                      <p className="text-xs text-blue-100">Contributors</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full border-white/30 bg-white/20 text-white hover:bg-white/30"
                    onClick={() =>
                      window.open(
                        "https://github.com/Xenonesis/code-guardian-report",
                        "_blank"
                      )
                    }
                  >
                    <Github className="mr-2 h-4 w-4" />
                    View on GitHub
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contributors Grid */}
          {contributors.length > 0 ? (
            <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {contributors.map((contributor, index) => (
                <Card
                  key={contributor.id}
                  className="group transition-all duration-300 hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={contributor.avatar_url}
                          alt={contributor.name || contributor.login}
                          className="h-16 w-16 rounded-full border-2 border-slate-200 transition-transform group-hover:scale-105 dark:border-slate-700"
                        />
                        <div
                          className={`absolute -right-1 -bottom-1 h-6 w-6 rounded-full ${getContributorBadgeColor(contributor.contributions, index)} flex items-center justify-center text-xs font-bold text-white`}
                        >
                          {index + 1}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate text-lg">
                          {contributor.name || contributor.login}
                        </CardTitle>
                        <CardDescription className="font-medium text-blue-600 dark:text-blue-400">
                          {getContributorRole(contributor.contributions, index)}
                        </CardDescription>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {contributor.contributions} commits
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {contributor.bio && (
                      <p
                        className="mb-3 overflow-hidden text-sm text-slate-600 dark:text-slate-400"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {contributor.bio}
                      </p>
                    )}

                    <div className="mb-4 space-y-2">
                      {contributor.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">
                            {contributor.location}
                          </span>
                        </div>
                      )}
                      {contributor.company && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Building className="h-4 w-4" />
                          <span className="truncate">
                            {contributor.company}
                          </span>
                        </div>
                      )}
                      {contributor.blog && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Globe className="h-4 w-4" />
                          <a
                            href={
                              contributor.blog.startsWith("http")
                                ? contributor.blog
                                : `https://${contributor.blog}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {contributor.blog}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
                        {contributor.public_repos !== undefined && (
                          <span>{contributor.public_repos} repos</span>
                        )}
                        {contributor.followers !== undefined && (
                          <span>{contributor.followers} followers</span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(contributor.html_url, "_blank")
                        }
                      >
                        <Github className="mr-1 h-4 w-4" />
                        Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-16 w-16 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400">
                No contributors found
              </p>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center">
            <Card className="border-0 bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <CardContent className="p-8">
                <h3 className="mb-4 text-2xl font-bold">
                  Join Our Contributors
                </h3>
                <p className="mx-auto mb-6 max-w-2xl text-green-100">
                  Want to contribute to Code Guardian? We welcome contributions
                  from developers of all skill levels. Check out our repository
                  and help us make code security accessible to everyone.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white text-green-600 hover:bg-green-50"
                    onClick={() =>
                      window.open(
                        "https://github.com/Xenonesis/code-guardian-report",
                        "_blank"
                      )
                    }
                  >
                    <Github className="mr-2 h-5 w-5" />
                    View Repository
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="border-white/30 bg-white/20 text-white hover:bg-white/30"
                    onClick={() =>
                      window.open(
                        "https://github.com/Xenonesis/code-guardian-report/issues",
                        "_blank"
                      )
                    }
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Report Issues
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GitHubContributorsSection;
