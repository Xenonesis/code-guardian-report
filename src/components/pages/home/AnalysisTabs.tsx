import React, { Suspense } from 'react';
import { FileCode, Bot, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadForm } from '@/components/UploadForm';
import { LoadingSpinner } from '@/components/LoadingStates';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { EnhancedSecurityResults } from '@/components/EnhancedSecurityResults';

// Lazy load heavy components
const ResultsTable = React.lazy(() => import('@/components/ResultsTable').then(module => ({ default: module.ResultsTable })));
const AIKeyManager = React.lazy(() => import('@/components/AIKeyManager').then(module => ({ default: module.AIKeyManager })));

interface AnalysisTabsProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  analysisResults: AnalysisResults | null;
  onFileSelect: (file: File) => void;
  onAnalysisComplete: (results: AnalysisResults) => void;
  isRedirecting?: boolean;
}

export const AnalysisTabs: React.FC<AnalysisTabsProps> = ({
  currentTab,
  onTabChange,
  analysisResults,
  onFileSelect,
  onAnalysisComplete,
  isRedirecting = false
}) => {
  return (
    <section className="max-w-6xl mx-auto" role="main">
      <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
        <TabsList
          className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 sm:mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-xl rounded-xl overflow-hidden relative animate-fade-in"
          role="tablist"
          aria-label="Main navigation tabs"
        >
          <TabsTrigger
            value="upload"
            className="relative flex items-center justify-center gap-2 py-3 sm:py-2 text-sm sm:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 focus-ring hover-lift z-10"
            role="tab"
            aria-controls="upload-panel"
            aria-selected={currentTab === 'upload'}
          >
            <FileCode className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Upload Code</span>
            <span className="sm:hidden">Upload</span>
          </TabsTrigger>
          <TabsTrigger
            value="ai-config"
            className="relative flex items-center justify-center gap-2 py-3 sm:py-2 text-sm sm:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 focus-ring hover-lift z-10"
            role="tab"
            aria-controls="ai-config-panel"
            aria-selected={currentTab === 'ai-config'}
          >
            <Bot className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">AI Configuration</span>
            <span className="sm:hidden">AI Config</span>
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className={`relative flex items-center justify-center gap-2 py-3 sm:py-2 text-sm sm:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 focus-ring disabled:opacity-50 disabled:cursor-not-allowed hover-lift z-10 ${
              isRedirecting ? 'animate-pulse bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30' : ''
            }`}
            disabled={!analysisResults}
            role="tab"
            aria-controls="results-panel"
            aria-selected={currentTab === 'results'}
            aria-disabled={!analysisResults}
          >
            <Shield className={`h-4 w-4 ${isRedirecting ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span className="hidden sm:inline">
              {isRedirecting ? 'Loading Results...' : 'Analysis Results'}
            </span>
            <span className="sm:hidden">
              {isRedirecting ? 'Loading...' : 'Results'}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="upload"
          className="space-y-6 sm:space-y-8 animate-fade-in"
          role="tabpanel"
          id="upload-panel"
          aria-labelledby="upload-tab"
        >
          <UploadForm
            onFileSelect={onFileSelect}
            onAnalysisComplete={onAnalysisComplete}
          />
        </TabsContent>

        <TabsContent
          value="ai-config"
          className="animate-fade-in"
          role="tabpanel"
          id="ai-config-panel"
          aria-labelledby="ai-config-tab"
        >
          <Suspense fallback={
            <div className="flex justify-center p-8" role="status" aria-label="Loading AI configuration">
              <LoadingSpinner size="lg" text="Loading AI Configuration..." />
            </div>
          }>
            <AIKeyManager />
          </Suspense>
        </TabsContent>

        <TabsContent
          value="results"
          className="animate-fade-in"
          role="tabpanel"
          id="results-panel"
          aria-labelledby="results-tab"
        >
          {analysisResults ? (
            <Suspense fallback={
              <div className="flex justify-center p-8" role="status" aria-label="Loading analysis results">
                <LoadingSpinner size="lg" text="Loading Results..." />
              </div>
            }>
              {/* Use enhanced results if we have the full AnalysisResults structure */}
              {analysisResults.summary ? (
                <EnhancedSecurityResults results={analysisResults} />
              ) : (
                <ResultsTable
                  issues={analysisResults.issues}
                  totalFiles={analysisResults.totalFiles}
                  analysisTime={analysisResults.analysisTime}
                />
              )}
            </Suspense>
          ) : (
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 sm:p-6 rounded-full w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <FileCode className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
                  No Analysis Results
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-md mx-auto">
                  Upload and analyze a zip file to see comprehensive results here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default AnalysisTabs;
