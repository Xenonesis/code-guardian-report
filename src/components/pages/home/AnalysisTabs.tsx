import React from "react";
import { Tabs } from "@/components/ui/tabs";
import { AnalysisResults } from "@/hooks/useAnalysis";
import { TabNavigation } from "./TabNavigation";
import { TabContent } from "./TabContent";

interface AnalysisTabsProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  analysisResults: AnalysisResults | null;
  onFileSelect: (file: File) => void;
  onAnalysisComplete: (results: AnalysisResults) => void;
  isRedirecting?: boolean;
}

export const AnalysisTabs: React.FC<AnalysisTabsProps> = ({
  currentTab,
  onTabChange,
  analysisResults,
  onFileSelect,
  onAnalysisComplete,
  isRedirecting = false,
}) => {
  return (
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-8" role="main">
      <Tabs
        value={currentTab}
        onValueChange={onTabChange}
        className="flex w-full flex-col gap-4 sm:gap-6"
        orientation="horizontal"
      >
        <div className="w-full overflow-x-auto overflow-y-hidden pb-2 sm:pb-0">
          <TabNavigation
            currentTab={currentTab}
            analysisResults={analysisResults}
            isRedirecting={isRedirecting}
          />
        </div>

        <div className="w-full rounded-xl border bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6 dark:bg-slate-800/80">
          <TabContent
            analysisResults={analysisResults}
            onFileSelect={onFileSelect}
            onAnalysisComplete={onAnalysisComplete}
          />
        </div>
      </Tabs>
    </section>
  );
};

export default AnalysisTabs;
