import React, { useState } from "react";
import { ToolCard, Tool } from "./ToolCard";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  Grid,
  List,
  Search,
  Sparkles,
  Zap,
  TrendingUp,
} from "lucide-react";

interface SupportedToolsSectionProps {
  className?: string;
}

export const SupportedToolsSection: React.FC<SupportedToolsSectionProps> = ({
  className = "",
}) => {
  const [filter, setFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const supportedTools: Tool[] = [
    {
      name: "Bandit",
      language: "Python",
      type: "Security Scanner",
      gradient: "from-red-500 to-pink-500",
      description:
        "Advanced Python security scanner that identifies common vulnerabilities, injection flaws, and security anti-patterns.",
      features: [
        "SQL Injection Detection",
        "Hardcoded Secrets",
        "Insecure Randomness",
        "Shell Injection",
        "Crypto Vulnerabilities",
      ],
      rating: 4.8,
      downloads: "2M+",
    },
    {
      name: "ESLint",
      language: "JavaScript/TypeScript",
      type: "Quality & Security",
      gradient: "from-blue-500 to-indigo-500",
      description:
        "Industry-standard linting tool with advanced security rules for modern JavaScript and TypeScript applications.",
      features: [
        "Syntax Analysis",
        "Security Patterns",
        "Best Practices",
        "Type Safety",
        "Custom Rules",
      ],
      rating: 4.9,
      downloads: "25M+",
    },
    {
      name: "Pylint",
      language: "Python",
      type: "Code Quality",
      gradient: "from-green-500 to-emerald-500",
      description:
        "Comprehensive Python code analyzer that enforces coding standards and identifies potential issues.",
      features: [
        "Code Complexity",
        "Naming Conventions",
        "Unused Variables",
        "Import Analysis",
        "Refactoring Suggestions",
      ],
      rating: 4.7,
      downloads: "5M+",
    },
    {
      name: "Semgrep",
      language: "Multi-language",
      type: "Security & SAST",
      gradient: "from-purple-500 to-violet-500",
      description:
        "Next-generation static analysis tool with custom rule engine for finding security vulnerabilities.",
      features: [
        "OWASP Top 10",
        "Custom Rules",
        "Multi-language",
        "CI/CD Integration",
        "Supply Chain Security",
      ],
      rating: 4.6,
      downloads: "1M+",
    },
    {
      name: "Flake8",
      language: "Python",
      type: "Style & Convention",
      gradient: "from-yellow-500 to-orange-500",
      description:
        "Unified Python style checker combining multiple tools for comprehensive code quality assessment.",
      features: [
        "PEP 8 Compliance",
        "Cyclomatic Complexity",
        "Import Validation",
        "Documentation",
        "Plugin Ecosystem",
      ],
      rating: 4.5,
      downloads: "8M+",
    },
    {
      name: "SonarQube",
      language: "Multi-language",
      type: "Enterprise SAST",
      gradient: "from-teal-500 to-cyan-500",
      description:
        "Enterprise-grade continuous code quality platform with advanced security vulnerability detection.",
      features: [
        "Security Hotspots",
        "Quality Gates",
        "Technical Debt",
        "Coverage Analysis",
        "Enterprise Integration",
      ],
      rating: 4.4,
      downloads: "500K+",
      comingSoon: true,
    },
  ];

  const filteredTools = supportedTools.filter((tool) => {
    const matchesFilter =
      filter === "all" ||
      tool.type.toLowerCase().includes(filter.toLowerCase()) ||
      tool.language.toLowerCase().includes(filter.toLowerCase());
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.features.some((feature) =>
        feature.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  const filterOptions = [
    { value: "all", label: "All Tools", count: supportedTools.length },
    {
      value: "security",
      label: "Security",
      count: supportedTools.filter((t) =>
        t.type.toLowerCase().includes("security")
      ).length,
    },
    {
      value: "python",
      label: "Python",
      count: supportedTools.filter((t) =>
        t.language.toLowerCase().includes("python")
      ).length,
    },
    {
      value: "javascript",
      label: "JavaScript",
      count: supportedTools.filter((t) =>
        t.language.toLowerCase().includes("javascript")
      ).length,
    },
    {
      value: "multi-language",
      label: "Multi-language",
      count: supportedTools.filter((t) =>
        t.language.toLowerCase().includes("multi")
      ).length,
    },
  ];

  return (
    <section
      className={`relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 ${className} overflow-hidden`}
      aria-labelledby="tools-title"
    >
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-950/10 dark:to-purple-950/10"></div>
      <div className="pointer-events-none absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-3xl"></div>
      <div className="pointer-events-none absolute right-1/4 bottom-0 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-3xl delay-1000"></div>

      <div className="relative z-10">
        <div className="mb-8 px-4 text-center sm:mb-12 sm:px-0 lg:mb-16">
          <div className="group mb-6 inline-flex items-center gap-3 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
            <div className="relative">
              <div className="h-3 w-3 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-75"></div>
            </div>
            <Sparkles className="h-4 w-4 text-blue-600 transition-transform duration-300 group-hover:rotate-12 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 transition-colors group-hover:text-blue-800 dark:text-blue-300 dark:group-hover:text-blue-200">
              Powered by Industry Leaders
            </span>
            <Zap className="h-4 w-4 text-indigo-600 transition-transform duration-300 group-hover:-rotate-12 dark:text-indigo-400" />
          </div>

          <h3
            id="tools-title"
            className="animate-fade-in text-foreground mb-6 text-4xl font-bold sm:text-5xl lg:text-6xl"
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">
              Industry-Leading
            </span>
            <br className="sm:hidden" />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-pink-400 dark:to-blue-400">
                Analysis Tools
              </span>
              <div className="absolute right-0 -bottom-2 left-0 h-1 animate-pulse rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            </span>
          </h3>

          <p className="mx-auto mb-8 max-w-4xl text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-400">
            We integrate with the most{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              trusted
            </span>{" "}
            and{" "}
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              powerful
            </span>{" "}
            static analysis tools in the industry, providing comprehensive
            security and quality analysis for your codebase.
          </p>

          {/* Stats Row */}
          <div className="mb-8 flex flex-wrap justify-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-md backdrop-blur-sm dark:bg-slate-800/80">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {supportedTools.length}+ Tools
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-md backdrop-blur-sm dark:bg-slate-800/80">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                99.9% Uptime
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-md backdrop-blur-sm dark:bg-slate-800/80">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Real-time Analysis
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="mb-8 px-4 sm:px-0">
          <div className="border-border/50 bg-card/60 mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 rounded-2xl border p-6 shadow-xl backdrop-blur-md lg:flex-row">
            {/* Search Bar */}
            <div className="group relative max-w-md flex-1">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-slate-400 transition-colors duration-200 group-focus-within:text-blue-500" />
              <input
                type="text"
                placeholder="Search tools, features, or languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-border/50 bg-card/80 placeholder:text-muted-foreground focus:bg-card w-full rounded-xl border py-4 pr-4 pl-12 text-sm shadow-sm backdrop-blur-sm transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 transform rounded-full p-1 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <span className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    ×
                  </span>
                </button>
              )}
            </div>

            {/* Filter Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filter:</span>
              </div>
              {filterOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={filter === option.value ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 font-medium transition-all duration-300 hover:scale-105 ${
                    filter === option.value
                      ? "border-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl"
                      : "bg-card/80 backdrop-blur-sm hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}{" "}
                  <span className="ml-1 opacity-75">({option.count})</span>
                </Badge>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 shadow-sm backdrop-blur-sm dark:bg-slate-800/80">
              <button
                onClick={() => setViewMode("grid")}
                className={`group rounded-lg p-3 transition-all duration-300 ${
                  viewMode === "grid"
                    ? "scale-105 bg-white text-blue-600 shadow-md dark:bg-slate-700 dark:text-blue-400"
                    : "text-slate-500 hover:bg-white/50 hover:text-slate-700 dark:hover:bg-slate-700/50 dark:hover:text-slate-300"
                }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4 transition-transform group-hover:scale-110" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`group rounded-lg p-3 transition-all duration-300 ${
                  viewMode === "list"
                    ? "scale-105 bg-white text-blue-600 shadow-md dark:bg-slate-700 dark:text-blue-400"
                    : "text-slate-500 hover:bg-white/50 hover:text-slate-700 dark:hover:bg-slate-700/50 dark:hover:text-slate-300"
                }`}
                title="List View"
              >
                <List className="h-4 w-4 transition-transform group-hover:scale-110" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8 px-4 text-center sm:px-0">
          <div className="border-border from-muted/50 to-muted inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-4 py-2 shadow-sm">
            <div className="h-2 w-2 animate-pulse rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Showing{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {filteredTools.length}
              </span>{" "}
              of <span className="font-bold">{supportedTools.length}</span>{" "}
              tools
              {searchTerm && (
                <span className="ml-1">
                  matching{" "}
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    "{searchTerm}"
                  </span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Tools Grid/List */}
        <div
          className={`px-4 sm:px-0 ${
            viewMode === "grid"
              ? "grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10"
              : "space-y-6"
          } transition-all duration-500`}
        >
          {filteredTools.map((tool, index) => (
            <div
              key={`${tool.name}-${index}`}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <ToolCard tool={tool} index={index} viewMode={viewMode} />
            </div>
          ))}
        </div>

        {/* Enhanced Empty State */}
        {filteredTools.length === 0 && (
          <div className="px-4 py-16 text-center">
            <div className="relative mx-auto mb-8">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-slate-200 to-slate-300 shadow-lg dark:from-slate-700 dark:to-slate-600">
                <Search className="h-12 w-12 text-slate-400" />
              </div>
              <div className="absolute -top-2 -right-2 flex h-8 w-8 animate-bounce items-center justify-center rounded-full bg-gradient-to-r from-red-400 to-pink-400">
                <span className="text-sm font-bold text-white">0</span>
              </div>
            </div>
            <h4 className="text-foreground mb-3 text-2xl font-bold">
              No tools found
            </h4>
            <p className="mx-auto mb-8 max-w-md text-lg text-slate-500 dark:text-slate-400">
              We couldn't find any tools matching your criteria. Try adjusting
              your search or filter settings.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilter("all");
                }}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl"
              >
                Clear all filters
              </button>
              <button
                onClick={() => setSearchTerm("")}
                className="border-border bg-card text-foreground hover:bg-muted rounded-xl border px-6 py-3 font-semibold transition-all duration-300"
              >
                Clear search only
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
