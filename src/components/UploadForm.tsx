import React, { useState } from "react";
import { FileCode, AlertTriangle, Github, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisResults } from "@/hooks/useAnalysis";
import { useFileUpload } from "@/hooks/useFileUpload";
import { FileUploadArea } from "@/components/upload/FileUploadArea";
import { FileStatus } from "@/components/upload/FileStatus";
import { GitHubRepoInput } from "@/components/upload/GitHubRepoInput";

interface UploadFormProps {
  onFileSelect: (file: File) => void;
  onAnalysisComplete: (results: AnalysisResults) => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({
  onFileSelect,
  onAnalysisComplete,
}) => {
  const [uploadMethod, setUploadMethod] = useState<"file" | "github">("file");
  const {
    isDragOver,
    uploadProgress,
    selectedFile,
    isUploading,
    isAnalyzing,
    uploadComplete,
    error,
    analysisProgress,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    removeFile,
    processFileDirectly,
  } = useFileUpload({ onFileSelect, onAnalysisComplete });

  const handleGitHubFileReady = (file: File) => {
    // Process the file from GitHub the same way as uploaded files
    processFileDirectly(file);
  };

  return (
    <Card className="hover:shadow-3xl mx-auto w-full max-w-4xl rounded-2xl border-2 border-slate-200/60 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 shadow-2xl backdrop-blur-sm transition-all duration-300 sm:rounded-3xl dark:border-slate-700/60 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900">
      <CardHeader className="px-4 pt-6 pb-6 text-center sm:px-6 sm:pt-8 sm:pb-8 lg:pt-10 lg:pb-10">
        <CardTitle className="flex flex-col items-center justify-center gap-3 text-2xl font-bold sm:flex-row sm:gap-4 sm:text-3xl lg:text-4xl">
          <div className="animate-float-gentle rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-2.5 shadow-2xl transition-transform duration-300 hover:scale-110 sm:rounded-2xl sm:p-3 lg:p-4">
            <FileCode className="h-7 w-7 text-white sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text font-extrabold text-transparent">
            Analyze Your Code
          </span>
        </CardTitle>
        <CardDescription className="mt-3 px-2 text-sm leading-relaxed font-medium text-slate-700 sm:mt-4 sm:px-4 sm:text-base lg:mt-5 lg:px-6 lg:text-lg dark:text-slate-300">
          Upload a .zip file or analyze directly from a GitHub repository
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-3 pb-6 sm:space-y-6 sm:px-4 sm:pb-8 lg:space-y-8 lg:px-6">
        {!selectedFile && !error && (
          <Tabs
            value={uploadMethod}
            onValueChange={(value) =>
              setUploadMethod(value as "file" | "github")
            }
            className="w-full"
          >
            <TabsList className="mb-6 grid w-full grid-cols-2 rounded-2xl border border-slate-700/50 bg-slate-900/90 p-1.5 shadow-2xl ring-1 shadow-black/20 ring-white/5 backdrop-blur-xl sm:mb-8 sm:rounded-3xl sm:p-2 dark:border-slate-600/30 dark:bg-slate-950/95">
              <TabsTrigger
                value="file"
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3.5 text-sm font-bold text-slate-400 transition-all duration-300 ease-out hover:bg-slate-800/50 hover:text-slate-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_30px_rgba(59,130,246,0.5)] data-[state=active]:ring-2 data-[state=active]:ring-blue-400/30 sm:gap-3 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-base dark:text-slate-500"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 data-[state=active]:opacity-0 sm:rounded-2xl" />
                <Upload className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
                <span className="xs:inline hidden tracking-wide">
                  Upload ZIP
                </span>
                <span className="xs:hidden font-semibold">ZIP</span>
              </TabsTrigger>
              <TabsTrigger
                value="github"
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3.5 text-sm font-bold text-slate-400 transition-all duration-300 ease-out hover:bg-slate-800/50 hover:text-slate-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:via-purple-600 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-[0_0_30px_rgba(139,92,246,0.5)] data-[state=active]:ring-2 data-[state=active]:ring-purple-400/30 sm:gap-3 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-base dark:text-slate-500"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 data-[state=active]:opacity-0 sm:rounded-2xl" />
                <Github className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
                <span className="xs:inline hidden tracking-wide">GitHub</span>
                <span className="xs:hidden font-semibold">GitHub</span>
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
            analysisProgress={analysisProgress}
          />
        )}

        {error && (
          <Alert
            className="border-l-4 border-l-red-500 bg-red-50 dark:border-l-red-400 dark:bg-red-950/20"
            role="alert"
          >
            <AlertTriangle
              className="h-4 w-4 text-red-600 sm:h-5 sm:w-5 dark:text-red-400"
              aria-hidden="true"
            />
            <AlertDescription className="text-xs text-red-800 sm:text-sm lg:text-base dark:text-red-200">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        <Alert
          className="rounded-xl border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 via-amber-50/80 to-yellow-50/50 shadow-lg dark:border-l-amber-400 dark:from-amber-950/30 dark:via-amber-950/20 dark:to-yellow-950/10"
          role="note"
        >
          <AlertTriangle
            className="h-4 w-4 text-amber-600 sm:h-5 sm:w-5 dark:text-amber-400"
            aria-hidden="true"
          />
          <AlertDescription className="text-xs leading-relaxed text-amber-900 sm:text-sm lg:text-base dark:text-amber-100">
            <strong className="font-bold">Privacy & Security:</strong> Your code
            is analyzed locally and securely. Files are processed in-browser
            with persistent storage for your convenience. Analysis results are
            automatically saved until you upload a new file.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default UploadForm;
