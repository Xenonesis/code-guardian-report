import React from "react";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";

interface UploadProgressProps {
  isUploading: boolean;
  isAnalyzing: boolean;
  uploadProgress: number;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  isUploading,
  isAnalyzing,
  uploadProgress,
}) => {
  if (isUploading) {
    return (
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
    );
  }

  if (isAnalyzing) {
    return (
      <div className="animate-fade-in space-y-3 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:space-y-4 sm:p-6 dark:border-purple-800 dark:from-purple-950/30 dark:to-pink-950/30">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold text-purple-900 dark:text-purple-100">
            <Sparkles className="h-4 w-4 animate-pulse" aria-hidden="true" />
            Analyzing code...
          </span>
          <span className="text-sm text-purple-700 dark:text-purple-300">
            Please wait
          </span>
        </div>
        <Progress
          value={undefined}
          className="h-2 w-full bg-purple-100 sm:h-3 dark:bg-purple-900"
        />
      </div>
    );
  }

  return null;
};
