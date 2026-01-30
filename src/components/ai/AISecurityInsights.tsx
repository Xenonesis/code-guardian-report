import React, { useState, useEffect, useCallback } from "react";
import {
  Brain,
  Shield,
  AlertTriangle,
  TrendingUp,
  Target,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  Lightbulb,
  BookOpen,
  Zap,
  Activity,
  BarChart3,
  FileText,
  Lock,
  Radar,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AIService } from "../../services/ai/aiService";
import { AnalysisResults } from "@/hooks/useAnalysis";
import { formatAIError, getAIFeatureStatus } from "@/utils/aiUtils";
import { toast } from "sonner";

interface AISecurityInsightsProps {
  results: AnalysisResults;
  className?: string;
  isLoading?: boolean;
}

interface InsightState {
  content: string;
  isLoading: boolean;
  error: string | null;
  lastGenerated: Date | null;
}

export const AISecurityInsights: React.FC<AISecurityInsightsProps> = ({
  results,
  className = "",
}) => {
  const [aiFeatureStatus, setAiFeatureStatus] = useState(() =>
    getAIFeatureStatus()
  );
  const [aiService] = useState(() => new AIService());

  // Separate state for each type of insight
  const [securityInsights, setSecurityInsights] = useState<InsightState>({
    content: "",
    isLoading: false,
    error: null,
    lastGenerated: null,
  });

  const [remediationStrategy, setRemediationStrategy] = useState<InsightState>({
    content: "",
    isLoading: false,
    error: null,
    lastGenerated: null,
  });

  const [owaspExplanations, setOwaspExplanations] = useState<
    Record<string, InsightState>
  >({});
  const [threatModeling, setThreatModeling] = useState<InsightState>({
    content: "",
    isLoading: false,
    error: null,
    lastGenerated: null,
  });
  const [complianceAnalysis, setComplianceAnalysis] = useState<InsightState>({
    content: "",
    isLoading: false,
    error: null,
    lastGenerated: null,
  });
  const [riskAssessment, setRiskAssessment] = useState<InsightState>({
    content: "",
    isLoading: false,
    error: null,
    lastGenerated: null,
  });
  const [performanceImpact, setPerformanceImpact] = useState<InsightState>({
    content: "",
    isLoading: false,
    error: null,
    lastGenerated: null,
  });
  const [codeQualityInsights, setCodeQualityInsights] = useState<InsightState>({
    content: "",
    isLoading: false,
    error: null,
    lastGenerated: null,
  });
  const [trendsAnalysis, setTrendsAnalysis] = useState<InsightState>({
    content: "",
    isLoading: false,
    error: null,
    lastGenerated: null,
  });

  // Check for API keys on component mount and listen for changes
  useEffect(() => {
    const updateFeatureStatus = () => {
      const newStatus = getAIFeatureStatus();
      setAiFeatureStatus(newStatus);
    };

    updateFeatureStatus();

    // Listen for storage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "aiApiKeys") {
        updateFeatureStatus();
      }
    };

    // Also listen for custom events (for same-tab changes)
    const handleCustomStorageChange = () => {
      updateFeatureStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("aiApiKeysChanged", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("aiApiKeysChanged", handleCustomStorageChange);
    };
  }, []);

  // Define generateSecurityInsights first
  const generateSecurityInsights = useCallback(async () => {
    setSecurityInsights((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const insights = await aiService.generateSecurityInsights(results);

      setSecurityInsights({
        content: insights,
        isLoading: false,
        error: null,
        lastGenerated: new Date(),
      });
      toast.success("Security insights generated successfully!");
    } catch (error) {
      const errorMessage = formatAIError(error);
      setSecurityInsights((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(`Failed to generate insights: ${errorMessage}`);
    }
  }, [results, aiService]);

  const generateThreatModeling = async () => {
    setThreatModeling((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const threats = await aiService.generateThreatModeling(results);
      setThreatModeling({
        content: threats,
        isLoading: false,
        error: null,
        lastGenerated: new Date(),
      });
      toast.success("Threat modeling analysis generated!");
    } catch (error) {
      const errorMessage = formatAIError(error);
      setThreatModeling((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(`Failed to generate threat modeling: ${errorMessage}`);
    }
  };

  const generateComplianceAnalysis = async () => {
    setComplianceAnalysis((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const compliance = await aiService.generateComplianceAnalysis(results);
      setComplianceAnalysis({
        content: compliance,
        isLoading: false,
        error: null,
        lastGenerated: new Date(),
      });
      toast.success("Compliance analysis generated!");
    } catch (error) {
      const errorMessage = formatAIError(error);
      setComplianceAnalysis((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(`Failed to generate compliance analysis: ${errorMessage}`);
    }
  };

  const generateRiskAssessment = async () => {
    setRiskAssessment((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const risk = await aiService.generateRiskAssessment(results);
      setRiskAssessment({
        content: risk,
        isLoading: false,
        error: null,
        lastGenerated: new Date(),
      });
      toast.success("Risk assessment generated!");
    } catch (error) {
      const errorMessage = formatAIError(error);
      setRiskAssessment((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(`Failed to generate risk assessment: ${errorMessage}`);
    }
  };

  const generatePerformanceImpact = async () => {
    setPerformanceImpact((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const performance = await aiService.generatePerformanceImpact(results);
      setPerformanceImpact({
        content: performance,
        isLoading: false,
        error: null,
        lastGenerated: new Date(),
      });
      toast.success("Performance impact analysis generated!");
    } catch (error) {
      const errorMessage = formatAIError(error);
      setPerformanceImpact((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(`Failed to generate performance analysis: ${errorMessage}`);
    }
  };

  const generateCodeQualityInsights = async () => {
    setCodeQualityInsights((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const quality = await aiService.generateCodeQualityInsights(results);
      setCodeQualityInsights({
        content: quality,
        isLoading: false,
        error: null,
        lastGenerated: new Date(),
      });
      toast.success("Code quality insights generated!");
    } catch (error) {
      const errorMessage = formatAIError(error);
      setCodeQualityInsights((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(`Failed to generate code quality insights: ${errorMessage}`);
    }
  };

  const generateTrendsAnalysis = async () => {
    setTrendsAnalysis((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const trends = await aiService.generateTrendsAnalysis(results);
      setTrendsAnalysis({
        content: trends,
        isLoading: false,
        error: null,
        lastGenerated: new Date(),
      });
      toast.success("Trends analysis generated!");
    } catch (error) {
      const errorMessage = formatAIError(error);
      setTrendsAnalysis((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(`Failed to generate trends analysis: ${errorMessage}`);
    }
  };

  // Auto-generate insights when API keys are available
  useEffect(() => {
    if (
      aiFeatureStatus.hasApiKeys &&
      results.issues.length > 0 &&
      !securityInsights.content &&
      !securityInsights.isLoading
    ) {
      // Add a small delay to ensure the UI is ready
      const timer = setTimeout(() => {
        generateSecurityInsights();
      }, 1000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [
    aiFeatureStatus.hasApiKeys,
    results.issues.length,
    securityInsights.content,
    securityInsights.isLoading,
    generateSecurityInsights,
  ]);

  const generateRemediationStrategy = async () => {
    setRemediationStrategy((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const strategy = await aiService.generateRemediationStrategy(results);
      setRemediationStrategy({
        content: strategy,
        isLoading: false,
        error: null,
        lastGenerated: new Date(),
      });
      toast.success("Remediation strategy generated successfully!");
    } catch (error) {
      const errorMessage = formatAIError(error);
      setRemediationStrategy((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(`Failed to generate strategy: ${errorMessage}`);
    }
  };

  const generateOwaspExplanation = async (owaspCategory: string) => {
    const relatedIssues = results.issues.filter(
      (issue) => issue.owaspCategory === owaspCategory
    );

    setOwaspExplanations((prev) => ({
      ...prev,
      [owaspCategory]: { ...prev[owaspCategory], isLoading: true, error: null },
    }));

    try {
      const explanation = await aiService.generateOwaspExplanation(
        owaspCategory,
        relatedIssues
      );
      setOwaspExplanations((prev) => ({
        ...prev,
        [owaspCategory]: {
          content: explanation,
          isLoading: false,
          error: null,
          lastGenerated: new Date(),
        },
      }));
      toast.success(
        `OWASP explanation generated for ${owaspCategory.split(" – ")[0]}`
      );
    } catch (error) {
      const errorMessage = formatAIError(error);
      setOwaspExplanations((prev) => ({
        ...prev,
        [owaspCategory]: {
          ...prev[owaspCategory],
          isLoading: false,
          error: errorMessage,
        },
      }));
      toast.error(`Failed to generate OWASP explanation: ${errorMessage}`);
    }
  };

  const getUniqueOwaspCategories = (): string[] => {
    return [
      ...new Set(
        results.issues
          .map((issue) => issue.owaspCategory)
          .filter((cat): cat is string => Boolean(cat))
      ),
    ];
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInsightsSummary = () => {
    const totalInsights = [
      securityInsights,
      remediationStrategy,
      threatModeling,
      complianceAnalysis,
      riskAssessment,
      performanceImpact,
      codeQualityInsights,
      trendsAnalysis,
    ];

    const generated = totalInsights.filter((insight) => insight.content).length;
    const loading = totalInsights.filter((insight) => insight.isLoading).length;

    return { total: totalInsights.length, generated, loading };
  };

  if (!aiFeatureStatus.isSupported) {
    return (
      <Card className={className}>
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-3">
              <Brain className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <span className="text-foreground font-bold">
                AI Security Insights
              </span>
            </CardTitle>
            <Badge
              variant="outline"
              className="w-fit border-gray-400 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-600 dark:border-gray-600 dark:bg-gray-950/30 dark:text-gray-400"
            >
              Not Supported
            </Badge>
          </div>
          <CardDescription className="leading-relaxed text-slate-600 dark:text-slate-400">
            AI features are not supported in this environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950/20">
            <XCircle className="h-4 w-4 text-gray-600" />
            <AlertDescription className="leading-relaxed text-slate-700 dark:text-slate-300">
              AI security insights require a modern browser with localStorage
              and fetch API support.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!aiFeatureStatus.hasApiKeys) {
    return (
      <Card className={className}>
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-3">
              <Brain className="h-5 w-5 flex-shrink-0 text-purple-600" />
              <span className="text-foreground font-bold">
                AI Security Insights
              </span>
            </CardTitle>
            <Badge
              variant="outline"
              className="w-fit border-orange-400 bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700 dark:border-orange-600 dark:bg-orange-950/30 dark:text-orange-300"
            >
              API Keys Required
            </Badge>
          </div>
          <CardDescription className="leading-relaxed text-slate-600 dark:text-slate-400">
            {aiFeatureStatus.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
            <Info className="h-4 w-4 text-orange-600" />
            <AlertDescription className="leading-relaxed text-slate-700 dark:text-slate-300">
              Please configure your AI API keys in the AI Configuration tab to
              enable intelligent security analysis, OWASP explanations, and
              personalized remediation strategies.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <CardTitle className="flex items-center gap-3">
                  <Brain className="h-5 w-5 flex-shrink-0 text-purple-600" />
                  <span className="text-foreground font-bold">
                    AI Security Insights
                  </span>
                </CardTitle>
                <Badge className="w-fit bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {aiFeatureStatus.primaryProvider
                    ? `${aiFeatureStatus.primaryProvider.toUpperCase()} Connected`
                    : "API Connected"}
                </Badge>
              </div>
              <CardDescription className="leading-relaxed text-slate-600 dark:text-slate-400">
                {aiFeatureStatus.message}
              </CardDescription>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 text-center sm:text-right dark:border-purple-800 dark:from-purple-950/30 dark:to-indigo-950/30">
                <div className="mb-1 text-sm font-semibold text-purple-700 dark:text-purple-300">
                  Insights Generated
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {(() => {
                    const summary = getInsightsSummary();
                    return `${summary.generated}/${summary.total}`;
                  })()}
                </div>
              </div>
              {(() => {
                const summary = getInsightsSummary();
                return (
                  summary.loading > 0 && (
                    <div className="flex items-center justify-center gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {summary.loading} generating...
                      </span>
                    </div>
                  )
                );
              })()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl border bg-white/90 p-2 shadow-xl backdrop-blur-xl sm:grid-cols-3 lg:grid-cols-6 dark:bg-slate-800/90">
              <TabsTrigger
                value="overview"
                className="flex flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-semibold transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg sm:flex-row sm:text-sm"
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span className="text-center leading-tight whitespace-nowrap">
                  Overview
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="remediation"
                className="flex flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-semibold transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg sm:flex-row sm:text-sm"
              >
                <Target className="h-4 w-4 flex-shrink-0" />
                <span className="text-center leading-tight whitespace-nowrap">
                  Remediation
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="owasp"
                className="flex flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-semibold transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg sm:flex-row sm:text-sm"
              >
                <BookOpen className="h-4 w-4 flex-shrink-0" />
                <span className="text-center leading-tight whitespace-nowrap">
                  OWASP
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="threats"
                className="flex flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-semibold transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg sm:flex-row sm:text-sm"
              >
                <Radar className="h-4 w-4 flex-shrink-0" />
                <span className="text-center leading-tight whitespace-nowrap">
                  Threats
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="compliance"
                className="flex flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-semibold transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg sm:flex-row sm:text-sm"
              >
                <Lock className="h-4 w-4 flex-shrink-0" />
                <span className="text-center leading-tight whitespace-nowrap">
                  Compliance
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="flex flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-semibold transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg sm:flex-row sm:text-sm"
              >
                <Sparkles className="h-4 w-4 flex-shrink-0" />
                <span className="text-center leading-tight whitespace-nowrap">
                  Advanced
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Security Posture Analysis
                </h3>
                <Button
                  onClick={generateSecurityInsights}
                  disabled={securityInsights.isLoading}
                  variant="outline"
                  size="sm"
                >
                  {securityInsights.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {securityInsights.isLoading ? "Generating..." : "Regenerate"}
                </Button>
              </div>

              {securityInsights.isLoading && (
                <div className="flex items-center justify-center p-8">
                  <div className="space-y-4 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-600" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Analyzing security posture...
                      </p>
                      <Progress value={undefined} className="w-64" />
                      <p className="text-xs text-slate-500">
                        AI is analyzing {results.issues.length} issues across{" "}
                        {results.totalFiles} files
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {securityInsights.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to generate security insights:{" "}
                    {securityInsights.error}
                  </AlertDescription>
                </Alert>
              )}

              {securityInsights.content && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/20">
                    <div className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                      {securityInsights.content}
                    </div>
                  </div>
                  {securityInsights.lastGenerated && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle className="h-3 w-3" />
                      Generated on{" "}
                      {formatTimestamp(securityInsights.lastGenerated)}
                    </div>
                  )}
                </div>
              )}

              {!securityInsights.content &&
                !securityInsights.isLoading &&
                !securityInsights.error && (
                  <div className="py-8 text-center">
                    <Button
                      onClick={generateSecurityInsights}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Brain className="mr-2 h-4 w-4" />
                      Generate Security Insights
                    </Button>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      Get AI-powered analysis of your security posture and risk
                      assessment
                    </p>
                  </div>
                )}
            </TabsContent>

            <TabsContent value="remediation" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Prioritized Remediation Strategy
                </h3>
                <Button
                  onClick={generateRemediationStrategy}
                  disabled={remediationStrategy.isLoading}
                  variant="outline"
                  size="sm"
                >
                  {remediationStrategy.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  {remediationStrategy.isLoading
                    ? "Generating..."
                    : "Generate Plan"}
                </Button>
              </div>

              {remediationStrategy.isLoading && (
                <div className="flex items-center justify-center p-8">
                  <div className="space-y-4 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Creating remediation strategy...
                      </p>
                      <Progress value={undefined} className="w-64" />
                      <p className="text-xs text-slate-500">
                        Prioritizing{" "}
                        {results.summary.criticalIssues +
                          results.summary.highIssues}{" "}
                        critical/high issues
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {remediationStrategy.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to generate remediation strategy:{" "}
                    {remediationStrategy.error}
                  </AlertDescription>
                </Alert>
              )}

              {remediationStrategy.content && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                    <div className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                      {remediationStrategy.content}
                    </div>
                  </div>
                  {remediationStrategy.lastGenerated && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle className="h-3 w-3" />
                      Generated on{" "}
                      {formatTimestamp(remediationStrategy.lastGenerated)}
                    </div>
                  )}
                </div>
              )}

              {!remediationStrategy.content &&
                !remediationStrategy.isLoading &&
                !remediationStrategy.error && (
                  <div className="py-8 text-center">
                    <Button
                      onClick={generateRemediationStrategy}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Generate Remediation Strategy
                    </Button>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      Get a prioritized action plan based on risk, effort, and
                      business impact
                    </p>
                  </div>
                )}
            </TabsContent>

            <TabsContent value="owasp" className="space-y-4">
              <div>
                <h3 className="mb-4 text-lg font-semibold">
                  OWASP Top 10 Analysis
                </h3>
                <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                  Get detailed explanations for each OWASP category detected in
                  your codebase
                </p>
              </div>

              {getUniqueOwaspCategories().length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No OWASP Top 10 categories detected in the current analysis
                    results.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {getUniqueOwaspCategories().map((category) => {
                    const relatedIssues = results.issues.filter(
                      (issue) => issue.owaspCategory === category
                    );
                    const categoryState = owaspExplanations[category] || {
                      content: "",
                      isLoading: false,
                      error: null,
                      lastGenerated: null,
                    };
                    const categoryId = category.split(" – ")[0];
                    const categoryName = category.split(" – ")[1] || category;

                    return (
                      <Card
                        key={category}
                        className="border-l-4 border-l-orange-500"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                {categoryId}: {categoryName}
                              </CardTitle>
                              <CardDescription>
                                {relatedIssues.length} issue
                                {relatedIssues.length !== 1 ? "s" : ""} detected
                              </CardDescription>
                            </div>
                            <Button
                              onClick={() => generateOwaspExplanation(category)}
                              disabled={categoryState.isLoading}
                              variant="outline"
                              size="sm"
                            >
                              {categoryState.isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Lightbulb className="mr-2 h-4 w-4" />
                              )}
                              {categoryState.isLoading
                                ? "Analyzing..."
                                : "Explain"}
                            </Button>
                          </div>
                        </CardHeader>

                        {(categoryState.content ||
                          categoryState.isLoading ||
                          categoryState.error) && (
                          <CardContent>
                            {categoryState.isLoading && (
                              <div className="flex items-center gap-3 p-4">
                                <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                                <div>
                                  <p className="text-sm font-medium">
                                    Analyzing {categoryName}...
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Examining {relatedIssues.length} related
                                    issue{relatedIssues.length !== 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                            )}

                            {categoryState.error && (
                              <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>
                                  Failed to generate explanation:{" "}
                                  {categoryState.error}
                                </AlertDescription>
                              </Alert>
                            )}

                            {categoryState.content && (
                              <div className="space-y-3">
                                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/20">
                                  <div className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                                    {categoryState.content}
                                  </div>
                                </div>
                                {categoryState.lastGenerated && (
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <CheckCircle className="h-3 w-3" />
                                    Generated on{" "}
                                    {formatTimestamp(
                                      categoryState.lastGenerated
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="threats" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Threat Modeling & Attack Vectors
                </h3>
                <Button
                  onClick={generateThreatModeling}
                  disabled={threatModeling.isLoading}
                  variant="outline"
                  size="sm"
                >
                  {threatModeling.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Radar className="mr-2 h-4 w-4" />
                  )}
                  {threatModeling.isLoading
                    ? "Analyzing..."
                    : "Generate Analysis"}
                </Button>
              </div>

              {threatModeling.isLoading && (
                <div className="flex items-center justify-center p-8">
                  <div className="space-y-4 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-red-600" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Modeling potential threats...
                      </p>
                      <Progress value={undefined} className="w-64" />
                      <p className="text-xs text-slate-500">
                        Analyzing attack surfaces and threat vectors
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {threatModeling.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to generate threat modeling: {threatModeling.error}
                  </AlertDescription>
                </Alert>
              )}

              {threatModeling.content && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
                    <div className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                      {threatModeling.content}
                    </div>
                  </div>
                  {threatModeling.lastGenerated && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle className="h-3 w-3" />
                      Generated on{" "}
                      {formatTimestamp(threatModeling.lastGenerated)}
                    </div>
                  )}
                </div>
              )}

              {!threatModeling.content &&
                !threatModeling.isLoading &&
                !threatModeling.error && (
                  <div className="py-8 text-center">
                    <Button
                      onClick={generateThreatModeling}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Radar className="mr-2 h-4 w-4" />
                      Generate Threat Model
                    </Button>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      Identify potential attack vectors and security threats
                      specific to your codebase
                    </p>
                  </div>
                )}
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Compliance & Standards Analysis
                </h3>
                <Button
                  onClick={generateComplianceAnalysis}
                  disabled={complianceAnalysis.isLoading}
                  variant="outline"
                  size="sm"
                >
                  {complianceAnalysis.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  {complianceAnalysis.isLoading
                    ? "Analyzing..."
                    : "Generate Analysis"}
                </Button>
              </div>

              {complianceAnalysis.isLoading && (
                <div className="flex items-center justify-center p-8">
                  <div className="space-y-4 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-600" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Analyzing compliance requirements...
                      </p>
                      <Progress value={undefined} className="w-64" />
                      <p className="text-xs text-slate-500">
                        Checking against security standards and regulations
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {complianceAnalysis.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to generate compliance analysis:{" "}
                    {complianceAnalysis.error}
                  </AlertDescription>
                </Alert>
              )}

              {complianceAnalysis.content && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
                    <div className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                      {complianceAnalysis.content}
                    </div>
                  </div>
                  {complianceAnalysis.lastGenerated && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle className="h-3 w-3" />
                      Generated on{" "}
                      {formatTimestamp(complianceAnalysis.lastGenerated)}
                    </div>
                  )}
                </div>
              )}

              {!complianceAnalysis.content &&
                !complianceAnalysis.isLoading &&
                !complianceAnalysis.error && (
                  <div className="py-8 text-center">
                    <Button
                      onClick={generateComplianceAnalysis}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Generate Compliance Analysis
                    </Button>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      Assess compliance with security standards like SOC 2, PCI
                      DSS, GDPR, and more
                    </p>
                  </div>
                )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Risk Assessment Card */}
                <Card className="border-l-4 border-l-yellow-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <BarChart3 className="h-4 w-4 text-yellow-600" />
                        Risk Assessment
                      </CardTitle>
                      <Button
                        onClick={generateRiskAssessment}
                        disabled={riskAssessment.isLoading}
                        variant="outline"
                        size="sm"
                      >
                        {riskAssessment.isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <BarChart3 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <CardDescription>
                      Quantitative risk analysis and business impact assessment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {riskAssessment.isLoading && (
                      <div className="flex items-center gap-3 p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium">
                            Calculating risk metrics...
                          </p>
                          <p className="text-xs text-slate-500">
                            Analyzing business impact
                          </p>
                        </div>
                      </div>
                    )}
                    {riskAssessment.content && (
                      <div className="rounded bg-yellow-50 p-3 text-sm dark:bg-yellow-950/20">
                        {riskAssessment.content.substring(0, 200)}...
                      </div>
                    )}
                    {!riskAssessment.content && !riskAssessment.isLoading && (
                      <Button
                        onClick={generateRiskAssessment}
                        variant="ghost"
                        size="sm"
                        className="w-full"
                      >
                        Generate Risk Assessment
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Performance Impact Card */}
                <Card className="border-l-4 border-l-indigo-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="h-4 w-4 text-indigo-600" />
                        Performance Impact
                      </CardTitle>
                      <Button
                        onClick={generatePerformanceImpact}
                        disabled={performanceImpact.isLoading}
                        variant="outline"
                        size="sm"
                      >
                        {performanceImpact.isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Activity className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <CardDescription>
                      Security fixes impact on application performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {performanceImpact.isLoading && (
                      <div className="flex items-center gap-3 p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                        <div>
                          <p className="text-sm font-medium">
                            Analyzing performance...
                          </p>
                          <p className="text-xs text-slate-500">
                            Measuring security overhead
                          </p>
                        </div>
                      </div>
                    )}
                    {performanceImpact.content && (
                      <div className="rounded bg-indigo-50 p-3 text-sm dark:bg-indigo-950/20">
                        {performanceImpact.content.substring(0, 200)}...
                      </div>
                    )}
                    {!performanceImpact.content &&
                      !performanceImpact.isLoading && (
                        <Button
                          onClick={generatePerformanceImpact}
                          variant="ghost"
                          size="sm"
                          className="w-full"
                        >
                          Analyze Performance Impact
                        </Button>
                      )}
                  </CardContent>
                </Card>

                {/* Code Quality Insights Card */}
                <Card className="border-l-4 border-l-teal-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4 text-teal-600" />
                        Code Quality Insights
                      </CardTitle>
                      <Button
                        onClick={generateCodeQualityInsights}
                        disabled={codeQualityInsights.isLoading}
                        variant="outline"
                        size="sm"
                      >
                        {codeQualityInsights.isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <FileText className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <CardDescription>
                      Deep code quality analysis and maintainability metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {codeQualityInsights.isLoading && (
                      <div className="flex items-center gap-3 p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
                        <div>
                          <p className="text-sm font-medium">
                            Analyzing code quality...
                          </p>
                          <p className="text-xs text-slate-500">
                            Evaluating maintainability
                          </p>
                        </div>
                      </div>
                    )}
                    {codeQualityInsights.content && (
                      <div className="rounded bg-teal-50 p-3 text-sm dark:bg-teal-950/20">
                        {codeQualityInsights.content.substring(0, 200)}...
                      </div>
                    )}
                    {!codeQualityInsights.content &&
                      !codeQualityInsights.isLoading && (
                        <Button
                          onClick={generateCodeQualityInsights}
                          variant="ghost"
                          size="sm"
                          className="w-full"
                        >
                          Generate Quality Insights
                        </Button>
                      )}
                  </CardContent>
                </Card>

                {/* Trends Analysis Card */}
                <Card className="border-l-4 border-l-pink-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4 text-pink-600" />
                        Security Trends
                      </CardTitle>
                      <Button
                        onClick={generateTrendsAnalysis}
                        disabled={trendsAnalysis.isLoading}
                        variant="outline"
                        size="sm"
                      >
                        {trendsAnalysis.isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <TrendingUp className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <CardDescription>
                      Industry trends and emerging security patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {trendsAnalysis.isLoading && (
                      <div className="flex items-center gap-3 p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-pink-600" />
                        <div>
                          <p className="text-sm font-medium">
                            Analyzing trends...
                          </p>
                          <p className="text-xs text-slate-500">
                            Comparing with industry data
                          </p>
                        </div>
                      </div>
                    )}
                    {trendsAnalysis.content && (
                      <div className="rounded bg-pink-50 p-3 text-sm dark:bg-pink-950/20">
                        {trendsAnalysis.content.substring(0, 200)}...
                      </div>
                    )}
                    {!trendsAnalysis.content && !trendsAnalysis.isLoading && (
                      <Button
                        onClick={generateTrendsAnalysis}
                        variant="ghost"
                        size="sm"
                        className="w-full"
                      >
                        Analyze Security Trends
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Expanded View for Advanced Insights */}
              <div className="space-y-4">
                {[
                  riskAssessment,
                  performanceImpact,
                  codeQualityInsights,
                  trendsAnalysis,
                ].map((insight, index) => {
                  const titles = [
                    "Risk Assessment",
                    "Performance Impact",
                    "Code Quality Insights",
                    "Security Trends",
                  ];
                  const colors = ["yellow", "indigo", "teal", "pink"];

                  if (!insight.content) return null;

                  return (
                    <Card
                      key={index}
                      className={`border-l-4 border-l-${colors[index]}-500`}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {titles[index]} - Detailed Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div
                          className={`bg-${colors[index]}-50 dark:bg-${colors[index]}-950/20 rounded-lg border p-4 border-${colors[index]}-200 dark:border-${colors[index]}-800`}
                        >
                          <div className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                            {insight.content}
                          </div>
                        </div>
                        {insight.lastGenerated && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                            <CheckCircle className="h-3 w-3" />
                            Generated on{" "}
                            {formatTimestamp(insight.lastGenerated)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
