import React, { Suspense } from 'react';
import { FileCode, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { UploadForm } from '@/components/UploadForm';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { EnhancedSecurityResults } from '../../analysis/EnhancedSecurityResults';
import PromptGenerator from '../../ai/PromptGenerator';

// Lazy load heavy components
const ResultsTable = React.lazy(() => import('../../analysis/ResultsTable').then(module => ({ default: module.ResultsTable })));
const AIKeyManager = React.lazy(() => import('../../ai/AIKeyManager').then(module => ({ default: module.AIKeyManager })));

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
            <LoadingSpinner size="lg" message="Loading AI Configuration..." />
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
              <LoadingSpinner size="lg" message="Loading Results..." />
            </div>
          }>
            {/* Suspicious Files Section (if available) */}
            {analysisResults.zipAnalysis && (
              <div className="space-y-6 mb-8">
                {/* Suspicious files (compact) */}
                {analysisResults.zipAnalysis.fileStructure.suspiciousFiles.length > 0 && (
                  <Card className="bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-yellow-50/50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/20 border-2 border-amber-200/60 dark:border-amber-800/40 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-900 via-orange-900 to-yellow-900 dark:from-amber-200 dark:via-orange-200 dark:to-yellow-200 bg-clip-text text-transparent">
                            Suspicious Files
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm font-medium mt-0.5">
                            Files flagged due to risky extensions or patterns
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2.5">
                        {analysisResults.zipAnalysis.fileStructure.suspiciousFiles.slice(0, 8).map((file) => (
                          <div
                            key={file}
                            className="group flex items-center gap-3 p-3.5 rounded-xl border-2 border-amber-300/50 dark:border-amber-700/30 bg-gradient-to-r from-amber-100/80 via-orange-50/70 to-yellow-50/80 dark:from-amber-900/40 dark:via-orange-900/30 dark:to-yellow-900/40 hover:border-amber-400/70 dark:hover:border-amber-600/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                          >
                            <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-200">
                              <AlertTriangle className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-sm font-mono font-medium truncate text-amber-900 dark:text-amber-100 flex-1">{file}</span>
                          </div>
                        ))}
                        {analysisResults.zipAnalysis.fileStructure.suspiciousFiles.length > 8 && (
                          <div className="mt-3 pt-3 border-t border-amber-300/30 dark:border-amber-700/20">
                            <p className="text-xs font-medium text-amber-700 dark:text-amber-300 text-center">
                              + {analysisResults.zipAnalysis.fileStructure.suspiciousFiles.length - 8} more files omitted
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Existing results rendering */}
            {analysisResults.summary ? (
              <EnhancedSecurityResults results={analysisResults} />
            ) : (
              <ResultsTable
                issues={analysisResults.issues}
                totalFiles={analysisResults.totalFiles}
                analysisTime={analysisResults.analysisTime}
                results={analysisResults}
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