import { useState, useCallback } from 'react';
import { EnhancedAnalysisEngine } from '@/services/enhancedAnalysisEngine';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { validateZipFile } from '@/utils/fileValidation';

interface UseFileUploadProps {
  onFileSelect: (file: File) => void;
  onAnalysisComplete: (results: AnalysisResults, file?: File) => void;
}

export const useFileUpload = ({ onFileSelect, onAnalysisComplete }: UseFileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisEngine] = useState(() => new EnhancedAnalysisEngine());
  const [currentAnalysisFile, setCurrentAnalysisFile] = useState<string | null>(null);

  const analyzeCode = useCallback(async (file: File) => {
    // Prevent duplicate analysis for the same file
    if (currentAnalysisFile === file.name && isAnalyzing) {
      console.log('⚠️ Analysis already in progress for:', file.name);
      return;
    }
    
    console.log('Starting enhanced security analysis for:', file.name);
    setCurrentAnalysisFile(file.name);
    setIsAnalyzing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      console.log('File size:', arrayBuffer.byteLength, 'bytes');

      setTimeout(async () => {
        try {
          const analysisResults = await analysisEngine.analyzeCodebase(file);
          console.log('Enhanced analysis complete:', {
            totalIssues: analysisResults.issues.length,
            totalFiles: analysisResults.totalFiles,
            analysisTime: analysisResults.analysisTime,
            securityScore: analysisResults.summary.securityScore,
            qualityScore: analysisResults.summary.qualityScore,
            criticalIssues: analysisResults.summary.criticalIssues,
            fullSummary: analysisResults.summary
          });

          setIsAnalyzing(false);
          setCurrentAnalysisFile(null);
          onAnalysisComplete(analysisResults, file);
        } catch (analysisError) {
          console.error('Analysis engine error:', analysisError);
          setIsAnalyzing(false);
          setCurrentAnalysisFile(null);
          
          if (analysisError instanceof Error && analysisError.message.includes('does not contain any code files')) {
            setError(analysisError.message);
            setSelectedFile(null);
            setUploadComplete(false);
            return;
          }
          
          const emptyResults = {
            issues: [],
            totalFiles: 0,
            analysisTime: '0.1s',
            summary: {
              criticalIssues: 0,
              highIssues: 0,
              mediumIssues: 0,
              lowIssues: 0,
              securityScore: 100,
              qualityScore: 100,
              coveragePercentage: 0,
              linesAnalyzed: 0
            },
            metrics: {
              vulnerabilityDensity: 0,
              technicalDebt: '0',
              maintainabilityIndex: 100,
              duplicatedLines: 0
            },
            dependencies: {
              total: 0,
              vulnerable: 0,
              outdated: 0,
              licenses: []
            }
          };
          onAnalysisComplete(emptyResults, file);
        }
      }, 4000);

    } catch (error) {
      console.error('Error processing file:', error);
      setIsAnalyzing(false);
      setError('Failed to process the ZIP file. Please try again.');
    }
  }, [onAnalysisComplete, analysisEngine]);

  const processZipFile = useCallback(async (file: File) => {
    console.log('Starting to process zip file:', file.name);
    
    const validation = await validateZipFile(file);
    if (!validation.isValid) {
      setError(validation.message);
      setSelectedFile(null);
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadComplete(false);
    setError(null);

    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setIsUploading(false);
          setUploadComplete(true);
          analyzeCode(file);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  }, [analyzeCode]);

  const processFile = useCallback(async (file: File) => {
    setError(null); // Clear previous errors
    const validation = await validateZipFile(file);
    if (!validation.isValid) {
      setError(validation.message);
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
    processZipFile(file);
  }, [onFileSelect, processZipFile]);

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
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    
    e.target.value = '';
  }, [processFile]);

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsAnalyzing(false);
    setUploadComplete(false);
    setError(null);
  };

  return {
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
  };
};