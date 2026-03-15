import { useState, useCallback } from "react";

// Re-export canonical types for backward compatibility.
// All new code should import directly from "@/types/security-types".
export type { SecurityIssue, AnalysisResults } from "@/types/security-types";
import type { AnalysisResults } from "@/types/security-types";

export const useAnalysis = () => {
  const [analysisResults, setAnalysisResults] =
    useState<AnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleAnalysisComplete = useCallback((results: AnalysisResults) => {
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
    resetAnalysis,
  };
};

export default useAnalysis;
