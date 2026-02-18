"use client";

import { useEffect, useState } from "react";
import {
  githubService,
  GitHubRelease,
  GitHubCommit,
} from "@/services/api/githubService";
import { ChangelogPageLayout } from "./ChangelogPageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Tag,
  GitCommit,
  Calendar,
  User,
  ExternalLink,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Simple Markdown Parser Component
const SimpleMarkdown = ({ content }: { content: string }) => {
  if (!content) return null;

  const lines = content.split("\n");

  return (
    <div className="text-muted-foreground space-y-1 text-sm">
      {lines.map((line, index) => {
        // Handle headers
        if (line.startsWith("# ")) {
          return (
            <h1
              key={index}
              className="text-foreground mt-4 mb-2 text-lg font-bold"
            >
              {line.replace("# ", "")}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2
              key={index}
              className="text-foreground mt-3 mb-1 text-base font-bold"
            >
              {line.replace("## ", "")}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3
              key={index}
              className="text-foreground mt-2 mb-1 text-sm font-bold"
            >
              {line.replace("### ", "")}
            </h3>
          );
        }

        // Handle list items
        const isList =
          line.trim().startsWith("- ") || line.trim().startsWith("* ");
        const cleanLine = line.replace(/^(\s*)([-*])\s+/, "");

        // Parse bold and links
        const parts = cleanLine.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);

        const renderedParts = parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={i} className="text-foreground">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (
            part.startsWith("[") &&
            part.includes("](") &&
            part.endsWith(")")
          ) {
            const [text, url] = part.slice(1, -1).split("](");
            return (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary inline-flex items-center gap-0.5 hover:underline"
              >
                {text}
                <ExternalLink className="h-3 w-3" />
              </a>
            );
          }
          return part;
        });

        if (isList) {
          return (
            <div key={index} className="ml-2 flex items-start gap-2">
              <span className="bg-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
              <p>{renderedParts}</p>
            </div>
          );
        }

        if (line.trim() === "") {
          return <div key={index} className="h-2" />;
        }

        return <p key={index}>{renderedParts}</p>;
      })}
    </div>
  );
};

export default function ChangelogPageClient() {
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("releases");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [releasesData, commitsData] = await Promise.all([
          githubService.getReleases(),
          githubService.getCommits(),
        ]);
        setReleases(releasesData);
        setCommits(commitsData);

        // If no releases, default to commits tab
        if (releasesData.length === 0 && commitsData.length > 0) {
          setActiveTab("commits");
        }
      } catch (error) {
        console.error("Failed to fetch changelog data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <ChangelogPageLayout
        title="Changelog"
        subtitle="Staying up to date with the latest changes and improvements."
        lastUpdated="Loading..."
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      </ChangelogPageLayout>
    );
  }

  const lastUpdated =
    releases.length > 0
      ? formatDate(releases[0].published_at)
      : commits.length > 0
        ? formatDate(commits[0].commit.author.date)
        : "Unknown";

  return (
    <ChangelogPageLayout
      title="Changelog"
      subtitle="Track the evolution of Code Guardian. See what's new, fixed, and improved."
      lastUpdated={lastUpdated}
      stats={{
        releases: releases.length,
        commits: commits.length,
      }}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mx-auto mb-8 grid w-full grid-cols-2 sm:w-[400px]">
          <TabsTrigger value="releases" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Releases
            <Badge variant="secondary" className="ml-1 text-xs">
              {releases.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="commits" className="flex items-center gap-2">
            <GitCommit className="h-4 w-4" />
            Commits
            <Badge variant="secondary" className="ml-1 text-xs">
              {commits.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="releases"
          className="animate-in fade-in-50 slide-in-from-bottom-2 mt-0 space-y-6 duration-500"
        >
          {releases.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              <Tag className="mx-auto mb-4 h-12 w-12 opacity-20" />
              <p>No releases found.</p>
            </div>
          ) : (
            releases.map((release) => (
              <Card
                key={release.id}
                className="border-border/40 bg-card/50 overflow-hidden backdrop-blur-sm"
              >
                <CardHeader className="border-border/40 bg-muted/20 border-b pb-4">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-primary text-xl">
                          {release.tag_name}
                        </CardTitle>
                        {release.name && release.name !== release.tag_name && (
                          <span className="text-muted-foreground text-sm font-medium">
                            {release.name}
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(release.published_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {release.author.login}
                        </div>
                      </div>
                    </div>
                    <a
                      href={release.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-border hover:bg-muted flex w-fit items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-colors"
                    >
                      View on GitHub <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <SimpleMarkdown content={release.body} />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent
          value="commits"
          className="animate-in fade-in-50 slide-in-from-bottom-2 mt-0 duration-500"
        >
          <div className="border-border/40 relative ml-4 space-y-8 border-l pb-4">
            {commits.map((commit, _index) => (
              <div key={commit.sha} className="relative pl-8">
                <div className="border-primary bg-background absolute top-1.5 -left-1.5 h-3 w-3 rounded-full border" />
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-foreground line-clamp-2 text-sm font-medium">
                        {commit.commit.message.split("\n")[0]}
                      </p>
                      <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                        <span>{formatDate(commit.commit.author.date)}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={commit.author?.avatar_url} />
                            <AvatarFallback>
                              {commit.commit.author.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>{commit.commit.author.name}</span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={commit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary font-mono text-xs whitespace-nowrap transition-colors"
                    >
                      {commit.sha.substring(0, 7)}
                    </a>
                  </div>
                  {commit.commit.message.split("\n").length > 1 && (
                    <p className="text-muted-foreground mt-1 line-clamp-3 text-xs">
                      {commit.commit.message.split("\n").slice(1).join("\n")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </ChangelogPageLayout>
  );
}
