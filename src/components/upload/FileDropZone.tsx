import React, { useCallback, useState } from 'react';
import { Upload, Sparkles } from 'lucide-react';

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const zipFile = files.find(file => file.name.endsWith('.zip') || file.type === 'application/zip');

    if (zipFile) {
      onFileSelect(zipFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file && (file.name.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed')) {
      onFileSelect(file);
    } else {
      alert('Please select a valid .zip file');
    }
    
    e.target.value = '';
  }, [onFileSelect]);

  return (
    <div
      className={`relative border-3 border-dashed rounded-2xl p-6 sm:p-8 lg:p-12 text-center transition-all duration-300 overflow-hidden group focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${
        isDragOver
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 scale-105'
          : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gradient-to-br hover:from-slate-50 hover:to-blue-50 dark:hover:from-slate-800/50 dark:hover:to-blue-900/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label="File upload area. Drag and drop a zip file here or click to browse files"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
      <div className="relative z-10">
        <div className="mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
          <Upload className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-slate-400 group-hover:text-blue-500 transition-colors duration-300" aria-hidden="true" />
        </div>
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          Drop your .zip file here
        </h3>
        <div className="flex items-center justify-center gap-4 mb-4 sm:mb-6">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent flex-1" aria-hidden="true"></div>
          <span className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">or</span>
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent flex-1" aria-hidden="true"></div>
        </div>
        <div className="space-y-4">
          <label
            htmlFor="file-upload"
            className="inline-flex items-center cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold focus-ring rounded-lg"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.getElementById('file-upload')?.click();
              }
            }}
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" aria-hidden="true" />
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
          onChange={handleFileInput}
          aria-label="Choose zip file to upload"
        />
        <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-4 sm:mt-6 bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3 sm:p-4">
          <div className="space-y-1">
            <p><strong>Maximum file size:</strong> 50MB</p>
            <p><strong>Supported languages:</strong> Python, JavaScript, TypeScript, React, Node.js</p>
          </div>
        </div>
      </div>
    </div>
  );
};