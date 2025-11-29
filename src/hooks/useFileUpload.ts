import { useState, useCallback } from 'react';
import { EnhancedAnalysisEngine } from '@/services/enhancedAnalysisEngine';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { validateZipFile } from '@/utils/fileValidation';
import { ZipAnalysisService } from '@/services/security/zipAnalysisService';
import { DependencyVulnerabilityScanner } from '@/services/security/dependencyVulnerabilityScanner';
import JSZip from 'jszip';

import { logger } from '@/utils/logger';
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
  const [zipAnalysisService] = useState(() => new ZipAnalysisService());
  const [dependencyScanner] = useState(() => new DependencyVulnerabilityScanner());
  const [currentAnalysisFile, setCurrentAnalysisFile] = useState<string | null>(null);

  const analyzeCode = useCallback(async (file: File) => {
    // Prevent duplicate analysis for the same file
    if (currentAnalysisFile === file.name && isAnalyzing) {
      logger.debug('⚠️ Analysis already in progress for:', file.name);
      return;
    }
    
    logger.debug('Starting enhanced security analysis for:', file.name);
    setCurrentAnalysisFile(file.name);
    setIsAnalyzing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      logger.debug(`File size: ${arrayBuffer.byteLength} bytes`);

      try {
        const analysisResults = await analysisEngine.analyzeCodebase(file);
        logger.debug('Enhanced analysis complete:', {
          totalIssues: analysisResults.issues.length,
          totalFiles: analysisResults.totalFiles,
          analysisTime: analysisResults.analysisTime,
          securityScore: analysisResults.summary.securityScore,
          qualityScore: analysisResults.summary.qualityScore,
          criticalIssues: analysisResults.summary.criticalIssues,
          fullSummary: analysisResults.summary
        });

        let finalResults: AnalysisResults = analysisResults;

        // If a ZIP is uploaded, run ZIP analysis + dependency scan and merge into results
        if (file.name.toLowerCase().endsWith('.zip')) {
          try {
            const zipAnalysis = await zipAnalysisService.analyzeZipFile(file as unknown as { name: string; size: number; lastModified: number; arrayBuffer: () => Promise<ArrayBuffer> });

            const zip = await JSZip.loadAsync(arrayBuffer);
            const manifestNames = new Set([
              'package.json', 'yarn.lock', 'pnpm-lock.yaml', 'requirements.txt', 'Pipfile', 'poetry.lock',
              'composer.json', 'composer.lock', 'Gemfile', 'Gemfile.lock', 'pom.xml', 'build.gradle',
              'Cargo.toml', 'Cargo.lock'
            ]);
            const filesForScan: Array<{ name: string; content: string }> = [];
            await Promise.all(
              Object.keys(zip.files).map(async (p) => {
                const f = zip.files[p];
                if (f.dir) return;
                const base = p.split('/').pop() || p;
                if (manifestNames.has(base)) {
                  const content = await f.async('string');
                  filesForScan.push({ name: base, content });
                }
              })
            );
            const dependencyAnalysis = await dependencyScanner.scanDependencies(filesForScan);

            finalResults = { ...analysisResults, zipAnalysis, dependencyAnalysis };
          } catch (zipErr) {
            logger.warn('ZIP/dependency analysis failed, continuing with core results:', zipErr);
          }
        }

        setIsAnalyzing(false);
        setCurrentAnalysisFile(null);
        onAnalysisComplete(finalResults, file);
      } catch (analysisError) {
        logger.error('Analysis engine error:', analysisError);
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
    } catch (error) {
      logger.error('Error processing file:', error);
      setIsAnalyzing(false);
      setError('Failed to process the ZIP file. Please try again.');
    }
  }, [onAnalysisComplete, analysisEngine]);

  const processZipFile = useCallback(async (file: File) => {
    logger.debug('Starting to process zip file:', file.name);
    
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

  // Direct file processing method for programmatically created files (e.g., from GitHub)
  const processFileDirectly = useCallback((file: File) => {
    processFile(file);
  }, [processFile]);

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
    removeFile,
    processFileDirectly
  };
};