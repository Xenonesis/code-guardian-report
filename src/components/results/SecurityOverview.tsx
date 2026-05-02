import React, { useState, useMemo } from "react";
import { Shield, ChevronDown, ChevronUp, FileWarning } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AnalysisResults } from "@/hooks/useAnalysis";
import { SecurityIssueItem } from "@/components/security/SecurityIssueItem";
import { SecretDetectionCard } from "@/components/security/SecretDetectionCard";
import { SecureCodeSearchCard } from "@/components/security/SecureCodeSearchCard";
import { CodeProvenanceCard } from "@/components/security/CodeProvenanceCard";
import { ModernSecurityDashboard } from "@/components/security/ModernSecurityDashboard";
import { LanguageDetectionSummary } from "../language/LanguageDetectionSummary";
import { PDFDownloadButton } from "../export/PDFDownloadButton";
import { FixSuggestion } from "@/services/ai/aiFixSuggestionsService";
import { modernCodeScanningService } from "@/services/security/modernCodeScanningService";
import { toast } from "sonner";

import { logger } from "@/utils/logger";
interface SecurityOverviewProps {
  results: AnalysisResults;
  isLoading?: boolean;
}

export const SecurityOverview: React.FC<SecurityOverviewProps> = ({
  results,
  isLoading,
}) => {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  const toggleIssueExpansion = (issueId: string) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId);
    } else {
      newExpanded.add(issueId);
    }
    setExpandedIssues(newExpanded);
  };

  const handleApplyFix = (suggestion: FixSuggestion) => {
    try {
      // Generate a patch file with the suggested changes
      const patchContent = suggestion.codeChanges
        .map((change) => {
          return `
========================================
File: ${change.filename}
Lines: ${change.startLine}-${change.endLine}
Type: ${change.type}
========================================

--- Original Code
${change.originalCode}

+++ Suggested Fix
${change.suggestedCode}

Reasoning: ${change.reasoning}
Confidence: ${suggestion.confidence}%
`;
        })
        .join("\n");

      const fullPatch = `# Security Fix Suggestion
# Title: ${suggestion.title}
# Description: ${suggestion.description}
# Confidence: ${suggestion.confidence}%
# Estimated Effort: ${suggestion.effort}
# Priority: ${suggestion.priority}

${patchContent}

# Security Benefit:
${suggestion.securityBenefit}

# Risk Assessment:
${suggestion.riskAssessment}

# Testing Recommendations:
${suggestion.testingRecommendations.map((rec, i) => `${i + 1}. ${rec}`).join("\n")}

# How to Apply:
# 1. Review each change carefully
# 2. Manually apply the changes to your source files
# 3. Test thoroughly before committing
# 4. Run your security analysis again to verify the fix
`;

      // Create a downloadable patch file using browser APIs
      const blob = new Blob([fullPatch], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `security-fix-${suggestion.issueId}-${Date.now()}.patch`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success(`Downloaded fix patch: "${suggestion.title}"`, {
        description: `${suggestion.codeChanges.length} changes with ${suggestion.confidence}% confidence. Review and apply manually.`,
      });
    } catch (err) {
      toast.error("Failed to generate fix patch", {
        description:
          err instanceof Error ? err.message : "Unknown error occurred",
      });
    }
  };

  // Extract language and framework information from detection results
  const primaryLanguage =
    results.languageDetection?.primaryLanguage?.name || "unknown";
  const primaryFramework = results.languageDetection?.frameworks?.[0]?.name;

  // Separate secret detection issues from other security issues
  const secretIssues = results.issues.filter(
    (issue) =>
      issue?.category === "Secret Detection" || issue?.type === "Secret"
  );
  const otherIssues = results.issues.filter(
    (issue) =>
      issue?.category !== "Secret Detection" && issue?.type !== "Secret"
  );

  // Combine all issues for display - show both secret and other security issues
  const allIssues = [...secretIssues, ...otherIssues];

  // Prepare files for provenance monitoring (deduplicated by filename)
  const seenFiles = new Set<string>();
  const filesForProvenance = allIssues
    .filter((issue) => {
      if (seenFiles.has(issue.filename)) return false;
      seenFiles.add(issue.filename);
      return true;
    })
    .map((issue) => ({
      filename: issue.filename,
      content:
        issue.codeSnippet ||
        `// File: ${issue.filename}\n// Issue: ${issue.message}`,
    }));

  if (isLoading) {
    return (
      <div className="space-y-6 px-4 sm:px-0" role="status" aria-live="polite">
        <Card className="border-border bg-gradient-to-br from-slate-50 to-white shadow-sm dark:from-slate-900/40 dark:to-slate-900/10">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="bg-muted h-6 w-48 rounded" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="bg-muted h-32 rounded-lg" />
                <div className="bg-muted h-32 rounded-lg" />
                <div className="bg-muted h-32 rounded-lg" />
              </div>
              <div className="space-y-3">
                <div className="bg-muted h-4 w-64 rounded" />
                <div className="bg-muted h-4 w-80 rounded" />
                <div className="bg-muted h-20 rounded-lg" />
                <div className="bg-muted h-20 rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Language Detection Summary */}
      {results.languageDetection && (
        <LanguageDetectionSummary
          detectionResult={results.languageDetection}
          className="mb-6"
        />
      )}

      {/* Modern Code Quality Dashboard - SonarQube-style metrics */}
      {(() => {
        // Calculate aggregate modern metrics from all files
        let totalMetrics = {
          cyclomaticComplexity: 0,
          cognitiveComplexity: 0,
          linesOfCode: 0,
          commentLines: 0,
          blankLines: 0,
          maintainabilityIndex: 0,
          technicalDebtRatio: 0,
          codeSmells: 0,
          bugs: 0,
          vulnerabilities: 0,
          securityHotspots: 0,
          estimatedTestCoverage: 0,
          duplicatedBlocks: 0,
          duplicatedLines: 0,
        };
        let totalDebt = 0;
        let fileCount = 0;

        // Analyze each file to get modern metrics
        const zipFiles = results.zipAnalysis?.files || [];
        for (const file of zipFiles) {
          try {
            const analysis = modernCodeScanningService.analyzeCode(
              file.content,
              file.name,
              file.language || "javascript"
            );

            totalMetrics.cyclomaticComplexity +=
              analysis.metrics.cyclomaticComplexity;
            totalMetrics.cognitiveComplexity +=
              analysis.metrics.cognitiveComplexity;
            totalMetrics.linesOfCode += analysis.metrics.linesOfCode;
            totalMetrics.commentLines += analysis.metrics.commentLines;
            totalMetrics.blankLines += analysis.metrics.blankLines;
            totalMetrics.maintainabilityIndex +=
              analysis.metrics.maintainabilityIndex;
            totalMetrics.codeSmells += analysis.metrics.codeSmells;
            totalMetrics.bugs += analysis.metrics.bugs;
            totalMetrics.vulnerabilities += analysis.metrics.vulnerabilities;
            totalMetrics.securityHotspots += analysis.metrics.securityHotspots;
            totalMetrics.duplicatedBlocks += analysis.metrics.duplicatedBlocks;
            totalMetrics.duplicatedLines += analysis.metrics.duplicatedLines;

            totalDebt += analysis.technicalDebt;
            fileCount++;
          } catch (error) {
            logger.warn(
              `Failed to analyze ${file.name} for modern metrics:`,
              error
            );
          }
        }

        // Average maintainability index across files
        if (fileCount > 0) {
          totalMetrics.maintainabilityIndex =
            totalMetrics.maintainabilityIndex / fileCount;
          totalMetrics.technicalDebtRatio =
            totalMetrics.linesOfCode > 0
              ? (totalDebt / (totalMetrics.linesOfCode * 0.06)) * 100
              : 0;
        }

        // Create quality gate based on aggregated metrics
        const qualityGate = {
          passed:
            totalMetrics.vulnerabilities === 0 &&
            totalMetrics.bugs <= 5 &&
            totalMetrics.maintainabilityIndex >= 65,
          conditions: [
            {
              metric: "New Vulnerabilities",
              status: (totalMetrics.vulnerabilities === 0 ? "OK" : "ERROR") as
                | "OK"
                | "ERROR",
              value: totalMetrics.vulnerabilities,
              threshold: 0,
            },
            {
              metric: "New Bugs",
              status: (totalMetrics.bugs <= 5 ? "OK" : "ERROR") as
                | "OK"
                | "ERROR",
              value: totalMetrics.bugs,
              threshold: 5,
            },
            {
              metric: "Maintainability Index",
              status: (totalMetrics.maintainabilityIndex >= 65
                ? "OK"
                : "ERROR") as "OK" | "ERROR",
              value: Math.round(totalMetrics.maintainabilityIndex),
              threshold: 65,
            },
            {
              metric: "Technical Debt Ratio",
              status: (totalMetrics.technicalDebtRatio <= 5
                ? "OK"
                : "ERROR") as "OK" | "ERROR",
              value: Number(totalMetrics.technicalDebtRatio.toFixed(1)),
              threshold: 5,
            },
            {
              metric: "Code Smells",
              status: (totalMetrics.codeSmells <= 10 ? "OK" : "ERROR") as
                | "OK"
                | "ERROR",
              value: totalMetrics.codeSmells,
              threshold: 10,
            },
            {
              metric: "Duplicated Lines Density",
              status: ((totalMetrics.duplicatedLines /
                Math.max(totalMetrics.linesOfCode, 1)) *
                100 <=
              3
                ? "OK"
                : "ERROR") as "OK" | "ERROR",
              value: Number(
                (
                  (totalMetrics.duplicatedLines /
                    Math.max(totalMetrics.linesOfCode, 1)) *
                  100
                ).toFixed(1)
              ),
              threshold: 3,
            },
          ],
        };

        return fileCount > 0 ? (
          <ModernSecurityDashboard
            metrics={totalMetrics}
            technicalDebt={totalDebt}
            qualityGate={qualityGate}
            totalIssues={results.issues?.length || 0}
          />
        ) : null;
      })()}

      {/* PDF Download Section */}
      <div className="mb-4 flex justify-end">
        <PDFDownloadButton
          results={results}
          variant="default"
          size="sm"
          className="bg-primary hover:bg-primary/90 text-white shadow-lg"
        />
      </div>

      {/* Secret Detection Section */}
      <SecretDetectionCard secretIssues={secretIssues} />

      {/* Secure Code Search Section */}
      <SecureCodeSearchCard
        language={primaryLanguage}
        framework={primaryFramework}
        vulnerabilityType={
          otherIssues.length > 0 ? otherIssues[0].type : undefined
        }
      />

      {/* Code Provenance & Integrity Monitoring Section */}
      <CodeProvenanceCard
        files={filesForProvenance}
        onInitializeMonitoring={() => {
          toast.success("File integrity monitoring initialized");
        }}
      />

      {/* File Risk Heatmap */}
      {(() => {
        // Group issues by file, count severity weights
        const fileRiskMap = new Map<
          string,
          {
            critical: number;
            high: number;
            medium: number;
            low: number;
            total: number;
          }
        >();
        for (const issue of otherIssues) {
          const entry = fileRiskMap.get(issue.filename) || {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            total: 0,
          };
          if (issue.severity === "Critical") entry.critical++;
          else if (issue.severity === "High") entry.high++;
          else if (issue.severity === "Medium") entry.medium++;
          else entry.low++;
          entry.total++;
          fileRiskMap.set(issue.filename, entry);
        }

        const sortedFiles = [...fileRiskMap.entries()]
          .sort(
            (a, b) =>
              b[1].critical * 4 +
              b[1].high * 3 +
              b[1].medium * 2 +
              b[1].low -
              (a[1].critical * 4 + a[1].high * 3 + a[1].medium * 2 + a[1].low)
          )
          .slice(0, 8);

        if (sortedFiles.length === 0) return null;

        const maxWeight = Math.max(
          ...sortedFiles.map(
            ([, s]) => s.critical * 4 + s.high * 3 + s.medium * 2 + s.low
          )
        );

        return (
          <div className="border-border/50 bg-card/50 rounded-xl border p-5">
            <h3 className="text-foreground mb-4 flex items-center gap-2 text-sm font-bold">
              <FileWarning className="h-4 w-4 text-amber-500" />
              Highest Risk Files
            </h3>
            <div className="space-y-2">
              {sortedFiles.map(([filename, counts]) => {
                const weight =
                  counts.critical * 4 +
                  counts.high * 3 +
                  counts.medium * 2 +
                  counts.low;
                const pct = maxWeight > 0 ? (weight / maxWeight) * 100 : 0;
                return (
                  <div key={filename} className="group">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-foreground truncate font-mono text-xs">
                        {filename}
                      </span>
                      <span className="text-muted-foreground flex-shrink-0 text-[10px] tabular-nums">
                        {counts.total} issue{counts.total !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="bg-muted/50 flex h-2 w-full overflow-hidden rounded-full">
                      {counts.critical > 0 && (
                        <div
                          className="bg-red-500 transition-all duration-500"
                          style={{
                            width: `${(counts.critical / counts.total) * pct}%`,
                          }}
                        />
                      )}
                      {counts.high > 0 && (
                        <div
                          className="bg-orange-500 transition-all duration-500"
                          style={{
                            width: `${(counts.high / counts.total) * pct}%`,
                          }}
                        />
                      )}
                      {counts.medium > 0 && (
                        <div
                          className="bg-amber-400 transition-all duration-500"
                          style={{
                            width: `${(counts.medium / counts.total) * pct}%`,
                          }}
                        />
                      )}
                      {counts.low > 0 && (
                        <div
                          className="bg-sky-400 transition-all duration-500"
                          style={{
                            width: `${(counts.low / counts.total) * pct}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Grouped Security Issues */}
      <IssuesByGroup
        issues={allIssues}
        expandedIssues={expandedIssues}
        onToggleExpand={toggleIssueExpansion}
        primaryLanguage={primaryLanguage}
        primaryFramework={primaryFramework}
        onApplyFix={handleApplyFix}
      />
    </div>
  );
};

/* ─── Issues grouped by severity with collapsible sections ─── */

interface IssuesByGroupProps {
  issues: SecurityOverviewProps["results"]["issues"];
  expandedIssues: Set<string>;
  onToggleExpand: (id: string) => void;
  primaryLanguage: string;
  primaryFramework?: string;
  onApplyFix: (s: FixSuggestion) => void;
}

const SEVERITY_ORDER = ["Critical", "High", "Medium", "Low"] as const;
const SEVERITY_STYLES: Record<
  string,
  { dot: string; border: string; bg: string }
> = {
  Critical: {
    dot: "bg-red-500",
    border: "border-red-200/60 dark:border-red-800/40",
    bg: "bg-red-50/50 dark:bg-red-950/10",
  },
  High: {
    dot: "bg-orange-500",
    border: "border-orange-200/60 dark:border-orange-800/40",
    bg: "bg-orange-50/50 dark:bg-orange-950/10",
  },
  Medium: {
    dot: "bg-amber-400",
    border: "border-amber-200/60 dark:border-amber-800/40",
    bg: "bg-amber-50/50 dark:bg-amber-950/10",
  },
  Low: {
    dot: "bg-sky-400",
    border: "border-sky-200/60 dark:border-sky-800/40",
    bg: "bg-sky-50/50 dark:bg-sky-950/10",
  },
};

const IssuesByGroup: React.FC<IssuesByGroupProps> = ({
  issues,
  expandedIssues,
  onToggleExpand,
  primaryLanguage,
  primaryFramework,
  onApplyFix,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );

  const grouped = useMemo(() => {
    const groups: Record<string, typeof issues> = {};
    for (const sev of SEVERITY_ORDER) {
      const filtered = issues.filter((i) => i.severity === sev);
      if (filtered.length > 0) groups[sev] = filtered;
    }
    return groups;
  }, [issues]);

  const toggleGroup = (severity: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(severity)) next.delete(severity);
      else next.add(severity);
      return next;
    });
  };

  if (issues.length === 0) {
    return (
      <div className="border-border/50 bg-card/50 rounded-xl border p-8 text-center">
        <Shield className="mx-auto mb-3 h-8 w-8 text-emerald-500" />
        <p className="text-foreground font-semibold">
          No security issues detected
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Your code looks clean — keep it that way!
        </p>
      </div>
    );
  }

  return (
    <div className="border-border/50 bg-card/50 overflow-hidden rounded-xl border">
      <div className="border-border/50 border-b px-5 py-4">
        <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
          <Shield className="h-5 w-5" />
          Security Issues ({issues.length})
        </h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Grouped by severity · OWASP classifications · CVSS scoring
        </p>
      </div>

      <div className="divide-border/40 divide-y">
        {Object.entries(grouped).map(([severity, groupIssues]) => {
          const styles = SEVERITY_STYLES[severity] || SEVERITY_STYLES.Low;
          const isCollapsed = collapsedGroups.has(severity);
          return (
            <div key={severity}>
              <button
                onClick={() => toggleGroup(severity)}
                className={`hover:bg-muted/30 flex w-full items-center justify-between px-5 py-3 transition-colors ${styles.bg}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
                  <span className="text-foreground text-sm font-bold">
                    {severity}
                  </span>
                  <span className="text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums">
                    {groupIssues.length}
                  </span>
                </div>
                {isCollapsed ? (
                  <ChevronDown className="text-muted-foreground h-4 w-4" />
                ) : (
                  <ChevronUp className="text-muted-foreground h-4 w-4" />
                )}
              </button>
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 px-5 py-4">
                      {groupIssues.map((issue, index) => (
                        <SecurityIssueItem
                          key={`${issue.id}_${index}`}
                          issue={issue}
                          isExpanded={expandedIssues.has(issue.id)}
                          onToggle={() => onToggleExpand(issue.id)}
                          codeContext={
                            issue.codeSnippet ||
                            `// Code context for ${issue.filename}:${issue.line}\n// ${issue.message}`
                          }
                          language={primaryLanguage}
                          framework={primaryFramework}
                          onApplyFix={onApplyFix}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
