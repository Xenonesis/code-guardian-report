import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  AlertTriangle,
  Bug,
  Shield,
  Code,
  ExternalLink,
  Download,
  ChevronDown,
  ChevronRight,
  Brain,
  MapPin,
  Loader2,
  BarChart3,
} from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AIService } from "../../services/ai/aiService";
import EnhancedAnalyticsDashboard from "@/components/EnhancedAnalyticsDashboard";
import { PDFDownloadButton } from "../export/PDFDownloadButton";
import { toast } from "sonner";
import { SecurityIssue, AnalysisResults } from "@/hooks/useAnalysis";

import { logger } from "@/utils/logger";
// Use SecurityIssue interface from hooks, but keep backward compatibility
interface Issue extends Partial<SecurityIssue> {
  line: number;
  tool: string;
  type: string;
  message: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  recommendation: string;
  filename: string;
}

interface ResultsTableProps {
  issues: SecurityIssue[];
  totalFiles: number;
  analysisTime: string;
  results?: AnalysisResults; // For PDF download compatibility
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  issues,
  totalFiles,
  analysisTime,
  results,
}) => {
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [hasApiKeys, setHasApiKeys] = useState(false);
  const aiService = useMemo(() => new AIService(), []);

  // Check for API keys on component mount
  useEffect(() => {
    const checkApiKeys = () => {
      try {
        const keys = localStorage.getItem("aiApiKeys");
        const parsedKeys = keys ? JSON.parse(keys) : [];
        setHasApiKeys(parsedKeys.length > 0);
        logger.debug("API keys available:", parsedKeys.length > 0);
      } catch (error) {
        logger.error("Error checking API keys:", error);
        setHasApiKeys(false);
      }
    };

    checkApiKeys();

    // Listen for storage changes (when keys are added/removed)
    const handleStorageChange = () => {
      checkApiKeys();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const generateAISummary = useCallback(async () => {
    logger.debug("Starting AI summary generation...");
    setIsGeneratingSummary(true);

    try {
      if (!hasApiKeys) {
        throw new Error(
          "No AI API keys configured. Please add an API key in the AI Configuration tab."
        );
      }

      if (!issues || issues.length === 0) {
        throw new Error("No issues available to summarize");
      }

      logger.debug(`Generating summary for ${issues.length} issues`);

      const summary = await aiService.generateSummary(issues);
      logger.debug(
        "Summary generated successfully:",
        summary.substring(0, 100) + "..."
      );

      setAiSummary(summary);
      toast.success("AI summary generated successfully!");
    } catch (error) {
      logger.error("Detailed error generating AI summary:", error);

      let errorMessage = "Failed to generate AI summary.";

      if (error instanceof Error) {
        logger.debug("Error message:", error.message);

        if (error.message.includes("No AI API keys configured")) {
          errorMessage =
            "Please configure your AI API keys in the AI Configuration tab to generate summaries.";
        } else if (error.message.includes("All AI providers failed")) {
          errorMessage =
            "Unable to connect to AI services. Please verify your API keys are valid and have sufficient credits.";
        } else if (error.message.includes("No issues available")) {
          errorMessage = "No analysis results found to summarize.";
        } else {
          errorMessage = `AI Summary Error: ${error.message}`;
        }
      }

      logger.error("Final error message for user:", errorMessage);
      toast.error(errorMessage);

      // Set a fallback summary if API fails
      setAiSummary(`Unable to generate AI summary. Manual analysis shows:
      
      **Analysis Overview:**
      - Total Issues: ${issues.length}
      - High Severity: ${issues.filter((i) => i.severity === "High").length}
      - Medium Severity: ${issues.filter((i) => i.severity === "Medium").length}
      - Low Severity: ${issues.filter((i) => i.severity === "Low").length}
      
      **Security Issues:** ${issues.filter((i) => i.type?.toLowerCase() === "security").length}
      **Bug Issues:** ${issues.filter((i) => i.type?.toLowerCase() === "bug").length}
      **Code Quality Issues:** ${issues.filter((i) => i.type?.toLowerCase() === "code smell").length}
      
      Please configure your AI API keys to get detailed insights and recommendations.`);
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [hasApiKeys, issues, aiService]);

  // Auto-generate summary when component mounts if we have API keys and issues
  useEffect(() => {
    if (hasApiKeys && issues.length > 0 && !aiSummary && !isGeneratingSummary) {
      logger.debug("Auto-generating AI summary...");
      generateAISummary();
    }
  }, [
    hasApiKeys,
    issues.length,
    aiSummary,
    isGeneratingSummary,
    generateAISummary,
  ]);

  const toggleIssueExpansion = (index: number) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedIssues(newExpanded);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600";
      case "High":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600";
      case "Low":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "security":
        return <Shield className="h-4 w-4" />;
      case "bug":
        return <Bug className="h-4 w-4" />;
      case "code smell":
        return <Code className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 dark:text-green-400";
    if (confidence >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const securityIssues = issues.filter(
    (i) => i.type.toLowerCase() === "security"
  );
  const bugIssues = issues.filter((i) => i.type.toLowerCase() === "bug");
  const codeSmellIssues = issues.filter(
    (i) => i.type.toLowerCase() === "code smell"
  );

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      {/* PDF Download Button */}
      {results && (
        <div className="flex justify-end">
          <PDFDownloadButton
            results={results}
            variant="outline"
            size="sm"
            className="border-border bg-card/90 hover:bg-card backdrop-blur-sm"
          />
        </div>
      )}

      {/* Enhanced Summary Cards */}
      <section aria-labelledby="summary-title">
        <h2 id="summary-title" className="sr-only">
          Analysis Summary
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          <Card className="card-hover animate-scale-in animate-stagger-1 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <AlertTriangle
                  className="h-4 w-4 flex-shrink-0 text-amber-600 sm:h-5 sm:w-5 lg:h-6 lg:w-6 dark:text-amber-400"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-base font-bold text-amber-800 sm:text-lg lg:text-2xl dark:text-amber-200">
                    {issues.length}
                  </p>
                  <p className="text-xs leading-tight text-amber-600 sm:text-sm dark:text-amber-400">
                    Total Issues
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover animate-scale-in animate-stagger-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 dark:border-red-800 dark:from-red-950/20 dark:to-pink-950/20">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Shield
                  className="h-4 w-4 flex-shrink-0 text-red-600 sm:h-5 sm:w-5 lg:h-6 lg:w-6 dark:text-red-400"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-base font-bold text-red-800 sm:text-lg lg:text-2xl dark:text-red-200">
                    {securityIssues.length}
                  </p>
                  <p className="text-xs leading-tight text-red-600 sm:text-sm dark:text-red-400">
                    Security Issues
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover animate-scale-in animate-stagger-3 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Code
                  className="h-4 w-4 flex-shrink-0 text-blue-600 sm:h-5 sm:w-5 lg:h-6 lg:w-6 dark:text-blue-400"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-base font-bold text-blue-800 sm:text-lg lg:text-2xl dark:text-blue-200">
                    {totalFiles}
                  </p>
                  <p className="text-xs leading-tight text-blue-600 sm:text-sm dark:text-blue-400">
                    Files Analyzed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover animate-scale-in animate-stagger-4 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Bug
                  className="h-4 w-4 flex-shrink-0 text-green-600 sm:h-5 sm:w-5 lg:h-6 lg:w-6 dark:text-green-400"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-base font-bold text-green-800 sm:text-lg lg:text-2xl dark:text-green-200">
                    {analysisTime}
                  </p>
                  <p className="text-xs leading-tight text-green-600 sm:text-sm dark:text-green-400">
                    Analysis Time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Tabs with Analytics */}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList
          className="border-border bg-card/80 grid h-auto w-full grid-cols-2 overflow-hidden rounded-lg border shadow-lg backdrop-blur-sm sm:grid-cols-3 lg:grid-cols-5"
          role="tablist"
          aria-label="Analysis results tabs"
        >
          <TabsTrigger
            value="analytics"
            className="focus-ring touch-target flex items-center justify-center gap-1 px-2 py-3 text-xs transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white sm:gap-2 sm:px-3 sm:py-3 sm:text-sm"
            role="tab"
          >
            <BarChart3
              className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4"
              aria-hidden="true"
            />
            <span className="xs:inline hidden sm:hidden lg:inline">
              Analytics
            </span>
            <span className="xs:hidden sm:inline lg:hidden">Charts</span>
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="focus-ring touch-target flex items-center justify-center gap-1 px-2 py-3 text-xs transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white sm:gap-2 sm:px-3 sm:py-3 sm:text-sm"
            role="tab"
          >
            <span className="hidden md:inline">
              All Issues ({issues.length})
            </span>
            <span className="md:hidden">All ({issues.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="focus-ring touch-target flex items-center justify-center gap-1 px-2 py-3 text-xs transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white sm:gap-2 sm:px-3 sm:py-3 sm:text-sm"
            role="tab"
          >
            <span className="hidden md:inline">
              Security ({securityIssues.length})
            </span>
            <span className="md:hidden">Sec ({securityIssues.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="bugs"
            className="focus-ring touch-target flex items-center justify-center gap-1 px-2 py-3 text-xs transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white sm:gap-2 sm:px-3 sm:py-3 sm:text-sm"
            role="tab"
          >
            <span className="hidden md:inline">Bugs ({bugIssues.length})</span>
            <span className="md:hidden">Bug ({bugIssues.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="code-smell"
            className="focus-ring touch-target flex items-center justify-center gap-1 px-2 py-3 text-xs transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white sm:gap-2 sm:px-3 sm:py-3 sm:text-sm"
            role="tab"
          >
            <span className="hidden md:inline">
              Code Quality ({codeSmellIssues.length})
            </span>
            <span className="md:hidden">
              Quality ({codeSmellIssues.length})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <EnhancedAnalyticsDashboard issues={issues} />
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-6">
            {/* AI Summary Section */}
            <Card className="bg-card/90 border-0 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI Analysis Summary
                  {hasApiKeys && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      API Connected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {hasApiKeys
                    ? "Comprehensive insights and recommendations from AI analysis"
                    : "Configure your AI API keys to get detailed insights and recommendations"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGeneratingSummary ? (
                  <div className="py-8 text-center">
                    <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-purple-600" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Generating AI summary using your configured API keys...
                    </p>
                  </div>
                ) : aiSummary ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/20">
                      <div className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                        {aiSummary}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={generateAISummary}
                        disabled={isGeneratingSummary}
                        variant="outline"
                        size="sm"
                      >
                        <Brain className="mr-2 h-4 w-4" />
                        Regenerate Summary
                      </Button>
                      {!hasApiKeys && (
                        <Badge
                          variant="outline"
                          className="border-orange-300 text-orange-600"
                        >
                          Manual Summary (No API Keys)
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Button
                      onClick={generateAISummary}
                      disabled={isGeneratingSummary}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Brain className="mr-2 h-4 w-4" />
                      Generate AI Summary
                    </Button>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {hasApiKeys
                        ? "Click to generate detailed insights and recommendations"
                        : "Please configure your AI API keys in the AI Configuration tab first"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <DetailedIssuesTable
              issues={issues}
              getSeverityColor={getSeverityColor}
              getTypeIcon={getTypeIcon}
              getConfidenceColor={getConfidenceColor}
              expandedIssues={expandedIssues}
              toggleIssueExpansion={toggleIssueExpansion}
            />
          </div>
        </TabsContent>

        <TabsContent value="security">
          <DetailedIssuesTable
            issues={securityIssues}
            getSeverityColor={getSeverityColor}
            getTypeIcon={getTypeIcon}
            getConfidenceColor={getConfidenceColor}
            expandedIssues={expandedIssues}
            toggleIssueExpansion={toggleIssueExpansion}
          />
        </TabsContent>

        <TabsContent value="bugs">
          <DetailedIssuesTable
            issues={bugIssues}
            getSeverityColor={getSeverityColor}
            getTypeIcon={getTypeIcon}
            getConfidenceColor={getConfidenceColor}
            expandedIssues={expandedIssues}
            toggleIssueExpansion={toggleIssueExpansion}
          />
        </TabsContent>

        <TabsContent value="code-smell">
          <DetailedIssuesTable
            issues={codeSmellIssues}
            getSeverityColor={getSeverityColor}
            getTypeIcon={getTypeIcon}
            getConfidenceColor={getConfidenceColor}
            expandedIssues={expandedIssues}
            toggleIssueExpansion={toggleIssueExpansion}
          />
        </TabsContent>
      </Tabs>

      {/* Enhanced Export Options */}
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        <Button
          variant="outline"
          className="btn-responsive touch-target flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/20"
        >
          <Download className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Export Detailed Report (PDF)</span>
          <span className="sm:hidden">Export PDF</span>
        </Button>
        <Button
          variant="outline"
          className="btn-responsive touch-target flex items-center justify-center gap-2 hover:bg-green-50 dark:hover:bg-green-950/20"
        >
          <Download className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Export Raw Data (JSON)</span>
          <span className="sm:hidden">Export JSON</span>
        </Button>
        <Button
          variant="outline"
          className="btn-responsive touch-target flex items-center justify-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/20"
          onClick={generateAISummary}
          disabled={isGeneratingSummary}
        >
          <Brain className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">
            {isGeneratingSummary ? "Generating..." : "Generate AI Summary"}
          </span>
          <span className="sm:hidden">
            {isGeneratingSummary ? "Generating..." : "AI Summary"}
          </span>
        </Button>
      </div>
    </div>
  );
};

interface DetailedIssuesTableProps {
  issues: Issue[];
  getSeverityColor: (severity: string) => string;
  getTypeIcon: (type: string) => React.ReactNode;
  getConfidenceColor: (confidence: number) => string;
  expandedIssues: Set<number>;
  toggleIssueExpansion: (index: number) => void;
}

const DetailedIssuesTable: React.FC<DetailedIssuesTableProps> = ({
  issues,
  getSeverityColor,
  getTypeIcon,
  getConfidenceColor,
  expandedIssues,
  toggleIssueExpansion,
}) => {
  if (issues.length === 0) {
    return (
      <Card className="bg-card/90 border-0 shadow-xl backdrop-blur-sm">
        <CardContent className="py-12 text-center">
          <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full p-4">
            <AlertTriangle className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-foreground mb-2 text-lg font-medium">
            No Issues Found
          </h3>
          <p className="text-muted-foreground">
            No issues of this type were detected in your code analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/90 border-0 shadow-xl backdrop-blur-sm">
      {/* Mobile Card Layout */}
      <div className="block lg:hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-responsive-lg">
            Issues Found ({issues.length})
          </CardTitle>
          <CardDescription className="text-responsive-sm">
            Tap any issue to view details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0 sm:space-y-4 sm:p-6">
          {issues.map((issue, index) => (
            <div
              key={index}
              className="border-border overflow-hidden rounded-lg border sm:rounded-xl"
            >
              <button
                type="button"
                onClick={() => toggleIssueExpansion(index)}
                className="touch-target hover:bg-muted/50 w-full p-3 text-left transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset sm:p-4"
                aria-expanded={expandedIssues.has(index)}
                aria-controls={`issue-details-${index}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <div className="flex-shrink-0">
                        {getTypeIcon(issue.type)}
                      </div>
                      <Badge
                        className={`text-xs ${getSeverityColor(issue.severity)}`}
                      >
                        {issue.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {issue.tool}
                      </Badge>
                    </div>
                    <h4 className="text-foreground mb-1 text-sm leading-tight font-medium sm:text-base">
                      {issue.message}
                    </h4>
                    <p className="truncate text-xs text-slate-600 sm:text-sm dark:text-slate-400">
                      {issue.filename}:{issue.line}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    {expandedIssues.has(index) ? (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </button>

              {expandedIssues.has(index) && (
                <div
                  id={`issue-details-${index}`}
                  className="border-border bg-muted/40 border-t p-3 sm:p-4"
                >
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h5 className="text-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Recommendation
                      </h5>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {issue.recommendation}
                      </p>
                    </div>

                    {issue.aiSummary && (
                      <div>
                        <h5 className="text-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                          <Brain className="h-4 w-4 text-purple-500" />
                          AI Analysis
                        </h5>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                          {issue.aiSummary}
                        </p>
                      </div>
                    )}

                    {issue.codeSnippet && (
                      <div>
                        <h5 className="text-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                          <Code className="h-4 w-4 text-blue-500" />
                          Code Context
                        </h5>
                        <pre className="overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-900">
                          <code>{issue.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    <div className="border-border text-muted-foreground flex flex-col gap-2 border-t pt-2 text-xs sm:flex-row sm:items-center sm:justify-between">
                      <span>Tool: {issue.tool}</span>
                      {issue.confidence && (
                        <span className={getConfidenceColor(issue.confidence)}>
                          {issue.confidence}% confidence
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden overflow-x-auto lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900/50">
              <TableHead
                className="w-12"
                aria-label="Expand details"
              ></TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Type & Severity</TableHead>
              <TableHead className="font-semibold">Issue Description</TableHead>
              <TableHead className="font-semibold">AI Analysis</TableHead>
              <TableHead className="font-semibold">Tool & Confidence</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue, index) => (
              <React.Fragment key={index}>
                <TableRow className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <TableCell>
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleIssueExpansion(index)}
                          className="h-6 w-6 p-0"
                        >
                          {expandedIssues.has(index) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </Collapsible>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div
                        className="max-w-xs truncate font-mono text-sm text-blue-600 dark:text-blue-400"
                        title={issue.filename}
                      >
                        {issue.filename}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <MapPin className="h-3 w-3" />
                        <span>Line {issue.line}</span>
                        {issue.startColumn && (
                          <span>
                            Col {issue.startColumn}
                            {issue.endColumn && `-${issue.endColumn}`}
                          </span>
                        )}
                      </div>
                      {issue.affectedFunction && (
                        <div className="text-xs text-purple-600 dark:text-purple-400">
                          Function: {issue.affectedFunction}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(issue.type)}
                        <span className="font-medium capitalize">
                          {issue.type}
                        </span>
                      </div>
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                      {issue.category && (
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Category: {issue.category}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="max-w-md">
                    <div className="space-y-2">
                      <p
                        className="truncate text-sm font-medium"
                        title={issue.message}
                      >
                        {issue.message}
                      </p>
                      <p
                        className="truncate text-xs text-slate-600 dark:text-slate-400"
                        title={issue.recommendation}
                      >
                        Recommendation: {issue.recommendation}
                      </p>
                      {issue.cveId && (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-xs text-red-700 dark:bg-red-950/20 dark:text-red-300"
                        >
                          {issue.cveId}
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="max-w-sm">
                    {issue.aiSummary ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                          <Brain className="h-3 w-3" />
                          <span>AI Analysis</span>
                        </div>
                        <p
                          className="line-clamp-2 text-sm text-slate-700 dark:text-slate-300"
                          title={issue.aiSummary}
                        >
                          {issue.aiSummary}
                        </p>
                        {issue.impact && (
                          <div className="text-xs text-orange-600 dark:text-orange-400">
                            Impact: {issue.impact}
                          </div>
                        )}
                        {issue.effort && (
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            Effort: {issue.effort}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic dark:text-slate-400">
                        AI analysis not available
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">
                        {issue.tool}
                      </Badge>
                      {issue.confidence && (
                        <div
                          className={`text-xs font-medium ${getConfidenceColor(issue.confidence)}`}
                        >
                          {issue.confidence}% confidence
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" title="View in code">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {expandedIssues.has(index) && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="bg-slate-50 dark:bg-slate-900/30"
                    >
                      <Collapsible open={expandedIssues.has(index)}>
                        <CollapsibleContent>
                          <div className="space-y-4 p-4">
                            {/* Code Snippet */}
                            {issue.codeSnippet && (
                              <div>
                                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                  <Code className="h-4 w-4" />
                                  Code Context
                                </h4>
                                <pre className="overflow-x-auto rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800">
                                  <code>{issue.codeSnippet}</code>
                                </pre>
                              </div>
                            )}

                            {/* Detailed AI Analysis */}
                            {issue.aiSummary && (
                              <div>
                                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                  <Brain className="h-4 w-4 text-purple-600" />
                                  Detailed AI Analysis
                                </h4>
                                <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950/20">
                                  <p className="text-sm text-slate-700 dark:text-slate-300">
                                    {issue.aiSummary}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Detailed Recommendation */}
                            <div>
                              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                Recommended Actions
                              </h4>
                              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  {issue.recommendation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
