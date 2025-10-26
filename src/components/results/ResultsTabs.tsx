import { Shield, FileCode, Sparkles, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { SecurityOverview } from './SecurityOverview';
import { AISecurityInsights } from '../ai/AISecurityInsights';
import { SecurityMetricsDashboard } from '@/components/SecurityMetricsDashboard';
import { LanguageDetectionDisplay } from '../language/LanguageDetectionDisplay';
import { UnifiedMetricsHeader } from './UnifiedMetricsHeader';

interface ResultsTabsProps {
  results: AnalysisResults;
}

export const ResultsTabs: React.FC<ResultsTabsProps> = ({ results }) => {
  const hasLanguageDetection = results.languageDetection;

  return (
    <div className="w-full space-y-6">
      {/* Unified Metrics Header - Shows across all tabs */}
      <UnifiedMetricsHeader results={results} />

      <Tabs defaultValue="overview" className="w-full">
        <div className="sticky top-0 z-20 bg-gradient-to-b from-white via-white/98 to-white/95 dark:from-slate-900 dark:via-slate-900/98 dark:to-slate-900/95 backdrop-blur-2xl pb-6 mb-8 border-b border-slate-200/50 dark:border-slate-700/50">
          <TabsList className={`grid w-full ${hasLanguageDetection ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'} gap-2 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 backdrop-blur-xl border-2 border-slate-200/80 dark:border-slate-700/80 shadow-xl rounded-2xl p-2`}>
            <TabsTrigger
              value="overview"
              className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:via-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-300 rounded-xl group"
            >
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 group-data-[state=active]:animate-pulse" />
              <span className="text-center leading-tight">Security Overview</span>
            </TabsTrigger>
            {hasLanguageDetection && (
              <TabsTrigger
                value="language-detection"
                className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:via-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-300 rounded-xl group"
              >
                <FileCode className="h-4 w-4 sm:h-5 sm:w-5 group-data-[state=active]:animate-pulse" />
                <span className="text-center leading-tight">Language Detection</span>
              </TabsTrigger>
            )}
            <TabsTrigger
              value="ai-insights"
              className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:via-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-300 rounded-xl group"
            >
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 group-data-[state=active]:animate-pulse" />
              <span className="text-center leading-tight">AI Insights</span>
            </TabsTrigger>
            <TabsTrigger
              value="metrics"
              className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:via-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-300 rounded-xl group"
            >
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 group-data-[state=active]:animate-pulse" />
              <span className="text-center leading-tight">Detailed Metrics</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <SecurityOverview results={results} />
        </TabsContent>

        {hasLanguageDetection && results.languageDetection && (
          <TabsContent value="language-detection" className="space-y-6 mt-0">
            <LanguageDetectionDisplay detectionResult={results.languageDetection} />
          </TabsContent>
        )}

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