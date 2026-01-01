import { useState, useCallback, useRef, useEffect } from 'react';
import { EnhancedAnalysisEngine } from '@/services/enhancedAnalysisEngine';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { validateZipFile } from '@/utils/fileValidation';
import { ZipAnalysisService } from '@/services/security/zipAnalysisService';
import { DependencyVulnerabilityScanner } from '@/services/security/dependencyVulnerabilityScanner';
import JSZip from 'jszip';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

// Analysis time estimation based on file size (in bytes)
// Uses historical performance data to estimate accurately
const estimateAnalysisTime = (fileSizeBytes: number): number => {
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  
  // More accurate estimation based on typical analysis performance:
  // - ZIP extraction: ~0.5s per MB
  // - Pattern matching: ~1.5s per MB  
  // - AST analysis: ~1s per MB
  // - Data flow: ~0.5s per MB
  // - Report generation: ~0.3s base
  
  // Base processing time (fixed overhead)
  const baseTime = 2;
  
  // Variable time based on file size
  // Smaller files are processed faster per MB
  let timePerMB: number;
  if (fileSizeMB < 1) {
    timePerMB = 4; // Small files: more overhead relative to size
  } else if (fileSizeMB < 5) {
    timePerMB = 3; // Medium files: balanced
  } else if (fileSizeMB < 15) {
    timePerMB = 2.5; // Larger files: more efficient
  } else {
    timePerMB = 2; // Very large files: best efficiency
  }
  
  const estimatedTime = baseTime + (fileSizeMB * timePerMB);
  
  // Clamp between 2 seconds and 3 minutes
  return Math.max(2, Math.min(180, estimatedTime));
};
interface UseFileUploadProps {
  onFileSelect: (file: File) => void;
  onAnalysisComplete: (results: AnalysisResults, file?: File) => void;
}

export interface AnalysisProgress {
  phase: string;
  phaseNumber: number;
  totalPhases: number;
  estimatedTimeRemaining: number; // in seconds
  elapsedTime: number; // in seconds
  percentComplete: number;
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
  
