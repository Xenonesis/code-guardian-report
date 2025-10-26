import React, { useState } from 'react';
import { FileCode, AlertTriangle, Github, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { useFileUpload } from '@/hooks/useFileUpload';
import { FileUploadArea } from '@/components/upload/FileUploadArea';
import { FileStatus } from '@/components/upload/FileStatus';
import { GitHubRepoInput } from '@/components/upload/GitHubRepoInput';

interface UploadFormProps {
  onFileSelect: (file: File) => void;
  onAnalysisComplete: (results: AnalysisResults) => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({ onFileSelect, onAnalysisComplete }) => {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'github'>('file');
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
    removeFile,
    processFileDirectly
  } = useFileUpload({ onFileSelect, onAnalysisComplete });

  const handleGitHubFileReady = (file: File) => {
    // Process the file from GitHub the same way as uploaded files
    processFileDirectly(file);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900 backdrop-blur-sm border-2 border-slate-200/60 dark:border-slate-700/60 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-3xl">
      <CardHeader className="text-center pb-8 sm:pb-10 pt-8 sm:pt-10">
        <CardTitle className="flex flex-col sm:flex-row items-center justify-center gap-4 text-3xl sm:text-4xl font-bold">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl shadow-2xl animate-float-gentle hover:scale-110 transition-transform duration-300">
            <FileCode className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-extrabold">
            Analyze Your Code
          </span>
        </CardTitle>
        <CardDescription className="text-base sm:text-lg text-slate-700 dark:text-slate-300 mt-4 sm:mt-5 px-4 sm:px-6 font-medium leading-relaxed">
          Upload a .zip file or analyze directly from a GitHub repository
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
        {!selectedFile && !error && (
          <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as 'file' | 'github')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gradient-to-br from-slate-100 to-slate-200/80 dark:from-slate-700 dark:to-slate-800 p-1.5 rounded-xl shadow-lg">
              <TabsTrigger value="file" className="flex items-center gap-2 py-3 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl rounded-lg transition-all duration-300">
                <Upload className="h-4 w-4" />
                Upload ZIP File
              </TabsTrigger>
              <TabsTrigger value="github" className="flex items-center gap-2 py-3 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl rounded-lg transition-all duration-300">
                <Github className="h-4 w-4" />
                GitHub Repository
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="mt-0">
              <FileUploadArea
                isDragOver={isDragOver}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onFileInput={handleFileInput}
              />
            </TabsContent>

            <TabsContent value="github" className="mt-0">
              <GitHubRepoInput onFileReady={handleGitHubFileReady} />
            </TabsContent>
          </Tabs>
        )}

        {selectedFile && (
          <FileStatus
            selectedFile={selectedFile}
            isUploading={isUploading}
            isAnalyzing={isAnalyzing}
            uploadComplete={uploadComplete}
            uploadProgress={uploadProgress}
            onRemoveFile={removeFile}
          />
        )}
        
        {error && (
          <Alert className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20 dark:border-l-red-400" role="alert">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            <AlertDescription className="text-red-800 dark:text-red-200 text-sm sm:text-base">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        <Alert className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 via-amber-50/80 to-yellow-50/50 dark:from-amber-950/30 dark:via-amber-950/20 dark:to-yellow-950/10 dark:border-l-amber-400 shadow-lg rounded-xl" role="note">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <AlertDescription className="text-amber-900 dark:text-amber-100 text-sm sm:text-base leading-relaxed">
            <strong className="font-bold">Privacy & Security:</strong> Your code is analyzed locally and securely. Files are processed in-browser with persistent storage for your convenience. Analysis results are automatically saved until you upload a new file.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default UploadForm;
