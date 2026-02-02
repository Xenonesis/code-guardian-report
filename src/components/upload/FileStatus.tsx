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
    <div className="animate-slide-up space-y-4 sm:space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-4 sm:flex-row sm:items-center sm:p-6 dark:border-slate-600 dark:from-slate-800 dark:to-slate-700">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div className="flex-shrink-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-2 shadow-lg sm:p-3">
            <FileCode className="h-6 w-6 text-white sm:h-8 sm:w-8" />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-base font-bold text-slate-900 sm:text-lg dark:text-white"
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
          className="focus-ring flex-shrink-0 rounded-lg text-red-600 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30"
          disabled={isUploading || isAnalyzing}
          aria-label="Remove selected file"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      {isUploading && (
        <div className="animate-fade-in space-y-3 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:space-y-4 sm:p-6 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Uploading file...
            </span>
            <span className="font-mono text-sm text-blue-700 dark:text-blue-300">
              {uploadProgress}%
            </span>
          </div>
          <Progress
            value={uploadProgress}
            className="h-2 w-full bg-blue-100 sm:h-3 dark:bg-blue-900"
          />
        </div>
      )}

      {isAnalyzing && (
        <div className="animate-fade-in space-y-4 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 dark:border-purple-500 dark:from-purple-900/50 dark:to-pink-900/50">
          {}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Sparkles
                className="h-5 w-5 flex-shrink-0 animate-pulse text-purple-600 dark:text-purple-300"
                aria-hidden="true"
              />
              <span className="text-base font-bold text-purple-900 dark:text-purple-50">
                Analyzing real code content...
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {analysisProgress && analysisProgress.phaseNumber > 0 && (
                <span className="rounded-full border border-purple-400 bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-md dark:border-purple-400 dark:bg-purple-500">
                  Step {analysisProgress.phaseNumber}/
                  {analysisProgress.totalPhases}
                </span>
              )}
              <span className="rounded-lg bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700 dark:bg-purple-800/50 dark:text-purple-200">
                {analysisProgress?.phase || "Extracting & scanning"}
              </span>
            </div>
          </div>

          {}
          <div className="relative">
            <Progress
              value={analysisProgress?.percentComplete ?? 0}
              className="h-3 w-full overflow-hidden rounded-full bg-purple-200 sm:h-4 dark:bg-purple-800"
            />
            {analysisProgress && analysisProgress.percentComplete > 0 && (
              <span className="absolute top-1/2 right-2 -translate-y-1/2 text-xs font-bold text-purple-900 drop-shadow-sm dark:text-white">
                {Math.round(analysisProgress.percentComplete)}%
              </span>
            )}
          </div>

          {}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed font-medium text-purple-600 sm:text-sm dark:text-purple-300">
              Extracting files from ZIP • Running security pattern matching •
              Analyzing code quality • Detecting vulnerabilities
            </p>
            {analysisProgress &&
              analysisProgress.estimatedTimeRemaining > 0 && (
                <div className="flex items-center gap-2 rounded-full border border-purple-400/50 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-bold whitespace-nowrap text-white shadow-lg dark:from-purple-500 dark:to-pink-500">
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
        <Alert className="animate-bounce-in border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-green-950/30">
          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="font-semibold text-emerald-800 dark:text-emerald-200">
            File uploaded and analyzed successfully! You'll be automatically
            redirected to the results.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
