import { Shield, FileCode, Sparkles, BarChart3, Package } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { SecurityOverview } from './SecurityOverview';
import { AISecurityInsights } from '../ai/AISecurityInsights';
import { SecurityMetricsDashboard } from '@/components/SecurityMetricsDashboard';
import { LanguageDetectionDisplay } from '../language/LanguageDetectionDisplay';
import { UnifiedMetricsHeader } from './UnifiedMetricsHeader';
import { DependencyAnalysisDisplay } from './DependencyAnalysisDisplay';

interface ResultsTabsProps {
  results: AnalysisResults;
}

export const ResultsTabs: React.FC<ResultsTabsProps> = ({ results }) => {
  const hasLanguageDetection = !!results.languageDetection;

  // Calculate grid columns based on available features (Dependencies tab is always shown)
  const getGridCols = () => {
    if (hasLanguageDetection) return 'sm:grid-cols-5';
    return 'sm:grid-cols-4';
  };

  return (
    <div className="w-full space-y-6">
      {/* Unified Metrics Header - Shows across all tabs */}
      <UnifiedMetricsHeader results={results} />

      <Tabs defaultValue="overview" className="w-full">
        <div className="sticky top-0 z-30 py-3 mb-6 md:mb-8">
          <div className="flex justify-center px-2 sm:px-4">
            <div className="relative w-full sm:w-auto">
              <div className="pointer-events-none absolute inset-y-1 left-1 w-8 rounded-l-3xl bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent dark:from-slate-900 dark:via-slate-900/70 dark:to-transparent sm:hidden" />
              <div className="pointer-events-none absolute inset-y-1 right-1 w-8 rounded-r-3xl bg-gradient-to-l from-slate-950 via-slate-950/70 to-transparent dark:from-slate-900 dark:via-slate-900/70 dark:to-transparent sm:hidden" />
              <TabsList className="flex w-full sm:w-auto gap-1 sm:gap-1.5 bg-slate-900/90 dark:bg-slate-950/80 backdrop-blur-2xl border border-slate-700/60 dark:border-slate-800/70 shadow-lg shadow-black/20 rounded-2xl sm:rounded-full px-2 py-1.5 sm:px-2 sm:py-1.5 overflow-x-auto sm:overflow-visible scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <TabsTrigger
                  value="overview"
                  className="flex-shrink-0 min-w-[110px] sm:min-w-0 sm:flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2.5 sm:px-4 md:px-5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 transition-all duration-200 rounded-2xl sm:rounded-full focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none whitespace-nowrap snap-center"
                >
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span>Overview</span>
                </TabsTrigger>

                {hasLanguageDetection && (
                  <TabsTrigger
                    value="language-detection"
                    className="flex-shrink-0 min-w-[110px] sm:min-w-0 sm:flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2.5 sm:px-4 md:px-5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 transition-all duration-200 rounded-2xl sm:rounded-full focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none whitespace-nowrap snap-center"
                  >
                    <FileCode className="h-4 w-4 flex-shrink-0" />
                    <span>Languages</span>
                  </TabsTrigger>
                )}

                <TabsTrigger
                  value="dependency-analysis"
                  className="flex-shrink-0 min-w-[110px] sm:min-w-0 sm:flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2.5 sm:px-4 md:px-5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/30 transition-all duration-200 rounded-2xl sm:rounded-full focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none whitespace-nowrap snap-center"
                >
                  <Package className="h-4 w-4 flex-shrink-0" />
                  <span>Dependencies</span>
                </TabsTrigger>

                <TabsTrigger
                  value="ai-insights"
                  className="flex-shrink-0 min-w-[110px] sm:min-w-0 sm:flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2.5 sm:px-4 md:px-5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 transition-all duration-200 rounded-2xl sm:rounded-full focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none whitespace-nowrap snap-center"
                >
                  <Sparkles className="h-4 w-4 flex-shrink-0" />
                  <span>AI Insights</span>
                </TabsTrigger>

                <TabsTrigger
                  value="metrics"
                  className="flex-shrink-0 min-w-[110px] sm:min-w-0 sm:flex-1 inline-flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-2.5 sm:px-4 md:px-5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/30 transition-all duration-200 rounded-2xl sm:rounded-full focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none whitespace-nowrap snap-center"
                >
                  <BarChart3 className="h-4 w-4 flex-shrink-0" />
                  <span>Metrics</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <SecurityOverview results={results} />
        </TabsContent>

        {hasLanguageDetection && results.languageDetection && (
          <TabsContent value="language-detection" className="space-y-6 mt-0">
            <LanguageDetectionDisplay detectionResult={results.languageDetection} />
          </TabsContent>
        )}

        <TabsContent value="dependency-analysis" className="space-y-6 mt-0">
          <DependencyAnalysisDisplay
            dependencyAnalysis={results.dependencyAnalysis}
            onRetry={() => { try { if (typeof window !== 'undefined') window.location.reload(); } catch { /* noop */ } }}
            isLoading={false}
          />
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6 mt-0">
          <AISecurityInsights results={results} />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6 mt-0">
          <SecurityMetricsDashboard results={results} />
        </TabsContent>
      </Tabs>
    </div>
  );
};