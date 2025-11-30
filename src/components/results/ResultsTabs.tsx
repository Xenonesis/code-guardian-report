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
        <div className="sticky top-0 z-30 -mx-4 px-4 sm:mx-0 sm:px-0 bg-gradient-to-b from-white via-white/95 to-white/90 dark:from-slate-950 dark:via-slate-950/95 dark:to-slate-950/90 backdrop-blur-xl pb-4 mb-6 md:pb-6 md:mb-8 border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
          <div className="flex justify-start md:justify-center overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] py-1">
            <TabsList className="flex w-full md:w-auto gap-1.5 bg-slate-100/80 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-xl p-1.5 snap-x snap-mandatory">
              <TabsTrigger
                value="overview"
                className="flex-1 md:flex-none min-w-[110px] md:min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all duration-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none snap-center"
              >
                <Shield className="h-4 w-4" />
                <span className="whitespace-nowrap">Overview</span>
              </TabsTrigger>
              
              {hasLanguageDetection && (
                <TabsTrigger
                  value="language-detection"
                  className="flex-1 md:flex-none min-w-[110px] md:min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-sm transition-all duration-200 rounded-lg focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none snap-center"
                >
                  <FileCode className="h-4 w-4" />
                  <span className="whitespace-nowrap">Languages</span>
                </TabsTrigger>
              )}

              <TabsTrigger
                value="dependency-analysis"
                className="flex-1 md:flex-none min-w-[110px] md:min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 data-[state=active]:shadow-sm transition-all duration-200 rounded-lg focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none snap-center"
              >
                <Package className="h-4 w-4" />
                <span className="whitespace-nowrap">Dependencies</span>
              </TabsTrigger>

              <TabsTrigger
                value="ai-insights"
                className="flex-1 md:flex-none min-w-[110px] md:min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:shadow-sm transition-all duration-200 rounded-lg focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none snap-center"
              >
                <Sparkles className="h-4 w-4" />
                <span className="whitespace-nowrap">AI Insights</span>
              </TabsTrigger>

              <TabsTrigger
                value="metrics"
                className="flex-1 md:flex-none min-w-[110px] md:min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all duration-200 rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none snap-center"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="whitespace-nowrap">Metrics</span>
              </TabsTrigger>
            </TabsList>
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