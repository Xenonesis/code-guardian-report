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
        <div className="sticky top-0 z-20 bg-gradient-to-b from-white via-white/98 to-white/95 dark:from-slate-900 dark:via-slate-900/98 dark:to-slate-900/95 backdrop-blur-2xl pb-6 mb-8 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex justify-start sm:justify-center overflow-hidden">
            <TabsList className="flex w-full sm:w-auto gap-2 overflow-x-auto bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm rounded-2xl p-1.5 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              <TabsTrigger
                value="overview"
                className="flex-shrink-0 min-w-[100px] sm:min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 text-sm font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all duration-200 rounded-xl group snap-center"
              >
                <Shield className="h-4 w-4 group-data-[state=active]:text-blue-600 dark:group-data-[state=active]:text-blue-400" />
                <span className="whitespace-nowrap">Overview</span>
              </TabsTrigger>
              
              {hasLanguageDetection && (
                <TabsTrigger
                  value="language-detection"
                  className="flex-shrink-0 min-w-[100px] sm:min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 text-sm font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-sm transition-all duration-200 rounded-xl group snap-center"
                >
                  <FileCode className="h-4 w-4 group-data-[state=active]:text-purple-600 dark:group-data-[state=active]:text-purple-400" />
                  <span className="whitespace-nowrap">Languages</span>
                </TabsTrigger>
              )}

              <TabsTrigger
                value="dependency-analysis"
                className="flex-shrink-0 min-w-[100px] sm:min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 text-sm font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400 data-[state=active]:shadow-sm transition-all duration-200 rounded-xl group snap-center"
              >
                <Package className="h-4 w-4 group-data-[state=active]:text-green-600 dark:group-data-[state=active]:text-green-400" />
                <span className="whitespace-nowrap">Dependencies</span>
              </TabsTrigger>

              <TabsTrigger
                value="ai-insights"
                className="flex-shrink-0 min-w-[100px] sm:min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 text-sm font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:shadow-sm transition-all duration-200 rounded-xl group snap-center"
              >
                <Sparkles className="h-4 w-4 group-data-[state=active]:text-orange-600 dark:group-data-[state=active]:text-orange-400" />
                <span className="whitespace-nowrap">AI Insights</span>
              </TabsTrigger>

              <TabsTrigger
                value="metrics"
                className="flex-shrink-0 min-w-[100px] sm:min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-3 sm:px-4 text-sm font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all duration-200 rounded-xl group snap-center"
              >
                <BarChart3 className="h-4 w-4 group-data-[state=active]:text-emerald-600 dark:group-data-[state=active]:text-emerald-400" />
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