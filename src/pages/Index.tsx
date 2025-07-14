import { useState, Suspense, lazy } from 'react';

import { PageLayout } from '@/components/layouts/PageLayout';
import { HomeHero } from '@/components/pages/home/HomeHero';
import { AnalysisTabs } from '@/components/pages/home/AnalysisTabs';
import { StorageBanner } from '@/components/pages/home/StorageBanner';
import { useAnalysisHandlers } from '@/components/pages/home/AnalysisHandlers';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useEnhancedAnalysis } from '@/hooks/useEnhancedAnalysis';

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

  const {
    handleAnalysisCompleteWithRedirect,
    handleClearStoredData,
    handleExportAnalysis,
    handleImportAnalysis,
    handleOptimizeStorage,
    handleRestoreFromHistory
  } = useAnalysisHandlers({
    hasStoredData,
    onAnalysisComplete: handleAnalysisComplete,
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
    setCurrentTab('upload');
  };

  return (
    <PageLayout
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
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
