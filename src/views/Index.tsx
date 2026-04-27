import { useState, Suspense, lazy } from "react";

import { PageLayout } from "@/components/layout/PageLayout";
import { HomeHero } from "@/components/pages/home/HomeHero";
import { AnalysisTabs } from "@/components/pages/home/AnalysisTabs";
import { StorageBanner } from "@/components/pages/home/StorageBanner";
import { useAnalysisHandlers } from "@/components/pages/home/AnalysisHandlers";
import { useEnhancedAnalysis } from "@/hooks/useEnhancedAnalysis";

const FloatingChatBot = lazy(() => import("@/components/ai/FloatingChatBot"));
const AnalysisHistoryModal = lazy(
  () => import("@/components/analysis/AnalysisHistoryModal")
);

const Index = () => {
  const [currentTab, setCurrentTab] = useState("upload");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

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

  const { handleAnalysisCompleteWithRedirect, handleRestoreFromHistory } =
    useAnalysisHandlers({
      hasStoredData,
      onAnalysisComplete: (results, file) =>
        handleAnalysisComplete(results, undefined, file),
      onSetCurrentTab: setCurrentTab,
      onSetIsRedirecting: setIsRedirecting,
      onClearStoredData: clearStoredData,
      onExportAnalysis: exportAnalysis,
      onImportAnalysis: importAnalysis,
      onOptimizeStorage: optimizeStorage,
      onRestoreFromHistory: (analysisData) => {
        restoreFromHistory(analysisData);
        setShowHistoryModal(false);
      },
    });

  const handleStartAnalysis = () => {
    setCurrentTab("upload");
  };

  return (
    <PageLayout noContainer={true}>
      <HomeHero onStartAnalysis={handleStartAnalysis} />

      <StorageBanner
        hasStoredData={hasStoredData}
        storedAnalysis={storedAnalysis}
        storageStats={storageStats}
        isNewFile={isNewFile}
      />

      <AnalysisTabs
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        analysisResults={analysisResults}
        onFileSelect={handleFileSelect}
        onAnalysisComplete={handleAnalysisCompleteWithRedirect}
        isRedirecting={isRedirecting}
      />

      {}
      <Suspense fallback={null}>
        <AnalysisHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          history={getAnalysisHistory()}
          onRestoreAnalysis={handleRestoreFromHistory}
        />
      </Suspense>

      {}
      <Suspense fallback={null}>
        {analysisResults && (
          <FloatingChatBot analysisResults={analysisResults} />
        )}
      </Suspense>
    </PageLayout>
  );
};

export default Index;
