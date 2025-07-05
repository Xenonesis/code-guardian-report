import React, { Suspense } from 'react';
import { FileCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { UploadForm } from '@/components/UploadForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { EnhancedSecurityResults } from '@/components/EnhancedSecurityResults';
import PromptGenerator from '@/components/PromptGenerator';

// Lazy load heavy components
const ResultsTable = React.lazy(() => import('@/components/ResultsTable').then(module => ({ default: module.ResultsTable })));
const AIKeyManager = React.lazy(() => import('@/components/AIKeyManager').then(module => ({ default: module.AIKeyManager })));

interface TabContentProps {
  analysisResults: AnalysisResults | null;
  onFileSelect: (file: File) => void;
  onAnalysisComplete: (results: AnalysisResults) => void;
}

export const TabContent: React.FC<TabContentProps> = ({
  analysisResults,
  onFileSelect,
  onAnalysisComplete
}) => {
  return (
    <>
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
        value="prompts"
        className="animate-fade-in"
        role="tabpanel"
        id="prompts-panel"
        aria-labelledby="prompts-tab"
      >
        <PromptGenerator analysisResults={analysisResults} />
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
    </>
  );
};