import React, { Suspense } from "react";
import { FileCode, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { UploadForm } from "@/components/UploadForm";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { AnalysisResults } from "@/hooks/useAnalysis";
import { EnhancedSecurityResults } from "../../analysis/EnhancedSecurityResults";
import PromptGenerator from "../../ai/PromptGenerator";

// Lazy load heavy components
const ResultsTable = React.lazy(() =>
  import("../../analysis/ResultsTable").then((module) => ({
    default: module.ResultsTable,
  }))
);
const AIKeyManager = React.lazy(() =>
  import("../../ai/AIKeyManager").then((module) => ({
    default: module.AIKeyManager,
  }))
);

interface TabContentProps {
  analysisResults: AnalysisResults | null;
  onFileSelect: (file: File) => void;
  onAnalysisComplete: (results: AnalysisResults) => void;
}

export const TabContent: React.FC<TabContentProps> = ({
  analysisResults,
  onFileSelect,
  onAnalysisComplete,
}) => {
  return (
    <>
      <TabsContent
        value="upload"
        className="animate-fade-in space-y-6 sm:space-y-8"
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
        <Suspense
          fallback={
            <div
              className="flex justify-center p-8"
              role="status"
              aria-label="Loading AI configuration"
            >
              <LoadingSpinner size="lg" message="Loading AI Configuration..." />
            </div>
          }
        >
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
          <Suspense
            fallback={
              <div
                className="flex justify-center p-8"
                role="status"
                aria-label="Loading analysis results"
              >
                <LoadingSpinner size="lg" message="Loading Results..." />
              </div>
            }
          >
            {/* Suspicious Files Section (if available) */}
            {analysisResults.zipAnalysis && (
              <div className="mb-8 space-y-6">
                {/* Suspicious files (compact) */}
                {analysisResults.zipAnalysis.fileStructure.suspiciousFiles
                  .length > 0 && (
                  <Card className="border-2 border-amber-200/60 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-yellow-50/50 shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-amber-800/40 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/20">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 shadow-lg">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="bg-gradient-to-r from-amber-900 via-orange-900 to-yellow-900 bg-clip-text text-lg font-bold text-transparent sm:text-xl dark:from-amber-200 dark:via-orange-200 dark:to-yellow-200">
                            Suspicious Files
                          </CardTitle>
                          <CardDescription className="mt-0.5 text-xs font-medium sm:text-sm">
                            Files flagged due to risky extensions or patterns
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2.5">
                        {analysisResults.zipAnalysis.fileStructure.suspiciousFiles
                          .slice(0, 8)
                          .map((file) => (
                            <div
                              key={file}
                              className="group flex items-center gap-3 rounded-xl border-2 border-amber-300/50 bg-gradient-to-r from-amber-100/80 via-orange-50/70 to-yellow-50/80 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/70 hover:shadow-lg dark:border-amber-700/30 dark:from-amber-900/40 dark:via-orange-900/30 dark:to-yellow-900/40 dark:hover:border-amber-600/50"
                            >
                              <div className="rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 shadow-sm transition-transform duration-200 group-hover:scale-110">
                                <AlertTriangle className="h-3.5 w-3.5 text-white" />
                              </div>
                              <span className="flex-1 truncate font-mono text-sm font-medium text-amber-900 dark:text-amber-100">
                                {file}
                              </span>
                            </div>
                          ))}
                        {analysisResults.zipAnalysis.fileStructure
                          .suspiciousFiles.length > 8 && (
                          <div className="mt-3 border-t border-amber-300/30 pt-3 dark:border-amber-700/20">
                            <p className="text-center text-xs font-medium text-amber-700 dark:text-amber-300">
                              +{" "}
                              {analysisResults.zipAnalysis.fileStructure
                                .suspiciousFiles.length - 8}{" "}
                              more files omitted
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
          <Card className="bg-card/90 border-0 shadow-xl backdrop-blur-sm">
            <CardContent className="p-8 text-center sm:p-12">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 p-4 sm:mb-6 sm:h-24 sm:w-24 sm:p-6 dark:from-blue-900/30 dark:to-indigo-900/30">
                <FileCode
                  className="h-8 w-8 text-blue-600 sm:h-12 sm:w-12 dark:text-blue-400"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-foreground mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">
                No Analysis Results
              </h3>
              <p className="mx-auto max-w-md text-base text-slate-600 sm:text-lg dark:text-slate-300">
                Upload and analyze a zip file to see comprehensive results here.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </>
  );
};
