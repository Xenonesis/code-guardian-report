"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  FileCode,
  Sparkles,
  BarChart3,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisResults } from "@/hooks/useAnalysis";
import { SecurityOverview } from "./SecurityOverview";
import { AISecurityInsights } from "../ai/AISecurityInsights";
import { SecurityMetricsDashboard } from "@/components/SecurityMetricsDashboard";
import { LanguageDetectionDisplay } from "../language/LanguageDetectionDisplay";
import { UnifiedMetricsHeader } from "./UnifiedMetricsHeader";
import { DependencyAnalysisDisplay } from "./DependencyAnalysisDisplay";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface ResultsTabsProps {
  results: AnalysisResults;
}

/* Badge showing count on a tab trigger */
const TabBadge: React.FC<{ count: number; color?: string }> = ({
  count,
  color = "bg-muted text-muted-foreground",
}) => {
  if (count <= 0) return null;
  return (
    <span
      className={`ml-1.5 hidden rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold tabular-nums sm:inline-flex ${color}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};

export const ResultsTabs: React.FC<ResultsTabsProps> = ({ results }) => {
  const hasLanguageDetection =
    !!results.languageDetection &&
    Array.isArray(results.languageDetection.allLanguages) &&
    results.languageDetection.allLanguages.length > 0;

  // Compute tab badge counts
  const badgeCounts = useMemo(() => {
    const critHigh =
      results.summary.criticalIssues + results.summary.highIssues;
    const depVulns =
      results.dependencyAnalysis?.summary?.vulnerablePackages ?? 0;
    const langCount = results.languageDetection?.allLanguages?.length ?? 0;
    return { overview: critHigh, deps: depVulns, langs: langCount };
  }, [results]);

  const tabErrorFallback = (
    <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center gap-3 rounded-lg border p-8 text-center">
      <AlertTriangle className="text-destructive h-8 w-8" />
      <div>
        <h3 className="text-foreground text-lg font-semibold">
          Something went wrong
        </h3>
        <p className="text-muted-foreground text-sm">
          This section encountered an error. Other tabs should still work.
        </p>
      </div>
    </div>
  );

  const tabContentVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  return (
    <div className="w-full space-y-6">
      {/* Unified Metrics Header - Shows across all tabs */}
      <UnifiedMetricsHeader results={results} />

      <Tabs defaultValue="overview" className="w-full">
        <div className="sticky top-0 z-30 mb-6 py-3 md:mb-8">
          <div className="flex justify-center px-2 sm:px-4">
            <div className="relative w-full sm:w-auto">
              <TabsList className="border-border/60 bg-card/90 grid grid-cols-5 gap-1 rounded-3xl border px-1.5 py-1 shadow-inner shadow-black/10 backdrop-blur-2xl sm:flex sm:flex-nowrap sm:gap-1.5 sm:rounded-full sm:px-2 sm:py-1.5 sm:shadow-lg">
                <TabsTrigger
                  value="overview"
                  className="text-muted-foreground focus-visible:ring-ring data-[state=active]:bg-muted data-[state=active]:shadow-primary/20 hover:text-foreground data-[state=active]:text-foreground flex flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[11px] font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none data-[state=active]:shadow-lg sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Overview</span>
                  <TabBadge
                    count={badgeCounts.overview}
                    color="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                  />
                </TabsTrigger>

                {hasLanguageDetection && (
                  <TabsTrigger
                    value="language-detection"
                    className="text-muted-foreground hover:text-foreground flex flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[11px] font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                  >
                    <FileCode className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Languages</span>
                    <TabBadge
                      count={badgeCounts.langs}
                      color="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                    />
                  </TabsTrigger>
                )}

                <TabsTrigger
                  value="dependency-analysis"
                  className="text-muted-foreground hover:text-foreground flex flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[11px] font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/30 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <Package className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Dependencies</span>
                  <TabBadge
                    count={badgeCounts.deps}
                    color="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  />
                </TabsTrigger>

                <TabsTrigger
                  value="ai-insights"
                  className="text-muted-foreground hover:text-foreground flex flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[11px] font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <Sparkles className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">AI Insights</span>
                </TabsTrigger>

                <TabsTrigger
                  value="metrics"
                  className="text-muted-foreground hover:text-foreground flex flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[11px] font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/30 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <BarChart3 className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Metrics</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent
            key="tab-overview"
            value="overview"
            className="mt-0 space-y-6"
            forceMount={undefined}
          >
            <motion.div
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              key="overview"
            >
              <ErrorBoundary fallback={tabErrorFallback}>
                <SecurityOverview results={results} />
              </ErrorBoundary>
            </motion.div>
          </TabsContent>

          {hasLanguageDetection && results.languageDetection && (
            <TabsContent
              key="tab-language-detection"
              value="language-detection"
              className="mt-0 space-y-6"
              forceMount={undefined}
            >
              <motion.div
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                key="languages"
              >
                <ErrorBoundary fallback={tabErrorFallback}>
                  <LanguageDetectionDisplay
                    detectionResult={results.languageDetection}
                  />
                </ErrorBoundary>
              </motion.div>
            </TabsContent>
          )}

          <TabsContent
            key="tab-dependency-analysis"
            value="dependency-analysis"
            className="mt-0 space-y-6"
            forceMount={undefined}
          >
            <motion.div
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              key="deps"
            >
              <ErrorBoundary fallback={tabErrorFallback}>
                <DependencyAnalysisDisplay
                  dependencyAnalysis={results.dependencyAnalysis}
                  isLoading={false}
                />
              </ErrorBoundary>
            </motion.div>
          </TabsContent>

          <TabsContent
            key="tab-ai-insights"
            value="ai-insights"
            className="mt-0 space-y-6"
            forceMount={undefined}
          >
            <motion.div
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              key="ai"
            >
              <ErrorBoundary fallback={tabErrorFallback}>
                <AISecurityInsights results={results} />
              </ErrorBoundary>
            </motion.div>
          </TabsContent>

          <TabsContent
            key="tab-metrics"
            value="metrics"
            className="mt-0 space-y-6"
            forceMount={undefined}
          >
            <motion.div
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              key="metrics"
            >
              <ErrorBoundary fallback={tabErrorFallback}>
                <SecurityMetricsDashboard results={results} />
              </ErrorBoundary>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};
