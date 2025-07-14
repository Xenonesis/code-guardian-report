import { useToast } from '@/hooks/use-toast';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { type StoredAnalysisData } from '@/services/analysisStorage';

interface AnalysisHandlersProps {
  hasStoredData: boolean;
  onAnalysisComplete: (results: AnalysisResults) => void;
  onSetCurrentTab: (tab: string) => void;
  onSetIsRedirecting: (isRedirecting: boolean) => void;
  onClearStoredData: () => void;
  onExportAnalysis: (format: 'json' | 'compressed') => void;
  onImportAnalysis: (data: string, compressed: boolean) => void;
  onOptimizeStorage: () => Promise<void>;
  onRestoreFromHistory: (analysisData: StoredAnalysisData) => void;
}

export const useAnalysisHandlers = ({
  hasStoredData,
  onAnalysisComplete,
  onSetCurrentTab,
  onSetIsRedirecting,
  onClearStoredData,
  onExportAnalysis,
  onImportAnalysis,
  onOptimizeStorage,
  onRestoreFromHistory
}: AnalysisHandlersProps) => {
  const { toast } = useToast();

  const handleAnalysisCompleteWithRedirect = (results: AnalysisResults) => {
    onAnalysisComplete(results);
    onSetIsRedirecting(true);

    toast({
      title: "✅ Analysis Complete!",
      description: `Found ${results.issues.length} issues across ${results.totalFiles} files. Results saved automatically. Redirecting...`,
      variant: "default",
      duration: 2000,
    });

    setTimeout(() => {
      onSetCurrentTab('results');
      onSetIsRedirecting(false);

      toast({
        title: "📊 Results Ready!",
        description: hasStoredData ? "Analysis results are now displayed below and saved for future access." : "Analysis results are now displayed below.",
        variant: "default",
        duration: 3000,
      });
    }, 1500);
  };

  const handleClearStoredData = () => {
    onClearStoredData();
    toast({
      title: "🗑️ Data Cleared",
      description: "Stored analysis data has been cleared successfully.",
      variant: "default",
      duration: 2000,
    });
  };

  const handleExportAnalysis = (format: 'json' | 'compressed') => {
    try {
      onExportAnalysis(format);
      toast({
        title: "📤 Export Complete",
        description: `Analysis data exported as ${format.toUpperCase()} file.`,
        variant: "default",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "❌ Export Failed",
        description: "Failed to export analysis data. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleImportAnalysis = (data: string, compressed: boolean) => {
    try {
      onImportAnalysis(data, compressed);
      toast({
        title: "📥 Import Complete",
        description: "Analysis data imported successfully.",
        variant: "default",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "❌ Import Failed",
        description: "Failed to import analysis data. Please check the file format.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleOptimizeStorage = async () => {
    try {
      await onOptimizeStorage();
      toast({
        title: "🧹 Storage Optimized",
        description: "Storage has been optimized successfully.",
        variant: "default",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "❌ Optimization Failed",
        description: "Failed to optimize storage. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleRestoreFromHistory = (analysisData: StoredAnalysisData) => {
    onRestoreFromHistory(analysisData);
    onSetCurrentTab('results');
    toast({
      title: "📋 Analysis Restored",
      description: `Successfully restored analysis for ${analysisData.fileName}.`,
      variant: "default",
      duration: 2000,
    });
  };

  return {
    handleAnalysisCompleteWithRedirect,
    handleClearStoredData,
    handleExportAnalysis,
    handleImportAnalysis,
    handleOptimizeStorage,
    handleRestoreFromHistory
  };
};