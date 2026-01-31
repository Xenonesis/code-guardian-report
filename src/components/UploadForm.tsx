import React, { useState } from "react";
import { FileCode, AlertTriangle, Github, Upload, Shield } from "lucide-react";
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
    <div className="mx-auto w-full max-w-3xl">
      <Card className="border-muted/40 overflow-hidden shadow-2xl shadow-black/5 backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/50 dark:shadow-black/20">
        <CardHeader className="border-border/40 bg-muted/20 border-b pt-10 pb-8 text-center dark:bg-white/[0.02]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg ring-4 shadow-blue-500/20 ring-blue-500/10">
            <FileCode className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="from-foreground to-foreground/70 bg-gradient-to-b bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            Analyze Your Code
          </CardTitle>
          <CardDescription className="text-muted-foreground/80 mx-auto mt-3 max-w-lg text-base">
            Securely analyze your codebase for patterns, languages, and quality
            metrics using our local-first engine.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 p-6 sm:p-8">
          {!selectedFile && !error && (
            <Tabs
              value={uploadMethod}
              onValueChange={(value) =>
                setUploadMethod(value as "file" | "github")
              }
              className="w-full"
            >
              <TabsList className="bg-muted/30 border-border/50 mb-8 grid h-auto w-full grid-cols-2 rounded-xl border p-1.5">
                <TabsTrigger
                  value="file"
                  className="data-[state=active]:bg-background text-muted-foreground hover:text-foreground flex h-12 items-center justify-center gap-2.5 rounded-lg text-sm font-semibold transition-all duration-200 data-[state=active]:text-blue-600 data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/5 dark:data-[state=active]:text-blue-400"
                >
                  <Upload className="h-5 w-5" />
                  Upload ZIP
                </TabsTrigger>
                <TabsTrigger
                  value="github"
                  className="data-[state=active]:bg-background text-muted-foreground hover:text-foreground flex h-12 items-center justify-center gap-2.5 rounded-lg text-sm font-semibold transition-all duration-200 data-[state=active]:text-purple-600 data-[state=active]:shadow-md data-[state=active]:shadow-purple-500/5 dark:data-[state=active]:text-purple-400"
                >
                  <Github className="h-5 w-5" />
                  GitHub Repo
                </TabsTrigger>
              </TabsList>

              <div className="mt-6 min-h-[280px]">
                <TabsContent
                  value="file"
                  className="animate-in fade-in slide-in-from-bottom-2 mt-0 h-full duration-300"
                >
                  <FileUploadArea
                    isDragOver={isDragOver}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onFileInput={handleFileInput}
                  />
                </TabsContent>

                <TabsContent
                  value="github"
                  className="animate-in fade-in slide-in-from-bottom-2 mt-0 h-full duration-300"
                >
                  <GitHubRepoInput onFileReady={handleGitHubFileReady} />
                </TabsContent>
              </div>
            </Tabs>
          )}

          {selectedFile && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <FileStatus
                selectedFile={selectedFile}
                isUploading={isUploading}
                isAnalyzing={isAnalyzing}
                uploadComplete={uploadComplete}
                uploadProgress={uploadProgress}
                onRemoveFile={removeFile}
                analysisProgress={analysisProgress}
              />
            </div>
          )}

          {error && (
            <Alert
              variant="destructive"
              className="animate-in fade-in slide-in-from-bottom-2 border-red-500/20 bg-red-500/10 text-red-600 duration-300 dark:text-red-400"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="ml-2 font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <div className="bg-muted/30 border-border/40 border-t p-4 px-6 sm:px-8">
          <div className="text-muted-foreground/80 flex items-start gap-3 text-xs">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <p className="leading-relaxed">
              <span className="text-foreground/90 font-semibold">
                Privacy & Security:
              </span>{" "}
              Your code is analyzed completely locally in your browser. No files
              are uploaded to any server. Data is stored persistently on your
              device for your convenience.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UploadForm;
