import React, { Suspense } from 'react';
import { FileCode, Shield, FileText, AlertTriangle, Zap } from 'lucide-react';
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
            {/* ZIP Overview (if available) */}
            {analysisResults.zipAnalysis && (
              <div className="space-y-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                            {100 - (analysisResults.zipAnalysis.securityThreats.length * 10)}
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-300">Security Score</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                            {analysisResults.zipAnalysis.fileStructure.totalFiles}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-300">Total Files</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                            {analysisResults.zipAnalysis.securityThreats.length}
                          </p>
                          <p className="text-sm text-red-600 dark:text-red-300">Security Threats</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 rounded-lg">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                            {analysisResults.dependencyAnalysis?.summary.criticalVulnerabilities || 0}
                          </p>
                          <p className="text-sm text-orange-600 dark:text-orange-300">Critical Vulns</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Suspicious files (compact) */}
                {analysisResults.zipAnalysis.fileStructure.suspiciousFiles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Suspicious Files</CardTitle>
                      <CardDescription>
                        Files flagged due to risky extensions or patterns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysisResults.zipAnalysis.fileStructure.suspiciousFiles.slice(0, 8).map((file, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 rounded border border-yellow-200 dark:border-yellow-700/40 bg-yellow-50 dark:bg-yellow-900/30"
                          >
                            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-sm truncate text-slate-800 dark:text-slate-100">{file}</span>
                          </div>
                        ))}
                        {analysisResults.zipAnalysis.fileStructure.suspiciousFiles.length > 8 && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">+ more files omitted</p>
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