import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  CheckCircle,
  ExternalLink,
  Star,
  Brain,
  Lightbulb,
  MessageSquare,
  AlertTriangle,
  Info,
  Settings,
  Wrench,
} from "lucide-react";
import { SecurityIssue } from "@/hooks/useAnalysis";
import { AIFixSuggestionsCard } from "./AIFixSuggestionsCard";
import { FixSuggestion } from "@/services/ai/aiFixSuggestionsService";
import { naturalLanguageDescriptionService } from "@/services/ai/naturalLanguageDescriptionService";
import { toast } from "sonner";

interface SecurityIssueItemProps {
  issue: SecurityIssue;
  isExpanded: boolean;
  onToggle: () => void;
  codeContext?: string;
  language?: string;
  framework?: string;
  onApplyFix?: (suggestion: FixSuggestion) => void;
}

export const SecurityIssueItem: React.FC<SecurityIssueItemProps> = ({
  issue,
  isExpanded,
  onToggle,
  codeContext,
  language,
  framework,
  onApplyFix,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [naturalLanguageDescription, setNaturalLanguageDescription] =
    useState<string>("");
  const [showNaturalLanguage, setShowNaturalLanguage] =
    useState<boolean>(false);

  // Generate natural language description when component mounts or issue changes
  useEffect(() => {
    const description =
      naturalLanguageDescriptionService.generateDescription(issue);
    setNaturalLanguageDescription(description);
  }, [issue]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(type);
      toast.success(`${type} copied to clipboard`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300";
      case "High":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Low":
        return "bg-teal-100 text-blue-800 border-border dark:bg-teal-900/30 dark:text-teal-300";
      default:
        return "bg-muted text-foreground border-border dark:bg-foreground/30 dark:text-muted-foreground";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Critical":
        return "text-purple-600 dark:text-purple-400";
      case "High":
        return "text-red-600 dark:text-red-400";
      case "Medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "Low":
        return "text-primary dark:text-primary";
      default:
        return "text-gray-600 dark:text-muted-foreground";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 dark:text-green-400";
    if (confidence >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getCVSSColor = (score: number) => {
    if (score >= 9.0) return "text-purple-600 dark:text-purple-400";
    if (score >= 7.0) return "text-red-600 dark:text-red-400";
    if (score >= 4.0) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="border-border/50 bg-muted/50 rounded-lg border">
      <button
        type="button"
        onClick={onToggle}
        className="touch-target hover:bg-muted/70 w-full p-4 text-left transition-colors active:scale-[0.99]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge
                className={`${getSeverityColor(issue.severity)} px-2 py-1 text-sm font-medium`}
              >
                {issue.severity}
              </Badge>
              {issue.cvssScore && (
                <Badge
                  variant="outline"
                  className={`${getCVSSColor(issue.cvssScore)} hidden text-xs sm:inline-flex`}
                >
                  CVSS {issue.cvssScore.toFixed(1)}
                </Badge>
              )}
              {issue.confidence && (
                <Badge
                  variant="outline"
                  className={`${getConfidenceColor(issue.confidence)} hidden text-xs md:inline-flex`}
                >
                  {issue.confidence}% confidence
                </Badge>
              )}
              <Badge
                variant="outline"
                className="hidden text-xs lg:inline-flex"
              >
                {issue.tool}
              </Badge>
            </div>
            <div className="mb-3">
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <h3 className="text-foreground text-base font-semibold">
                  {showNaturalLanguage
                    ? "Plain English Summary"
                    : "Technical Details"}
                </h3>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNaturalLanguage(!showNaturalLanguage);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowNaturalLanguage(!showNaturalLanguage);
                    }
                  }}
                  className="touch-target text-muted-foreground inline-flex h-8 cursor-pointer items-center self-start rounded-lg px-3 text-xs transition-colors hover:bg-slate-700 hover:text-white sm:self-auto"
                >
                  <MessageSquare className="mr-1.5 h-3 w-3" />
                  <span className="hidden sm:inline">
                    {showNaturalLanguage ? "Show Technical" : "Plain English"}
                  </span>
                  <span className="sm:hidden">
                    {showNaturalLanguage ? "Technical" : "Plain"}
                  </span>
                </div>
              </div>
              <div className="text-sm leading-relaxed">
                {showNaturalLanguage ? (
                  <p className="text-muted-foreground">
                    {naturalLanguageDescription}
                  </p>
                ) : (
                  <p className="text-foreground font-medium">{issue.message}</p>
                )}
              </div>
            </div>
            <div className="text-muted-foreground flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-2">
              <span className="rounded bg-slate-700 px-2 py-1 font-mono text-xs">
                {issue.filename}:{issue.line}
              </span>
              {issue.category && (
                <span className="text-xs">{issue.category}</span>
              )}
            </div>
          </div>
          <div className="ml-3 flex flex-shrink-0 items-center">
            {isExpanded ? (
              <ChevronDown className="text-muted-foreground h-5 w-5 transition-transform duration-200" />
            ) : (
              <ChevronRight className="text-muted-foreground h-5 w-5 transition-transform duration-200" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-border/50 border-t p-3 sm:p-4">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="bg-muted mb-4 flex w-full snap-x snap-mandatory gap-1 overflow-x-auto rounded-lg p-1 [-ms-overflow-style:'none'] [scrollbar-width:'none'] sm:flex sm:flex-wrap sm:justify-start [&::-webkit-scrollbar]:hidden">
              <TabsTrigger
                value="summary"
                className="touch-target text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex min-w-[90px] flex-shrink-0 snap-center items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs transition-all sm:w-auto sm:text-sm"
              >
                <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                <span>Summary</span>
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="touch-target text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex min-w-[90px] flex-shrink-0 snap-center items-center justify-center rounded-md px-3 py-2 text-xs transition-all sm:w-auto sm:text-sm"
              >
                <span>Technical</span>
              </TabsTrigger>
              <TabsTrigger
                value="remediation"
                className="touch-target text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex min-w-[90px] flex-shrink-0 snap-center items-center justify-center rounded-md px-3 py-2 text-xs transition-all sm:w-auto sm:text-sm"
              >
                <span>Fix Guide</span>
              </TabsTrigger>
              <TabsTrigger
                value="ai-fixes"
                className="touch-target text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex min-w-[90px] flex-shrink-0 snap-center items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs transition-all sm:w-auto sm:text-sm"
              >
                <Brain className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                <span>AI Fixes</span>
              </TabsTrigger>
              <TabsTrigger
                value="references"
                className="touch-target text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex min-w-[90px] flex-shrink-0 snap-center items-center justify-center rounded-md px-3 py-2 text-xs transition-all sm:w-auto sm:text-sm"
              >
                <span>References</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4 space-y-4">
              <div className="border-border rounded-xl border bg-blue-950/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-muted flex-shrink-0 rounded-lg p-2">
                    <MessageSquare className="text-foreground h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="mb-2 text-base font-semibold text-blue-100">
                      What does this mean?
                    </h4>
                    <p className="text-sm leading-relaxed text-blue-200">
                      {naturalLanguageDescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-amber-800 bg-amber-950/20 p-3 sm:p-4">
                  <h4 className="mb-1 flex items-center gap-1 text-sm font-semibold text-amber-100 sm:mb-2 sm:gap-2 sm:text-base">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Risk Level
                  </h4>
                  <p className="text-xs text-amber-200 sm:text-sm">
                    This is a <strong>{issue.severity.toLowerCase()}</strong>{" "}
                    severity issue that {issue.impact.toLowerCase()}.
                  </p>
                  {issue.cvssScore && (
                    <p className="mt-1 text-xs text-amber-300 sm:mt-2 sm:text-sm">
                      CVSS Score: {issue.cvssScore.toFixed(1)}/10
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-green-800 bg-green-950/20 p-3 sm:p-4">
                  <h4 className="mb-1 flex items-center gap-1 text-sm font-semibold text-green-100 sm:mb-2 sm:gap-2 sm:text-base">
                    <Wrench className="h-4 w-4 text-green-400" />
                    What to do
                  </h4>
                  <p className="text-xs text-green-200 sm:text-sm">
                    {issue.remediation.description}
                  </p>
                  <p className="mt-1 text-xs text-green-300 sm:mt-2 sm:text-sm">
                    Estimated effort:{" "}
                    <strong>{issue.remediation.effort}</strong>
                  </p>
                </div>
              </div>

              <div className="border-border/50 bg-muted/50 rounded-lg border p-3 sm:p-4">
                <h4 className="text-foreground mb-2 text-sm font-semibold sm:text-base">
                  Location
                </h4>
                <div className="text-muted-foreground space-y-1.5 text-xs sm:text-sm">
                  <p>
                    Found in{" "}
                    <code className="rounded bg-slate-700 px-1.5 py-0.5 text-xs break-all sm:text-sm">
                      {issue.filename}
                    </code>
                  </p>
                  <p>
                    at line{" "}
                    <strong className="text-foreground">{issue.line}</strong>
                  </p>
                </div>
                {issue.confidence && (
                  <p className="border-border/50 text-muted-foreground mt-2 border-t pt-2 text-xs sm:text-sm">
                    Detection confidence:{" "}
                    <strong className="text-foreground">
                      {issue.confidence}%
                    </strong>
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {}
                <div className="border-border/50 bg-muted/50 rounded-lg border p-3 sm:p-4">
                  <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
                    <Info className="text-primary h-4 w-4" />
                    Issue Details
                  </h4>
                  <div className="space-y-2.5 text-sm">
                    {issue.cweId && (
                      <div className="xs:flex-row xs:items-center xs:gap-2 border-border/50 flex flex-col gap-1 border-b py-2 last:border-0">
                        <span className="text-muted-foreground min-w-[80px] text-xs font-medium sm:text-sm">
                          CWE:
                        </span>
                        <a
                          href={`https://cwe.mitre.org/data/definitions/${issue.cweId.replace("CWE-", "")}.html`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="touch-target-lg text-primary flex items-center gap-1.5 hover:underline"
                        >
                          <span className="text-sm sm:text-base">
                            {issue.cweId}
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                        </a>
                      </div>
                    )}
                    {issue.owaspCategory && (
                      <div className="xs:flex-row xs:items-start xs:gap-2 border-border/50 flex flex-col gap-1 border-b py-2 last:border-0">
                        <span className="text-muted-foreground min-w-[80px] flex-shrink-0 text-xs font-medium sm:text-sm">
                          OWASP:
                        </span>
                        <span className="text-muted-foreground text-sm break-words sm:text-base">
                          {issue.owaspCategory}
                        </span>
                      </div>
                    )}
                    <div className="xs:flex-row xs:items-center xs:gap-2 border-border/50 flex flex-col gap-1 border-b py-2 last:border-0">
                      <span className="text-muted-foreground min-w-[80px] text-xs font-medium sm:text-sm">
                        Risk:
                      </span>
                      <span
                        className={`${getRiskColor(issue.riskRating)} text-sm font-semibold sm:text-base`}
                      >
                        {issue.riskRating}
                      </span>
                    </div>
                    <div className="xs:flex-row xs:items-start xs:gap-2 flex flex-col gap-1 py-2">
                      <span className="text-muted-foreground min-w-[80px] flex-shrink-0 text-xs font-medium sm:text-sm">
                        Impact:
                      </span>
                      <span className="text-muted-foreground text-sm break-words sm:text-base">
                        {issue.impact}
                      </span>
                    </div>
                  </div>
                </div>

                {}
                <div className="border-border/50 bg-muted/50 rounded-lg border p-3 sm:p-4">
                  <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
                    <Settings className="h-4 w-4 text-purple-400" />
                    Technical Information
                  </h4>
                  <div className="space-y-2.5 text-sm">
                    <div className="border-border/50 flex flex-col gap-1 border-b py-2 last:border-0">
                      <span className="text-muted-foreground text-xs font-medium sm:text-sm">
                        File:
                      </span>
                      <span className="text-muted-foreground rounded bg-slate-700 px-2.5 py-1.5 font-mono text-xs break-all sm:text-sm">
                        {issue.filename}:{issue.line}
                      </span>
                    </div>
                    <div className="xs:flex-row xs:items-start xs:gap-2 border-border/50 flex flex-col gap-1 border-b py-2 last:border-0">
                      <span className="text-muted-foreground min-w-[80px] flex-shrink-0 text-xs font-medium sm:text-sm">
                        Category:
                      </span>
                      <span className="text-muted-foreground text-sm break-words sm:text-base">
                        {issue.category}
                      </span>
                    </div>
                    {issue.tool && (
                      <div className="xs:flex-row xs:items-center xs:gap-2 flex flex-col gap-1 py-2">
                        <span className="text-muted-foreground min-w-[80px] text-xs font-medium sm:text-sm">
                          Detected by:
                        </span>
                        <Badge
                          variant="outline"
                          className="xs:self-auto text-muted-foreground self-start border-slate-600 text-xs sm:text-sm"
                        >
                          {issue.tool}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="remediation" className="space-y-3 sm:space-y-4">
              <div className="border-border/50 bg-muted/50 rounded-lg border p-3 sm:p-4">
                <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
                  <Wrench className="h-4 w-4 text-green-400" />
                  Remediation Guidance
                </h4>
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground leading-relaxed">
                    {issue.remediation.description}
                  </p>
                  <div className="xs:flex-row xs:items-center border-border/50 flex flex-col gap-3 border-t pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs font-medium sm:text-sm">
                        Effort:
                      </span>
                      <Badge
                        variant="outline"
                        className="text-muted-foreground border-slate-600 text-xs sm:text-sm"
                      >
                        {issue.remediation.effort}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs font-medium sm:text-sm">
                        Priority:
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                              i < issue.remediation.priority
                                ? "fill-current text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {}
              {(issue.codeSnippet || issue.remediation.codeExample) && (
                <div className="space-y-3 sm:space-y-4">
                  {issue.remediation.codeExample && (
                    <div className="rounded-lg border border-red-800 bg-red-950/20 p-3 sm:p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-red-400 sm:text-base">
                          <AlertTriangle className="h-4 w-4" />
                          Vulnerable Code
                        </h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(
                              issue.remediation.codeExample!,
                              "Vulnerable code"
                            )
                          }
                          className="touch-target text-muted-foreground border-slate-600 px-2 hover:bg-slate-700 sm:px-3"
                        >
                          {copiedCode === "Vulnerable code" ? (
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          )}
                          <span className="ml-1.5 hidden text-xs sm:inline">
                            Copy
                          </span>
                        </Button>
                      </div>
                      <div className="bg-card/50 overflow-hidden rounded-lg">
                        <pre className="overflow-x-auto p-3 text-xs sm:p-4 sm:text-sm">
                          <code className="text-red-200">
                            {issue.remediation.codeExample}
                          </code>
                        </pre>
                      </div>
                    </div>
                  )}

                  {issue.remediation.fixExample && (
                    <div className="rounded-lg border border-green-800 bg-green-950/20 p-3 sm:p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-green-400 sm:text-base">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          Fixed Code
                        </h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(
                              issue.remediation.fixExample!,
                              "Fixed code"
                            )
                          }
                          className="touch-target text-muted-foreground border-slate-600 px-2 hover:bg-slate-700 sm:px-3"
                        >
                          {copiedCode === "Fixed code" ? (
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          )}
                          <span className="ml-1.5 hidden text-xs sm:inline">
                            Copy
                          </span>
                        </Button>
                      </div>
                      <div className="bg-card/50 overflow-hidden rounded-lg">
                        <pre className="overflow-x-auto p-3 text-xs sm:p-4 sm:text-sm">
                          <code className="text-green-200">
                            {issue.remediation.fixExample}
                          </code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai-fixes" className="space-y-4">
              {codeContext && language ? (
                <AIFixSuggestionsCard
                  issue={issue}
                  codeContext={codeContext}
                  language={language}
                  framework={framework}
                  onApplyFix={onApplyFix}
                />
              ) : (
                <div className="py-8 text-center">
                  <Lightbulb className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground mb-2">
                    AI fix suggestions require code context
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Upload a file with this issue to get AI-powered fix
                    suggestions
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="references" className="space-y-4">
              {issue.references && issue.references.length > 0 ? (
                <div className="border-border/50 bg-muted/50 rounded-lg border p-3 sm:p-4">
                  <h4 className="text-foreground mb-3 flex items-center gap-2 text-base font-semibold">
                    <ExternalLink className="text-primary h-4 w-4" />
                    External References
                  </h4>
                  <div className="space-y-2">
                    {issue.references.map((ref) => (
                      <a
                        key={ref}
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="touch-target text-primary flex items-start gap-2 rounded p-2 text-xs break-all transition-colors hover:bg-slate-700/50 hover:underline sm:text-sm"
                      >
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                        <span className="break-all">{ref}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <ExternalLink className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground">
                    No external references available for this issue
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};
