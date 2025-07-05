import { useState, Suspense, lazy } from 'react';

import { PageLayout } from '@/components/layouts/PageLayout';
import { HomeHero } from '@/components/pages/home/HomeHero';
import { AnalysisTabs } from '@/components/pages/home/AnalysisTabs';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useEnhancedAnalysis } from '@/hooks/useEnhancedAnalysis';
import { useToast } from '@/hooks/use-toast';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { type StoredAnalysisData } from '@/services/analysisStorage';

// Lazy load heavy components for better performance
const FloatingChatBot = lazy(() => import('@/components/FloatingChatBot'));
const StorageStatus = lazy(() => import('@/components/StorageStatus'));
const AnalysisHistoryModal = lazy(() => import('@/components/AnalysisHistoryModal'));

const Index = () => {
  const [currentTab, setCurrentTab] = useState('upload');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showStorageStatus, setShowStorageStatus] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  const {
    analysisResults,
    hasStoredData,
    isNewFile,
    storedAnalysis,
    storageStats,
    handleFileSelect,
    handleAnalysisComplete,
    clearStoredData,
    exportAnalysis,
    importAnalysis,
    getAnalysisHistory,
    optimizeStorage,
    restoreFromHistory,
  } = useEnhancedAnalysis();
  
  const { toast } = useToast();

  const handleStartAnalysis = () => {
    setCurrentTab('upload');
  };

  // Enhanced analysis complete handler with automatic redirection and storage notification
  const handleAnalysisCompleteWithRedirect = (results: AnalysisResults) => {
    handleAnalysisComplete(results);
    setIsRedirecting(true);

    // Show success notification with storage info
    toast({
      title: "✅ Analysis Complete!",
      description: `Found ${results.issues.length} issues across ${results.totalFiles} files. Results saved automatically. Redirecting...`,
      variant: "default",
      duration: 2000,
    });

    // Automatically switch to results tab after a brief delay for better UX
    setTimeout(() => {
      setCurrentTab('results');
      setIsRedirecting(false);

      // Show a second toast confirming the redirection
      toast({
        title: "📊 Results Ready!",
        description: hasStoredData ? "Analysis results are now displayed below and saved for future access." : "Analysis results are now displayed below.",
        variant: "default",
        duration: 3000,
      });
    }, 1500);
  };

  // Storage management handlers
  const handleClearStoredData = () => {
    clearStoredData();
    toast({
      title: "🗑️ Data Cleared",
      description: "Stored analysis data has been cleared successfully.",
      variant: "default",
      duration: 2000,
    });
  };

  const handleExportAnalysis = (format: 'json' | 'compressed') => {
    try {
      exportAnalysis(format);
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
      importAnalysis(data, compressed);
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
      await optimizeStorage();
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
    restoreFromHistory(analysisData);
    setShowHistoryModal(false);
    setCurrentTab('results');
    toast({
      title: "📋 Analysis Restored",
      description: `Successfully restored analysis for ${analysisData.fileName}.`,
      variant: "default",
      duration: 2000,
    });
  };

  return (
    <PageLayout
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
    >
      <HomeHero onStartAnalysis={handleStartAnalysis} />

      {/* Storage Status Banner - Show when there's stored data or when storage is getting full */}
      {(hasStoredData || storageStats.usagePercentage > 70) && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {hasStoredData ? (
                    storedAnalysis ? (
                      `Previous analysis for "${storedAnalysis.fileName}" is available${!isNewFile ? ' (same file detected)' : ''}`
                    ) : 'Analysis data stored'
                  ) : (
                    `Storage ${storageStats.usagePercentage.toFixed(0)}% full`
                  )}
                </span>
              </div>
              <button
                onClick={() => setShowStorageStatus(!showStorageStatus)}
                className="text-sm text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 underline"
              >
                {showStorageStatus ? 'Hide Details' : 'View Details'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Status Component */}
      {showStorageStatus && (
        <div className="max-w-6xl mx-auto mb-6">
          <Suspense fallback={<div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>}>
            <StorageStatus
              hasStoredData={hasStoredData}
              storedAnalysis={storedAnalysis}
              storageStats={storageStats}
              onClearData={handleClearStoredData}
              onExportAnalysis={handleExportAnalysis}
              onImportAnalysis={handleImportAnalysis}
              onOptimizeStorage={handleOptimizeStorage}
              onShowHistory={() => setShowHistoryModal(true)}
            />
          </Suspense>
        </div>
      )}

      <AnalysisTabs
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        analysisResults={analysisResults}
        onFileSelect={handleFileSelect}
        onAnalysisComplete={handleAnalysisCompleteWithRedirect}
        isRedirecting={isRedirecting}
      />

      {/* Analysis History Modal */}
      <Suspense fallback={null}>
        <AnalysisHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          history={getAnalysisHistory()}
          onRestoreAnalysis={handleRestoreFromHistory}
        />
      </Suspense>

      {/* Floating Chat Bot */}
      <Suspense fallback={null}>
        {analysisResults && <FloatingChatBot analysisResults={analysisResults} />}
      </Suspense>
    </PageLayout>
  );
};

export default Index;
