import { useState, useCallback } from 'react';
import { DetectionResult } from '@/services/languageDetectionService';

export interface SecurityIssue {
  id: string;
  line: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  tool: string;
  type: string;
  category: string; // OWASP category
  message: string;
  naturalLanguageDescription?: string; // Simplified natural language summary
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: number; // 0-100
  cvssScore?: number; // 0-10
  cweId?: string; // CWE reference
  owaspCategory?: string; // OWASP Top 10 category
  recommendation: string;
  remediation: {
    description: string;
    codeExample?: string;
    fixExample?: string;
    effort: 'Low' | 'Medium' | 'High';
    priority: number; // 1-5
  };
  filename: string;
  codeSnippet?: string;
  riskRating: 'Critical' | 'High' | 'Medium' | 'Low';
  impact: string;
  likelihood: string;
  references?: string[];
  tags?: string[];
}

export interface AnalysisResults {
  issues: SecurityIssue[];
  totalFiles: number;
  analysisTime: string;
  summary: {
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    securityScore: number; // 0-100
    qualityScore: number; // 0-100
    coveragePercentage: number;
    linesAnalyzed: number;
  };
  languageDetection?: DetectionResult; // Smart language detection results
  metrics: {
    vulnerabilityDensity: number;
    technicalDebt: string;
    maintainabilityIndex: number;
    duplicatedLines: number;
    testCoverage?: number;
  };
  dependencies?: {
    total: number;
    vulnerable: number;
    outdated: number;
    licenses: string[];
  };
}

export const useAnalysis = () => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    console.log('File selected:', file.name, 'Size:', file.size, 'bytes');
  }, []);

  const handleAnalysisComplete = useCallback((results: AnalysisResults) => {
    console.log('Analysis complete, results:', results);
    setAnalysisResults(results);
    setIsAnalyzing(false);
  }, []);

  const startAnalysis = useCallback(() => {
    setIsAnalyzing(true);
  }, []);

  const resetAnalysis = useCallback(() => {
    setAnalysisResults(null);
    setSelectedFile(null);
    setIsAnalyzing(false);
  }, []);

  return {
    analysisResults,
    isAnalyzing,
    selectedFile,
    handleFileSelect,
    handleAnalysisComplete,
    startAnalysis,
    resetAnalysis
  };
};

export default useAnalysis;
