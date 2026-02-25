"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Target,
  Key,
  FileSearch,
  Timer,
} from "lucide-react";
import { AnalysisResults } from "@/hooks/useAnalysis";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedScoreRing } from "./AnimatedScoreRing";
import { SmartInsightsSummary } from "./SmartInsightsSummary";

interface UnifiedMetricsHeaderProps {
  results: AnalysisResults;
}

/* Severity distribution mini-bar */
const SeverityBar: React.FC<{
  critical: number;
  high: number;
  medium: number;
  low: number;
}> = ({ critical, high, medium, low }) => {
  const total = critical + high + medium + low;
  if (total === 0)
    return (
      <div className="h-2.5 w-full rounded-full bg-emerald-200/60 dark:bg-emerald-800/30" />
    );
  const pct = (n: number) => `${((n / total) * 100).toFixed(1)}%`;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex h-2.5 w-full cursor-help overflow-hidden rounded-full">
            {critical > 0 && (
              <div
                className="bg-red-500 transition-all duration-700"
                style={{ width: pct(critical) }}
              />
            )}
            {high > 0 && (
              <div
                className="bg-orange-500 transition-all duration-700"
                style={{ width: pct(high) }}
              />
            )}
            {medium > 0 && (
              <div
                className="bg-amber-400 transition-all duration-700"
                style={{ width: pct(medium) }}
              />
            )}
            {low > 0 && (
              <div
                className="bg-sky-400 transition-all duration-700"
                style={{ width: pct(low) }}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Critical: {critical}
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              High: {high}
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Medium: {medium}
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              Low: {low}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/* Stat pill for the quick-stats row */
const StatPill: React.FC<{
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  colorClass?: string;
  tooltip?: string;
}> = ({
  icon: Icon,
  label,
  value,
  colorClass = "text-foreground",
  tooltip,
}) => {
  const content = (
    <div className="border-border/50 bg-card/60 hover:bg-muted/50 flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors">
      <Icon className={`h-4 w-4 flex-shrink-0 ${colorClass}`} />
      <div className="flex flex-col">
        <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
          {label}
        </span>
        <span
          className={`text-sm leading-tight font-bold tabular-nums ${colorClass}`}
        >
          {value}
        </span>
      </div>
    </div>
  );

  if (!tooltip) return content;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const UnifiedMetricsHeader: React.FC<UnifiedMetricsHeaderProps> = ({
  results,
}) => {
  const { summary, issues, metrics } = results;

  const secretCount = issues.filter(
    (issue) =>
      issue?.category === "Secret Detection" || issue?.type === "Secret"
  ).length;

  const critHighTotal = summary.criticalIssues + summary.highIssues;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-border/60 bg-card/95 mb-6 overflow-hidden rounded-2xl border shadow-sm backdrop-blur-sm"
    >
      {/* ─── Top bar with title + file/line stats ─── */}
      <div className="border-border/40 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-foreground text-base font-bold tracking-tight sm:text-lg">
              Security Analysis
            </h3>
            <p className="text-muted-foreground text-[11px] font-medium">
              Executive Summary
            </p>
          </div>
        </div>
        <div className="text-muted-foreground flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <FileSearch className="h-3.5 w-3.5" />
            <span className="text-foreground font-semibold">
              {results.totalFiles}
            </span>{" "}
            files
          </span>
          <span className="flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5" />
            <span className="text-foreground font-semibold">
              {summary.linesAnalyzed.toLocaleString()}
            </span>{" "}
            lines
          </span>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6 sm:py-6">
        {/* ─── Score Rings + Severity Bar + Stats row ─── */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* Left: Score rings */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 lg:justify-start">
            <AnimatedScoreRing
              score={summary.securityScore}
              size={88}
              strokeWidth={7}
              label="Security"
            />
            <AnimatedScoreRing
              score={summary.qualityScore}
              size={88}
              strokeWidth={7}
              label="Quality"
            />
          </div>

          {/* Right: Severity bar + stats */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {/* Severity distribution */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                  Issue Severity Distribution
                </span>
                <span className="text-muted-foreground text-[11px] tabular-nums">
                  {issues.length} total
                </span>
              </div>
              <SeverityBar
                critical={summary.criticalIssues}
                high={summary.highIssues}
                medium={summary.mediumIssues}
                low={summary.lowIssues}
              />
              {/* Legend */}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {[
                  {
                    label: "Critical",
                    count: summary.criticalIssues,
                    color: "bg-red-500",
                  },
                  {
                    label: "High",
                    count: summary.highIssues,
                    color: "bg-orange-500",
                  },
                  {
                    label: "Medium",
                    count: summary.mediumIssues,
                    color: "bg-amber-400",
                  },
                  {
                    label: "Low",
                    count: summary.lowIssues,
                    color: "bg-sky-400",
                  },
                ].map((s) => (
                  <span
                    key={s.label}
                    className="text-muted-foreground flex items-center gap-1.5 text-[11px]"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${s.color}`} />
                    {s.label}{" "}
                    <span className="text-foreground font-semibold tabular-nums">
                      {s.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatPill
                icon={AlertTriangle}
                label="Critical & High"
                value={critHighTotal}
                colorClass={
                  critHighTotal > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }
                tooltip={`${summary.criticalIssues} critical + ${summary.highIssues} high severity issues`}
              />
              <StatPill
                icon={Target}
                label="Vuln Density"
                value={metrics.vulnerabilityDensity}
                colorClass={
                  metrics.vulnerabilityDensity > 5
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-teal-600 dark:text-teal-400"
                }
                tooltip="Issues per 1,000 lines of code. Benchmark: <5"
              />
              <StatPill
                icon={Key}
                label="Secrets"
                value={secretCount}
                colorClass={
                  secretCount > 0
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }
                tooltip="API keys, tokens, and passwords found in source code"
              />
              <StatPill
                icon={Shield}
                label="Total Issues"
                value={issues.length}
                colorClass="text-purple-600 dark:text-purple-400"
                tooltip={`Critical: ${summary.criticalIssues} · High: ${summary.highIssues} · Medium: ${summary.mediumIssues} · Low: ${summary.lowIssues}`}
              />
            </div>
          </div>
        </div>

        {/* ─── Smart Insights ─── */}
        <div className="mt-6">
          <SmartInsightsSummary results={results} />
        </div>
      </div>
    </motion.div>
  );
};
