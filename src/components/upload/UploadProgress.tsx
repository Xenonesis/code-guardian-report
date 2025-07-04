import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';

interface UploadProgressProps {
  isUploading: boolean;
  isAnalyzing: boolean;
  uploadProgress: number;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  isUploading,
  isAnalyzing,
  uploadProgress
}) => {
  if (isUploading) {
    return (
      <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800 animate-fade-in">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Uploading file...</span>
          <span className="text-sm text-blue-700 dark:text-blue-300 font-mono">{uploadProgress}%</span>
        </div>
        <Progress value={uploadProgress} className="w-full h-2 sm:h-3 bg-blue-100 dark:bg-blue-900" />
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200 dark:border-purple-800 animate-fade-in">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
            <Sparkles className="h-4 w-4 animate-pulse" aria-hidden="true" />
            Analyzing code...
          </span>
          <span className="text-sm text-purple-700 dark:text-purple-300">Please wait</span>
        </div>
        <Progress value={undefined} className="w-full h-2 sm:h-3 bg-purple-100 dark:bg-purple-900" />
      </div>
    );
  }

  return null;
};