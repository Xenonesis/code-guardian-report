import React from 'react';
import { Tabs } from '@/components/ui/tabs';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { TabNavigation } from './TabNavigation';
import { TabContent } from './TabContent';

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
  isRedirecting = false
}) => {
  return (
    <section className="max-w-6xl mx-auto" role="main">
      <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
        <TabNavigation 
          currentTab={currentTab}
          analysisResults={analysisResults}
          isRedirecting={isRedirecting}
        />
        
        <TabContent
          analysisResults={analysisResults}
          onFileSelect={onFileSelect}
          onAnalysisComplete={onAnalysisComplete}
        />
      </Tabs>
    </section>
  );
};

export default AnalysisTabs;
