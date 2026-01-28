import { Shield, FileCode, Sparkles, BarChart3, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisResults } from "@/hooks/useAnalysis";
import { SecurityOverview } from "./SecurityOverview";
import { AISecurityInsights } from "../ai/AISecurityInsights";
import { SecurityMetricsDashboard } from "@/components/SecurityMetricsDashboard";
import { LanguageDetectionDisplay } from "../language/LanguageDetectionDisplay";
import { UnifiedMetricsHeader } from "./UnifiedMetricsHeader";
import { DependencyAnalysisDisplay } from "./DependencyAnalysisDisplay";

interface ResultsTabsProps {
  results: AnalysisResults;
}

export const ResultsTabs: React.FC<ResultsTabsProps> = ({ results }) => {
  const hasLanguageDetection = !!results.languageDetection;

  // Calculate grid columns based on available features (Dependencies tab is always shown)
  const _getGridCols = () => {
    if (hasLanguageDetection) return "sm:grid-cols-5";
    return "sm:grid-cols-4";
  };

  return (
    <div className="w-full space-y-6">
      {/* Unified Metrics Header - Shows across all tabs */}
      <UnifiedMetricsHeader results={results} />

      <Tabs defaultValue="overview" className="w-full">
        <div className="sticky top-0 z-30 mb-6 py-3 md:mb-8">
          <div className="flex justify-center px-2 sm:px-4">
            <div className="relative w-full sm:w-auto">
              <TabsList className="grid grid-cols-5 gap-1 rounded-3xl border border-slate-700/60 bg-slate-900/90 px-1.5 py-1 shadow-inner shadow-black/10 backdrop-blur-2xl sm:flex sm:flex-nowrap sm:gap-1.5 sm:rounded-full sm:px-2 sm:py-1.5 sm:shadow-lg dark:border-slate-800/70 dark:bg-slate-950/80">
                <TabsTrigger
                  value="overview"
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[11px] font-medium text-slate-300 transition-all duration-200 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>

                {hasLanguageDetection && (
                  <TabsTrigger
                    value="language-detection"
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[11px] font-medium text-slate-300 transition-all duration-200 hover:text-white focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                  >
                    <FileCode className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Languages</span>
                  </TabsTrigger>
                )}

                <TabsTrigger
                  value="dependency-analysis"
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[11px] font-medium text-slate-300 transition-all duration-200 hover:text-white focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/30 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <Package className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Dependencies</span>
                </TabsTrigger>

                <TabsTrigger
                  value="ai-insights"
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[11px] font-medium text-slate-300 transition-all duration-200 hover:text-white focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <Sparkles className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">AI Insights</span>
                </TabsTrigger>

                <TabsTrigger
                  value="metrics"
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[11px] font-medium text-slate-300 transition-all duration-200 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/30 sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <BarChart3 className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Metrics</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <SecurityOverview results={results} />
        </TabsContent>

        {hasLanguageDetection && results.languageDetection && (
          <TabsContent value="language-detection" className="mt-0 space-y-6">
            <LanguageDetectionDisplay
              detectionResult={results.languageDetection}
            />
          </TabsContent>
        )}

        <TabsContent value="dependency-analysis" className="mt-0 space-y-6">
          <DependencyAnalysisDisplay
            dependencyAnalysis={results.dependencyAnalysis}
            onRetry={() => {
              try {
                if (typeof window !== "undefined") window.location.reload();
              } catch {
                /* noop */
              }
            }}
            isLoading={false}
          />
        </TabsContent>

        <TabsContent value="ai-insights" className="mt-0 space-y-6">
          <AISecurityInsights results={results} />
        </TabsContent>

        <TabsContent value="metrics" className="mt-0 space-y-6">
          <SecurityMetricsDashboard results={results} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
