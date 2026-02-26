"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  AlertTriangle,
  ShieldAlert,
  TrendingDown,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { AnalysisResults } from "@/hooks/useAnalysis";

interface SmartInsightsSummaryProps {
  results: AnalysisResults;
}

interface Insight {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info" | "success";
  actionLabel?: string;
}

export const SmartInsightsSummary: React.FC<SmartInsightsSummaryProps> = ({
  results,
}) => {
  const insights = useMemo(() => {
    const list: Insight[] = [];
    const { summary, issues, metrics } = results;

    // Critical issues need immediate attention
    if (summary.criticalIssues > 0) {
      list.push({
        id: "critical-issues",
        icon: ShieldAlert,
        title: `${summary.criticalIssues} critical vulnerabilit${summary.criticalIssues === 1 ? "y" : "ies"} found`,
        description: `These require immediate attention — ${
          issues
            .filter((i) => i.severity === "Critical")
            .slice(0, 2)
            .map((i) => i.type)
            .join(", ") || "security flaws"
        } detected.`,
        severity: "critical",
        actionLabel: "View critical issues",
      });
    }

    // Secret detection
    const secretCount = issues.filter(
      (i) => i?.category === "Secret Detection" || i?.type === "Secret"
    ).length;
    if (secretCount > 0) {
      list.push({
        id: "secrets-exposed",
        icon: AlertTriangle,
        title: `${secretCount} exposed secret${secretCount === 1 ? "" : "s"} in code`,
        description:
          "API keys, tokens, or passwords committed to source. Rotate immediately and use environment variables.",
        severity: "critical",
      });
    }

    // High vulnerability density
    if (metrics.vulnerabilityDensity > 10) {
      list.push({
        id: "high-density",
        icon: TrendingDown,
        title: "High vulnerability density",
        description: `${metrics.vulnerabilityDensity} issues per 1K lines (benchmark: <5). Consider a dedicated security review sprint.`,
        severity: "warning",
      });
    }

    // Dependency vulnerabilities
    const depVulns = results.dependencyAnalysis?.summary?.vulnerablePackages;
    if (depVulns && depVulns > 0) {
      list.push({
        id: "dep-vulns",
        icon: Zap,
        title: `${depVulns} vulnerable dependenc${depVulns === 1 ? "y" : "ies"}`,
        description:
          "Update affected packages to patched versions. Run dependency audit regularly.",
        severity: "warning",
        actionLabel: "View dependencies",
      });
    }

    // Good code quality
    if (summary.securityScore >= 80 && summary.criticalIssues === 0) {
      list.push({
        id: "good-security",
        icon: CheckCircle2,
        title: "Strong security posture",
        description: `Security score of ${summary.securityScore}/100 with zero critical issues. Keep it up!`,
        severity: "success",
      });
    }

    // Low quality score suggestion
    if (summary.qualityScore < 60) {
      list.push({
        id: "quality-low",
        icon: Lightbulb,
        title: "Code quality can improve",
        description: `Quality score ${summary.qualityScore}/100. Focus on reducing complexity like ${metrics.technicalDebt} of tech debt.`,
        severity: "info",
      });
    }

    // If no issues at all
    if (list.length === 0) {
      list.push({
        id: "all-clear",
        icon: CheckCircle2,
        title: "Looking good!",
        description:
          "No major concerns detected. Continue monitoring with regular scans.",
        severity: "success",
      });
    }

    return list.slice(0, 4); // Max 4 insights
  }, [results]);

  const severityStyles: Record<
    Insight["severity"],
    { bg: string; border: string; icon: string; dot: string }
  > = {
    critical: {
      bg: "bg-red-50/80 dark:bg-red-950/20",
      border: "border-red-200/70 dark:border-red-800/50",
      icon: "text-red-600 dark:text-red-400",
      dot: "bg-red-500",
    },
    warning: {
      bg: "bg-amber-50/80 dark:bg-amber-950/20",
      border: "border-amber-200/70 dark:border-amber-800/50",
      icon: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    info: {
      bg: "bg-blue-50/80 dark:bg-blue-950/20",
      border: "border-blue-200/70 dark:border-blue-800/50",
      icon: "text-blue-600 dark:text-blue-400",
      dot: "bg-blue-500",
    },
    success: {
      bg: "bg-emerald-50/80 dark:bg-emerald-950/20",
      border: "border-emerald-200/70 dark:border-emerald-800/50",
      icon: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="border-border/60 bg-card/80 rounded-2xl border p-4 shadow-sm backdrop-blur-sm sm:p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
          <Lightbulb className="h-3.5 w-3.5 text-white" />
        </div>
        <h3 className="text-foreground text-sm font-bold tracking-tight">
          Smart Insights
        </h3>
      </div>

      <div className="space-y-2.5">
        {insights.map((insight, index) => {
          const styles = severityStyles[insight.severity];
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + index * 0.08 }}
              className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${styles.bg} ${styles.border}`}
            >
              <div
                className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${styles.bg}`}
              >
                <Icon className={`h-4 w-4 ${styles.icon}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${styles.dot}`}
                  />
                  <p className="text-foreground text-xs leading-tight font-semibold">
                    {insight.title}
                  </p>
                </div>
                <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                  {insight.description}
                </p>
                {insight.actionLabel && (
                  <button className="text-primary mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium hover:underline">
                    {insight.actionLabel}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
