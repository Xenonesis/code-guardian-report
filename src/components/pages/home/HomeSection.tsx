import { Suspense, lazy, useState, useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { HomeHero } from '@/components/pages/home/HomeHero';
import { AnalysisTabs } from '@/components/pages/home/AnalysisTabs';
import { StorageBanner } from '@/components/pages/home/StorageBanner';
import { useAnalysisHandlers } from '@/components/pages/home/AnalysisHandlers';
import { useEnhancedAnalysis } from '@/hooks/useEnhancedAnalysis';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { useNavigation } from '@/lib/navigation-context';
import { logger } from '@/utils/logger';
import type { Theme } from '@/hooks/useDarkMode';

// Retry wrapper for dynamic imports that may fail during dev server startup
const retryImport = <T,>(importFn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  return new Promise((resolve, reject) => {
    importFn()
      .then(resolve)
      .catch((error) => {
        if (retries > 0) {
          setTimeout(() => {
            retryImport(importFn, retries - 1, delay).then(resolve).catch(reject);
          }, delay);
        } else {
          reject(error);
        }
      });
  });
};

// Lazy load heavy components for better performance with retry logic
const FloatingChatBot = lazy(() => retryImport(() => import('@/components/ai/FloatingChatBot')));
const StorageStatus = lazy(() => import('@/components/firebase/StorageStatus'));
const AnalysisHistoryModal = lazy(() => import('@/components/analysis/AnalysisHistoryModal'));

interface HomeSectionProps {
  theme?: Theme;
}

export const HomeSection: React.FC<HomeSectionProps> = ({ theme = 'system' }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showStorageStatus, setShowStorageStatus] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { currentTab, setCurrentTab, navigateTo } = useNavigation();
  
  const {
    analysisResults,
    hasStoredData,
    isNewFile,
    storedAnalysis,
    storageStats,
    selectedFile,
    handleFileSelect,
    handleAnalysisComplete,
    clearStoredData,
    exportAnalysis,
    importAnalysis,
    getAnalysisHistory,
    optimizeStorage,
    restoreFromHistory,
  } = useEnhancedAnalysis();

  // Create a wrapper that ensures file reference is available
  const [currentAnalysisFile, setCurrentAnalysisFile] = useState<File | null>(null);
  
  const handleFileSelectWithTracking = useCallback((file: File) => {
    logger.debug('🔄 File selected with tracking:', file.name);
    setCurrentAnalysisFile(file);
    handleFileSelect(file);
  }, [handleFileSelect]);
  
  const handleAnalysisCompleteWithFile = useCallback(async (results: AnalysisResults, file?: File) => {
    logger.debug('🔄 Analysis complete with file:', { 
      hasFile: !!file, 
      fileName: file?.name,
      hasCurrentAnalysisFile: !!currentAnalysisFile,
      hasSelectedFile: !!selectedFile 
    });
    
    // Use the file parameter from useFileUpload if available, otherwise use currentAnalysisFile
    const fileToUse = file || currentAnalysisFile;
    
    if (fileToUse) {
      logger.debug('🔄 Storing analysis results with file:', fileToUse.name);
      // Pass the file directly to handleAnalysisComplete to bypass state synchronization issues
      await handleAnalysisComplete(results, undefined, fileToUse);
    } else {
      logger.error('❌ No file available for analysis storage');
      await handleAnalysisComplete(results);
    }
  }, [currentAnalysisFile, selectedFile, handleFileSelect, handleAnalysisComplete]);

  const {
    handleAnalysisCompleteWithRedirect,
    handleClearStoredData,
    handleExportAnalysis,
    handleImportAnalysis,
    handleOptimizeStorage,
    handleRestoreFromHistory
  } = useAnalysisHandlers({
    hasStoredData,
    onAnalysisComplete: handleAnalysisCompleteWithFile,
    onSetCurrentTab: setCurrentTab,
    onSetIsRedirecting: setIsRedirecting,
    onClearStoredData: clearStoredData,
    onExportAnalysis: exportAnalysis,
    onImportAnalysis: importAnalysis,
    onOptimizeStorage: optimizeStorage,
    onRestoreFromHistory: (analysisData) => {
      restoreFromHistory(analysisData);
      setShowHistoryModal(false);
    }
  });

  const handleStartAnalysis = () => {
    navigateTo('home', 'upload');
  };

  return (
    <section id="home" className="min-h-screen">
      <PageLayout
        theme={theme}
        showNavigation={false}
      >
        <HomeHero onStartAnalysis={handleStartAnalysis} />

        <StorageBanner
          hasStoredData={hasStoredData}
          storedAnalysis={storedAnalysis}
          storageStats={storageStats}
          isNewFile={isNewFile}
          showStorageStatus={showStorageStatus}
          onToggleStorageStatus={() => setShowStorageStatus(!showStorageStatus)}
        />

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
          onFileSelect={handleFileSelectWithTracking}
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
    </section>
  );
};

export default HomeSection;
