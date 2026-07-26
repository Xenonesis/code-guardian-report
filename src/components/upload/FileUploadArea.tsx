import React from "react";
import { Upload, Sparkles } from "lucide-react";

interface FileUploadAreaProps {
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInput,
}) => {
  return (
    <div
      className={`group focus-within:ring-primary relative overflow-hidden rounded-none border-2 border-dashed p-6 text-center transition-all duration-300 focus-within:ring-2 focus-within:ring-offset-2 sm:p-8 lg:p-12 ${
        isDragOver
          ? "border-primary bg-primary/5 dark:bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary hover:bg-muted/50 dark:hover:border-primary/50"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      aria-label="File upload area. Drag and drop a zip archive or source code file here or click to browse files"
    >
      <div
        className="absolute inset-0 bg-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      ></div>
      <div className="relative z-10">
        <div className="mb-4 transition-transform duration-300 group-hover:scale-110 sm:mb-6">
          <Upload
            className="text-muted-foreground group-hover:text-primary mx-auto h-12 w-12 transition-colors duration-300 sm:h-16 sm:w-16"
            aria-hidden="true"
          />
        </div>
        <h3 className="text-foreground mb-3 text-lg font-bold sm:mb-4 sm:text-xl lg:text-2xl">
          Drop your .zip or code file here
        </h3>
        <div className="mb-4 flex items-center justify-center gap-4 sm:mb-6">
          <div
            className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600"
            aria-hidden="true"
          ></div>
          <span className="text-muted-foreground text-sm font-medium sm:text-base">
            or
          </span>
          <div
            className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600"
            aria-hidden="true"
          ></div>
        </div>
        <div className="space-y-4">
          <label
            htmlFor="file-upload"
            className="focus-ring bg-primary text-primary-foreground hover:bg-primary/90 border-primary inline-flex transform cursor-pointer items-center rounded-none border-2 px-6 py-2 text-base font-bold tracking-wider uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none sm:px-8 sm:py-3 sm:text-lg"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                document.getElementById("file-upload")?.click();
              }
            }}
          >
            <Sparkles
              className="mr-2 h-4 w-4 sm:h-5 sm:w-5"
              aria-hidden="true"
            />
            Browse Files
          </label>
          <p className="text-muted-foreground text-xs">
            Or drag and drop your .zip archive or source code file anywhere in
            this area
          </p>
        </div>
        <input
          id="file-upload"
          type="file"
          accept=".zip,application/zip,application/x-zip-compressed,.js,.jsx,.ts,.tsx,.py,.java,.go,.rb,.php,.cs,.cpp,.c,.h,.rs,.sql,.sh,.json,.yaml,.yml"
          className="sr-only"
          onChange={onFileInput}
          aria-label="Choose zip archive or source code file to upload"
        />
        <div className="bg-muted border-border mt-4 border p-3 font-mono text-xs sm:mt-6 sm:p-4 sm:text-sm">
          <div className="space-y-1">
            <p className="text-foreground">
              <strong>MAX_FILE_SIZE:</strong>{" "}
              <span className="text-muted-foreground">50MB</span>
            </p>
            <p className="text-foreground">
              <strong>SUPPORTED_LANGUAGES:</strong>{" "}
              <span className="text-muted-foreground">
                [Python, JavaScript, TypeScript, React, Node.js]
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
