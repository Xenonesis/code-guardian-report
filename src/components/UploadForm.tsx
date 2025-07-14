import React from 'react';
import { FileCode, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { useFileUpload } from '@/hooks/useFileUpload';
import { FileUploadArea } from '@/components/upload/FileUploadArea';
import { FileStatus } from '@/components/upload/FileStatus';

interface UploadFormProps {
  onFileSelect: (file: File) => void;
  onAnalysisComplete: (results: AnalysisResults) => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({ onFileSelect, onAnalysisComplete }) => {
  const {
    isDragOver,
    uploadProgress,
    selectedFile,
    isUploading,
    isAnalyzing,
    uploadComplete,
    error,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    removeFile
  } = useFileUpload({ onFileSelect, onAnalysisComplete });

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 shadow-2xl card-hover">
      <CardHeader className="text-center pb-6 sm:pb-8">
        <CardTitle className="flex flex-col sm:flex-row items-center justify-center gap-3 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg animate-float">
            <FileCode className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          Upload Your Code
        </CardTitle>
        <CardDescription className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-3 sm:mt-4 px-4 sm:px-0">
          Upload a .zip file containing your source code for comprehensive security and quality analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
        {!selectedFile ? (
          <FileUploadArea
            isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileInput={handleFileInput}
          />
        ) : (
          <FileStatus
            selectedFile={selectedFile}
            isUploading={isUploading}
            isAnalyzing={isAnalyzing}
            uploadComplete={uploadComplete}
            uploadProgress={uploadProgress}
            onRemoveFile={removeFile}
          />
        )}

        <Alert className="border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20 dark:border-l-amber-400" role="note">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm sm:text-base">
            <strong>Privacy & Security:</strong> Your code is analyzed locally and securely. Files are processed in-browser with persistent storage for your convenience. Analysis results are automatically saved until you upload a new file.
          </AlertDescription>
        </Alert>
        {error && (
          <Alert className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20 dark:border-l-red-400" role="alert">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            <AlertDescription className="text-red-800 dark:text-red-200 text-sm sm:text-base">
              <strong>Invalid ZIP File:</strong> {error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadForm;
