import React, { useState, useEffect } from "react";
import { ToolCard, Tool } from "./ToolCard";
import { Filter, Grid, List, Search, Activity, Cpu } from "lucide-react";
import {
  ExternalScannerService,
  ExternalScannerStatus,
} from "@/services/security/externalScanners";

interface SupportedToolsSectionProps {
  className?: string;
}

export const SupportedToolsSection: React.FC<SupportedToolsSectionProps> = ({
  className = "",
}) => {
  const [filter, setFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [scannerStatuses, setScannerStatuses] = useState<
    ExternalScannerStatus[]
  >([]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const service = new ExternalScannerService();
        const statuses = await service.checkAllScannersStatus();
        setScannerStatuses(statuses);
      } catch (_err) {
        // Ignore errors checking status
      }
    };
    checkStatus();
  }, []);

  const baseSupportedTools: Tool[] = [
    {
      name: "Bandit",
      language: "Python",
      type: "Security Scanner",
      gradient: "from-red-500 to-pink-500", // Legacy prop, kept for type compatibility
      description:
        "Advanced Python security scanner detecting common vulnerabilities and injection flaws.",
      features: [
        "SQL Injection Detection",
        "Hardcoded Secrets",
        "Insecure Randomness",
        "Shell Injection",
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
        "Industry-standard linting tool with advanced security rules for modern JS/TS apps.",
      features: [
        "Syntax Analysis",
        "Security Patterns",
        "Best Practices",
        "Type Safety",
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
        "Comprehensive Python code analyzer enforcing standards and identifying issues.",
      features: [
        "Code Complexity",
        "Naming Conventions",
        "Unused Variables",
        "Import Analysis",
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
        "Next-generation static analysis with custom rule engine for finding vulnerabilities.",
      features: [
        "OWASP Top 10",
        "Custom Rules",
        "Multi-language",
        "CI/CD Integration",
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
        "Unified Python style checker combining multiple tools for comprehensive assessment.",
      features: [
        "PEP 8 Compliance",
        "Cyclomatic Complexity",
        "Import Validation",
        "Documentation",
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
        "Enterprise-grade continuous code quality platform with advanced security detection.",
      features: [
        "Security Hotspots",
        "Quality Gates",
        "Technical Debt",
        "Coverage Analysis",
      ],
      rating: 4.4,
      downloads: "500K+",
    },
  ];

  const supportedTools: Tool[] = baseSupportedTools.map((tool) => {
    const status = scannerStatuses.find(
      (s) => s.name.toLowerCase() === tool.name.toLowerCase()
    );
    if (status && status.installed) {
      return {
        ...tool,
        installed: true,
        version: status.version,
      };
    }
    return tool;
  });

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
    { value: "all", label: "ALL_SYSTEMS", count: supportedTools.length },
    {
      value: "security",
      label: "SECURITY_PROTOCOLS",
      count: supportedTools.filter((t) =>
        t.type.toLowerCase().includes("security")
      ).length,
    },
    {
      value: "python",
      label: "LANG:PYTHON",
      count: supportedTools.filter((t) =>
        t.language.toLowerCase().includes("python")
      ).length,
    },
    {
      value: "javascript",
      label: "LANG:JS/TS",
      count: supportedTools.filter((t) =>
        t.language.toLowerCase().includes("javascript")
      ).length,
    },
    {
      value: "multi-language",
      label: "MULTI_Target",
      count: supportedTools.filter((t) =>
        t.language.toLowerCase().includes("multi")
      ).length,
    },
  ];

  return (
    <section
      className={`relative overflow-hidden py-24 ${className}`}
      aria-labelledby="tools-title"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="bg-background/90 absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="mb-16 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="bg-primary/20 h-px w-12"></div>
            <span className="text-primary font-mono text-xs font-bold tracking-widest uppercase">
              EXT_MODULES // INTEGRATION
            </span>
            <div className="bg-primary/20 h-px w-12"></div>
          </div>

          <h3
            id="tools-title"
            className="text-foreground mb-6 text-3xl font-bold tracking-tight md:text-5xl"
          >
            INTEGRATED <span className="text-primary">SYSTEMS</span> REGISTRY
          </h3>

          <p className="text-muted-foreground mx-auto max-w-2xl font-mono text-lg">
            {">"} Active scanning protocols. Synchronized with industry-standard
            security engines.
          </p>

          {/* Stats Row */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 md:gap-8">
            <div className="border-primary/20 bg-primary/5 flex items-center gap-2 border px-4 py-2 font-mono text-xs">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></div>
              <span className="text-primary">
                SYSTEMS_ONLINE: {supportedTools.length}
              </span>
            </div>
            <div className="border-primary/20 bg-primary/5 flex items-center gap-2 border px-4 py-2 font-mono text-xs">
              <Activity className="text-primary h-3 w-3" />
              <span className="text-primary">UPTIME: 99.9%</span>
            </div>
            <div className="border-primary/20 bg-primary/5 flex items-center gap-2 border px-4 py-2 font-mono text-xs">
              <Cpu className="text-primary h-3 w-3" />
              <span className="text-primary">LATENCY: &lt;10ms</span>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="mb-8">
          <div className="border-primary/20 bg-card/30 mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 border p-6 backdrop-blur-sm lg:flex-row">
            {/* Search Bar */}
            <div className="relative w-full max-w-md flex-1">
              <div className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 font-mono text-xs">
                {">"} QUERY:
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-primary/20 text-primary focus:border-primary focus:ring-primary h-10 w-full border bg-black/40 pl-20 font-mono text-xs focus:ring-1 focus:outline-none"
                spellCheck={false}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-primary hover:text-primary/80 absolute top-1/2 right-3 -translate-y-1/2 p-1"
                >
                  ×
                </button>
              )}
            </div>

            {/* Filter Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="text-muted-foreground flex items-center gap-2">
                <Filter className="h-3 w-3" />
                <span className="font-mono text-xs font-bold uppercase">
                  FILTER_BY:
                </span>
              </div>
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`border px-3 py-1 font-mono text-[10px] uppercase transition-all duration-300 ${
                    filter === option.value
                      ? "border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                      : "border-primary/20 text-muted-foreground hover:border-primary/50 hover:text-foreground bg-transparent"
                  }`}
                >
                  {option.label}
                  <span className="ml-1 opacity-50">[{option.count}]</span>
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="border-primary/20 flex items-center gap-1 border bg-black/40 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8 text-center">
          <div className="border-primary/20 bg-primary/5 inline-flex items-center gap-2 border px-4 py-1 font-mono text-xs">
            <span className="bg-primary h-1.5 w-1.5 rounded-full"></span>
            <span className="text-muted-foreground">
              DISPLAYING RECORDS:{" "}
              <span className="text-primary font-bold">
                {filteredTools.length.toString().padStart(2, "0")}
              </span>{" "}
              / {supportedTools.length.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Tools Grid/List */}
        <div
          className={`${
            viewMode === "grid"
              ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }`}
        >
          {filteredTools.map((tool, index) => (
            <div key={`${tool.name}-${index}`}>
              <ToolCard tool={tool} index={index} viewMode={viewMode} />
            </div>
          ))}
        </div>

        {/* Enhanced Empty State */}
        {filteredTools.length === 0 && (
          <div className="border-primary/20 bg-card/30 border border-dashed py-16 text-center backdrop-blur-sm">
            <div className="border-primary/20 bg-primary/5 mx-auto mb-6 flex h-16 w-16 items-center justify-center border">
              <Search className="text-muted-foreground h-8 w-8" />
            </div>
            <h4 className="text-foreground mb-2 font-mono text-xl font-bold">
              NO_RECORDS_FOUND
            </h4>
            <p className="text-muted-foreground mx-auto mb-6 max-w-md font-mono text-sm">
              {">"} Query returned zero results. Adjust parameters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilter("all");
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 font-mono text-xs font-bold uppercase transition-all"
            >
              RESET_QUERY_PARAMS
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