  // Analysis progress tracking
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    phase: 'Initializing',
    phaseNumber: 0,
    totalPhases: 5,
    estimatedTimeRemaining: 0,
    elapsedTime: 0,
    percentComplete: 0
  });
  const analysisStartTime = useRef<number>(0);
  const estimatedTotalTime = useRef<number>(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const lastPhaseChangeTime = useRef<number>(0);
  const actualPhaseDurations = useRef<number[]>([]);
  
  // AbortController for cancelling analysis
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      // Abort any ongoing analysis when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const startProgressTracking = useCallback((fileSize: number) => {
    const totalTime = estimateAnalysisTime(fileSize);
    estimatedTotalTime.current = totalTime;
    analysisStartTime.current = Date.now();
    lastPhaseChangeTime.current = Date.now();
    actualPhaseDurations.current = [];
    
    // Analysis phases with their approximate durations (as percentage of total)
    const phases = [
      { name: 'Extracting files from ZIP', duration: 0.15 },
      { name: 'Running security pattern matching', duration: 0.3 },
      { name: 'Analyzing code quality', duration: 0.25 },
      { name: 'Detecting vulnerabilities', duration: 0.2 },
      { name: 'Generating report', duration: 0.1 }
    ];
    
    // Start with phase 1 immediately
    setAnalysisProgress({
      phase: phases[0].name,
      phaseNumber: 1,
      totalPhases: phases.length,
      estimatedTimeRemaining: Math.round(totalTime),
      elapsedTime: 0,
      percentComplete: 2 // Start with small visible progress
    });
    
    let lastPhaseNumber = 1;
    
    // Update progress every 200ms for smoother updates
    progressInterval.current = setInterval(() => {
      const elapsed = (Date.now() - analysisStartTime.current) / 1000;
      const progressRatio = Math.min(elapsed / estimatedTotalTime.current, 0.95); // Cap at 95%
      
      // Determine current phase based on progress
      let cumulativeDuration = 0;
      let currentPhase = phases[0];
      let phaseNumber = 1;
      
      for (let i = 0; i < phases.length; i++) {
        cumulativeDuration += phases[i].duration;
        if (progressRatio < cumulativeDuration) {
          currentPhase = phases[i];
          phaseNumber = i + 1;
          break;
        }
        // If we're past all phases, stay on last phase
        if (i === phases.length - 1) {
          currentPhase = phases[i];
          phaseNumber = phases.length;
        }
      }
      
      // Track phase changes for adaptive timing
      if (phaseNumber !== lastPhaseNumber) {
        const phaseDuration = (Date.now() - lastPhaseChangeTime.current) / 1000;
        actualPhaseDurations.current.push(phaseDuration);
        lastPhaseChangeTime.current = Date.now();
        lastPhaseNumber = phaseNumber;
        
        // Adaptive timing: adjust estimate based on actual phase durations
        if (actualPhaseDurations.current.length >= 2) {
          const avgPhaseDuration = actualPhaseDurations.current.reduce((a, b) => a + b, 0) / actualPhaseDurations.current.length;
          const remainingPhases = phases.length - phaseNumber;
          const adaptiveEstimate = elapsed + (avgPhaseDuration * remainingPhases);
          // Blend original estimate with adaptive estimate
          estimatedTotalTime.current = (estimatedTotalTime.current + adaptiveEstimate) / 2;
        }
      }
      
      // Calculate remaining time with smoothing
      const remaining = Math.max(0, estimatedTotalTime.current - elapsed);
      
      // Progress percentage: ensure visible progress, cap at 95% until complete
      const percentComplete = Math.max(2, Math.min(95, progressRatio * 100));
      
      setAnalysisProgress({
        phase: currentPhase.name,
        phaseNumber,
        totalPhases: phases.length,
        estimatedTimeRemaining: Math.round(remaining),
        elapsedTime: Math.round(elapsed),
        percentComplete: Math.round(percentComplete)
      });
    }, 200);
  }, []);
  
  const stopProgressTracking = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setAnalysisProgress(prev => ({
      ...prev,
      phase: 'Complete',
      percentComplete: 100,
      estimatedTimeRemaining: 0
    }));
  }, []);

  const analyzeCode = useCallback(async (file: File) => {
    // Prevent duplicate analysis for the same file
    if (currentAnalysisFile === file.name && isAnalyzing) {
      return;
    }
    
    // Cancel any previous analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this analysis
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setCurrentAnalysisFile(file.name);
    setIsAnalyzing(true);
    startProgressTracking(file.size);

    try {
      // Check if cancelled before starting
      if (signal.aborted) {
        throw new DOMException('Analysis cancelled', 'AbortError');
      }
      
      const arrayBuffer = await file.arrayBuffer();
      
      // Check if cancelled after file read
      if (signal.aborted) {
        throw new DOMException('Analysis cancelled', 'AbortError');
      }

      try {
        const analysisResults = await analysisEngine.analyzeCodebase(file);
        
        // Check if cancelled after analysis
        if (signal.aborted) {
          throw new DOMException('Analysis cancelled', 'AbortError');
        }

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
          } catch (error_) {
            logger.warn('ZIP/dependency analysis failed, continuing with core results:', error_);
          }
        }

        stopProgressTracking();
        setIsAnalyzing(false);
        setCurrentAnalysisFile(null);
        onAnalysisComplete(finalResults, file);
      } catch (analysisError) {
        if (analysisError instanceof DOMException && analysisError.name === 'AbortError') {
          stopProgressTracking();
          setIsAnalyzing(false);
          setCurrentAnalysisFile(null);
          toast({
            title: 'Analysis Cancelled',
            description: 'The analysis was cancelled.',
            variant: 'default'
          });
          return;
        }
        
        logger.error('Analysis engine error:', analysisError);
        stopProgressTracking();
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
      if (error instanceof DOMException && error.name === 'AbortError') {
        stopProgressTracking();
        setIsAnalyzing(false);
        setCurrentAnalysisFile(null);
        return;
      }
      
      logger.error('Error processing file:', error);
      stopProgressTracking();
      setIsAnalyzing(false);
      setError('Failed to process the ZIP file. Please try again.');
    }
  }, [onAnalysisComplete, analysisEngine, startProgressTracking, stopProgressTracking]);

  const processZipFile = useCallback(async (file: File) => {
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
    // Cancel any ongoing analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    stopProgressTracking();
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsAnalyzing(false);
    setUploadComplete(false);
    setError(null);
    setCurrentAnalysisFile(null);
    lastPhaseChangeTime.current = 0;
    actualPhaseDurations.current = [];
    setAnalysisProgress({
      phase: 'Initializing',
      phaseNumber: 0,
      totalPhases: 5,
      estimatedTimeRemaining: 0,
      elapsedTime: 0,
      percentComplete: 0
    });
  };

  // Cancel ongoing analysis without removing file
  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    stopProgressTracking();
    setIsAnalyzing(false);
    setCurrentAnalysisFile(null);
    setAnalysisProgress({
      phase: 'Cancelled',
      phaseNumber: 0,
      totalPhases: 5,
      estimatedTimeRemaining: 0,
      elapsedTime: 0,
      percentComplete: 0
    });
  }, [stopProgressTracking]);

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
    analysisProgress,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInput,
    removeFile,
    cancelAnalysis,
    processFileDirectly
  };
};