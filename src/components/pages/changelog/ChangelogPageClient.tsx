"use client";

import { useState } from "react";
import { GitHubRelease, GitHubCommit } from "@/services/api/githubService";
import { ChangelogPageLayout } from "./ChangelogPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Tag, GitCommit, Calendar, User, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { STATIC_COMMITS } from "./commitsData";

// Hardcoded Releases Data derived from CHANGELOG.md
const STATIC_RELEASES: GitHubRelease[] = [
  {
    id: 1470,
    tag_name: "14.7.0",
    name: "Version 14.7.0",
    body: `### Added

- **Changelog Page Overhaul**:
  - New static commits data file (\`commitsData.ts\`) with full commit history
  - Paginated commits view with "Show More" functionality (20 commits per page)
  - Hardcoded releases data derived from CHANGELOG.md for offline reliability
  - Simple Markdown parser component for rendering release notes in-browser

- **GitHub Analysis Dashboard Enhancements**:
  - Redesigned \`GitHubProfileHeader\` with responsive stats cards (Analyzed repos, Score, Issues)
  - Skeleton loading states for profile name and username while data loads
  - Improved responsive layout for mobile and desktop views

- **Repository Activity Analytics**:
  - New skeleton loading UI for activity stats cards
  - Empty state UI when no analyses have been performed yet
  - Language distribution bar chart with gradient color coding
  - Activity stats: Total Analyses, Avg. Analysis Time, Most Analyzed Repo, Most Common Language

- **Security Analytics Section**:
  - Skeleton loading states for all stats cards and trend chart
  - Empty state UI with call-to-action for first repository analysis
  - Security score trend chart with color-coded performance bars (green/yellow/red)
  - Stats: Average Security Score, Total Issues, Critical Issues, Analyses Completed

- **Analysis History Section**:
  - Full-featured analysis history with Timeline and List view modes
  - Search bar for filtering analysis history by repository name
  - Detailed analysis report modal with security score, stats grid, and executive summary
  - Score badges (Excellent / Good / Poor) with color-coded indicators
  - Skeleton loading states for history list items

- **UI Components**:
  - Enhanced \`Skeleton\` component with variant support (\`default\`, \`card\`, \`text\`, \`avatar\`, \`chart\`, \`button\`)
  - Configurable \`rounded\`, \`width\`, \`height\`, and \`animate\` props on Skeleton
  - New \`skeleton-index.ts\` barrel export for skeleton components

- **Home Page (Index)**:
  - Lazy-loaded \`FloatingChatBot\`, \`StorageStatus\`, and \`AnalysisHistoryModal\` with Suspense
  - Skeleton fallback for \`StorageStatus\` lazy load

- **Page Wrappers**:
  - \`GitHubAnalysisPageWrapper\` updated with \`loading: () => null\` for cleaner SSR transitions
  - \`PWASettingsPageWrapper\` simplified dynamic import

### Changed

- Improved GitHub dashboard layout with better responsive grid breakpoints
- Analysis history deduplication logic based on \`fileName\` and \`fileHash\`
- History page filter bar now shows active filter count and reset button
- Changelog page now uses static data instead of live GitHub API calls for better performance

### Fixed

- Fixed skeleton shimmer animation not applying correctly in dark mode
- Fixed analysis history not deduplicating entries with same file hash
- Fixed GitHub profile header layout overflow on small screens
- Fixed PWA settings page wrapper missing loading state

### Performance

- Reduced changelog page load time by switching to static commit/release data
- Lazy loading of heavy components (ChatBot, StorageStatus, HistoryModal) reduces initial bundle size
- Skeleton loading states improve perceived performance across GitHub dashboard`,
    published_at: "2026-02-18T00:00:00Z",
    html_url:
      "https://github.com/Xenonesis/code-guardian-report/releases/tag/14.7.0",
    author: {
      login: "Xenonesis",
      avatar_url: "https://github.com/Xenonesis.png",
      html_url: "https://github.com/Xenonesis",
    },
  },
  {
    id: 1300,
    tag_name: "13.0.0",
    name: "Version 13.0.0",
    body: `### Added

- Project cleanup and documentation improvements
- New markdown documentation files:
  - CHANGELOG.md - Version history tracking
  - ARCHITECTURE.md - System architecture documentation
  - API.md - API reference documentation
  - TROUBLESHOOTING.md - Common issues and solutions
  - ROADMAP.md - Project roadmap and future plans

### Changed

- Improved project documentation structure
- Enhanced developer experience with comprehensive guides

### Removed

- Removed temporary build log files (build_log.txt, build_log_2.txt, build_log_3.txt)
- Removed temporary directories (.qodo/, .zencoder/, .zenflow/)`,
    published_at: "2026-02-11T00:00:00Z",
    html_url:
      "https://github.com/Xenonesis/code-guardian-report/releases/tag/13.0.0",
    author: {
      login: "Xenonesis",
      avatar_url: "https://github.com/Xenonesis.png",
      html_url: "https://github.com/Xenonesis",
    },
  },
  {
    id: 1200,
    tag_name: "12.0.0",
    name: "Version 12.0.0",
    body: `### Added

- **Code Quality Improvements**:
  - Stricter TypeScript configuration with \`noUnusedLocals\` and \`noUnusedParameters\`
  - Zero ESLint errors across the entire codebase
  - Enhanced code standards with stricter linting rules

- **Testing Infrastructure**:
  - Unified test framework using Vitest
  - Migrated legacy tests to Vitest
  - Debug mode support with \`DEBUG_TESTS=true\` environment variable
  - 92 passing tests with improved reliability

- **Build & Configuration**:
  - Successful production build with all TypeScript errors resolved
  - Optimized linting with markdown file exclusions
  - Enhanced CI/CD pipeline with all pre-push checks passing

### Changed

- Improved error handling with better catch block management
- Cleaner imports and code organization
- Enhanced maintainability with intentional parameter naming conventions

### Removed

- 412 lines of unused code
- Duplicate Jest configuration files
- Unused dependencies and type definitions

### Fixed

- Fixed 181 ESLint errors related to unused variables and imports
- Resolved TypeScript compilation errors in production builds
- Fixed unused catch block error parameters
- Corrected unused React imports in functional components

### Performance

- Reduced bundle size through code cleanup
- Faster build times with optimized imports
- Improved type checking speed`,
    published_at: "2026-01-31T00:00:00Z",
    html_url:
      "https://github.com/Xenonesis/code-guardian-report/releases/tag/12.0.0",
    author: {
      login: "Xenonesis",
      avatar_url: "https://github.com/Xenonesis.png",
      html_url: "https://github.com/Xenonesis",
    },
  },
  {
    id: 1100,
    tag_name: "11.0.0",
    name: "Version 11.0.0",
    body: `### Added

- **Major Features**:
  - Complete rewrite with Next.js 16 App Router
  - Enhanced multi-language support (15+ programming languages)
  - AI-powered security insights and fix suggestions
  - Progressive Web App (PWA) capabilities
  - GitHub repository integration with OAuth authentication
  - Advanced analytics dashboard with real-time metrics
  - Custom rules engine for organization-specific patterns
  - Multiple export formats (PDF, JSON, SARIF, CSV)

- **Security Analysis**:
  - Complete OWASP Top 10 coverage
  - CWE mapping for all vulnerabilities
  - Secret detection for 50+ credential types
  - Dependency vulnerability scanning
  - Framework-specific security checks

- **User Experience**:
  - Real-time analysis with progress tracking
  - Interactive charts and visualizations
  - Dark/light theme support
  - Responsive design for mobile and desktop
  - Offline analysis capabilities

### Changed

- 300% faster analysis engine
- 50% reduction in bundle size
- Improved accessibility (WCAG 2.1 AA compliant)
- Enhanced mobile experience
- Better error handling and logging

### Fixed

- Fixed XSS detection false positives
- Resolved memory leaks in large file analysis
- Fixed GitHub OAuth token refresh
- Corrected PDF export formatting issues
- Fixed language detection accuracy

### Security

- Enhanced Content Security Policy (CSP)
- Implemented strict security headers
- Added rate limiting for API endpoints
- Improved input validation and sanitization`,
    published_at: "2025-01-31T00:00:00Z",
    html_url:
      "https://github.com/Xenonesis/code-guardian-report/releases/tag/11.0.0",
    author: {
      login: "Xenonesis",
      avatar_url: "https://github.com/Xenonesis.png",
      html_url: "https://github.com/Xenonesis",
    },
  },
  {
    id: 1000,
    tag_name: "10.0.0",
    name: "Version 10.0.0",
    body: `### Added

- Initial public release
- Core security analysis engine
- Multi-language support (JavaScript, TypeScript, Python, Java)
- Basic reporting functionality
- File upload analysis`,
    published_at: "2024-12-15T00:00:00Z",
    html_url:
      "https://github.com/Xenonesis/code-guardian-report/releases/tag/10.0.0",
    author: {
      login: "Xenonesis",
      avatar_url: "https://github.com/Xenonesis.png",
      html_url: "https://github.com/Xenonesis",
    },
  },
];

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
  const [releases] = useState<GitHubRelease[]>(STATIC_RELEASES);
  const [commits] = useState<GitHubCommit[]>(STATIC_COMMITS);
  const [activeTab, setActiveTab] = useState("releases");
  const [visibleCommits, setVisibleCommits] = useState(20);

  const handleShowMoreCommits = () => {
    setVisibleCommits((prev) => prev + 20);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const lastUpdated =
    releases.length > 0 ? formatDate(releases[0].published_at) : "Unknown";

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
            {commits.slice(0, visibleCommits).map((commit, _index) => (
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
          {visibleCommits < commits.length && (
            <div className="mt-8 flex justify-center">
              <Button onClick={handleShowMoreCommits} variant="outline">
                Show More Commits
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </ChangelogPageLayout>
  );
}
