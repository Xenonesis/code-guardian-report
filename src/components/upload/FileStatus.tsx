import React from "react";
import { FileCode, X, CheckCircle, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnalysisProgress } from "@/hooks/useFileUpload";

interface FileStatusProps {
  selectedFile: File;
  isUploading: boolean;
  isAnalyzing: boolean;
  uploadComplete: boolean;
  uploadProgress: number;
  onRemoveFile: () => void;
  analysisProgress?: AnalysisProgress;
}

// Format seconds to human readable time
const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return "Almost done...";
  if (seconds < 1) return "Less than a second";
  if (seconds < 60) {
    const s = Math.ceil(seconds);
    return s === 1 ? "~1 second" : `~${s} seconds`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.ceil(seconds % 60);
  if (remainingSeconds === 0) {
    return minutes === 1 ? "~1 minute" : `~${minutes} minutes`;
  }
  return `~${minutes}m ${remainingSeconds}s`;
};

export const FileStatus: React.FC<FileStatusProps> = ({
  selectedFile,
  isUploading,
  isAnalyzing,
  uploadComplete,
  uploadProgress,
  onRemoveFile,
  analysisProgress,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border-2 border-slate-200 dark:border-slate-600">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
            <FileCode className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate"
              title={selectedFile.name}
            >
              {selectedFile.name}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemoveFile}
          className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg focus-ring flex-shrink-0"
          disabled={isUploading || isAnalyzing}
          aria-label="Remove selected file"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      {isUploading && (
        <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Uploading file...
            </span>
            <span className="text-sm text-blue-700 dark:text-blue-300 font-mono">
              {uploadProgress}%
            </span>
          </div>
          <Progress
            value={uploadProgress}
            className="w-full h-2 sm:h-3 bg-blue-100 dark:bg-blue-900"
          />
        </div>
      )}

      {isAnalyzing && (
        <div className="space-y-4 p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 rounded-xl border border-purple-200 dark:border-purple-500 animate-fade-in">
          {/* Header Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Sparkles
                className="h-5 w-5 text-purple-600 dark:text-purple-300 animate-pulse flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-base font-bold text-purple-900 dark:text-purple-50">
                Analyzing real code content...
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {analysisProgress && analysisProgress.phaseNumber > 0 && (
                <span className="text-xs font-bold text-white bg-purple-600 dark:bg-purple-500 px-3 py-1.5 rounded-full shadow-md border border-purple-400 dark:border-purple-400">
                  Step {analysisProgress.phaseNumber}/
                  {analysisProgress.totalPhases}
                </span>
              )}
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-200 bg-purple-100 dark:bg-purple-800/50 px-3 py-1 rounded-lg">
                {analysisProgress?.phase || "Extracting & scanning"}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <Progress
              value={analysisProgress?.percentComplete ?? 0}
              className="w-full h-3 sm:h-4 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden"
            />
            {analysisProgress && analysisProgress.percentComplete > 0 && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-900 dark:text-white drop-shadow-sm">
                {Math.round(analysisProgress.percentComplete)}%
              </span>
            )}
          </div>

          {/* Footer Row */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-300 font-medium leading-relaxed">
              Extracting files from ZIP • Running security pattern matching •
              Analyzing code quality • Detecting vulnerabilities
            </p>
            {analysisProgress &&
              analysisProgress.estimatedTimeRemaining > 0 && (
                <div className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 px-4 py-2 rounded-full shadow-lg whitespace-nowrap border border-purple-400/50">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {formatTimeRemaining(
                      analysisProgress.estimatedTimeRemaining
                    )}
                  </span>
                </div>
              )}
          </div>
        </div>
      )}

      {uploadComplete && !isAnalyzing && (
        <Alert className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 dark:border-emerald-800 animate-bounce-in">
          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-emerald-800 dark:text-emerald-200 font-semibold">
            File uploaded and analyzed successfully! You'll be automatically
            redirected to the results.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
