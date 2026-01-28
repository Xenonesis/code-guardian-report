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
      className={`group relative overflow-hidden rounded-2xl border-3 border-dashed p-6 text-center transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 sm:p-8 lg:p-12 ${
        isDragOver
          ? "scale-105 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50"
          : "border-slate-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-slate-50 hover:to-blue-50 dark:border-slate-600 dark:hover:border-blue-500 dark:hover:from-slate-800/50 dark:hover:to-blue-900/50"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      aria-label="File upload area. Drag and drop a zip file here or click to browse files"
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-indigo-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      ></div>
      <div className="relative z-10">
        <div className="mb-4 transition-transform duration-300 group-hover:scale-110 sm:mb-6">
          <Upload
            className="mx-auto h-12 w-12 text-slate-400 transition-colors duration-300 group-hover:text-blue-500 sm:h-16 sm:w-16"
            aria-hidden="true"
          />
        </div>
        <h3 className="mb-3 text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600 sm:mb-4 sm:text-xl lg:text-2xl dark:text-white dark:group-hover:text-blue-400">
          Drop your .zip file here
        </h3>
        <div className="mb-4 flex items-center justify-center gap-4 sm:mb-6">
          <div
            className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600"
            aria-hidden="true"
          ></div>
          <span className="text-sm font-medium text-slate-500 sm:text-base dark:text-slate-400">
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
            className="focus-ring inline-flex transform cursor-pointer items-center rounded-lg border-0 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl sm:px-8 sm:py-3 sm:text-lg"
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
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Or drag and drop your zip file anywhere in this area
          </p>
        </div>
        <input
          id="file-upload"
          type="file"
          accept=".zip,application/zip,application/x-zip-compressed"
          className="sr-only"
          onChange={onFileInput}
          aria-label="Choose zip file to upload"
        />
        <div className="mt-4 rounded-lg bg-slate-100 p-3 text-xs text-slate-500 sm:mt-6 sm:p-4 sm:text-sm dark:bg-slate-700/50 dark:text-slate-400">
          <div className="space-y-1">
            <p>
              <strong>Maximum file size:</strong> 50MB
            </p>
            <p>
              <strong>Supported languages:</strong> Python, JavaScript,
              TypeScript, React, Node.js
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
