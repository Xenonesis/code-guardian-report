import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { useMobile } from '@/hooks/useMobile';

interface TabNavigationProps {
  currentTab: string;
  analysisResults: AnalysisResults | null;
  isRedirecting?: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  currentTab,
  analysisResults,
  isRedirecting = false
}) => {
  const { isMobile, isSmallMobile } = useMobile();

  return (
    <TabsList
      className="flex w-full gap-1 mb-4 sm:mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-lg sm:shadow-xl rounded-xl overflow-x-auto overflow-y-hidden relative animate-fade-in p-1 touch-manipulation"
      role="tablist"
      aria-label="Main navigation tabs"
    >
      <TabsTrigger
        value="upload"
        className="relative flex items-center justify-center py-2.5 sm:py-2 lg:py-3 px-3 sm:px-4 lg:px-5 text-xs sm:text-sm lg:text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md sm:data-[state=active]:shadow-lg transition-all duration-300 focus-ring hover-lift z-10 rounded-lg min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] touch-manipulation"
        role="tab"
        aria-controls="upload-panel"
        aria-selected={currentTab === 'upload'}
      >
        <span className="text-center whitespace-nowrap">Upload Code</span>
      </TabsTrigger>

      <TabsTrigger
        value="ai-config"
        className="relative flex items-center justify-center py-2.5 sm:py-2 lg:py-3 px-3 sm:px-4 lg:px-5 text-xs sm:text-sm lg:text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md sm:data-[state=active]:shadow-lg transition-all duration-300 focus-ring hover-lift z-10 rounded-lg min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] touch-manipulation"
        role="tab"
        aria-controls="ai-config-panel"
        aria-selected={currentTab === 'ai-config'}
      >
        <span className="text-center whitespace-nowrap">AI Config</span>
      </TabsTrigger>

      <TabsTrigger
        value="prompts"
        className="relative flex items-center justify-center py-2.5 sm:py-2 lg:py-3 px-3 sm:px-4 lg:px-5 text-xs sm:text-sm lg:text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md sm:data-[state=active]:shadow-lg transition-all duration-300 focus-ring hover-lift z-10 rounded-lg min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] touch-manipulation"
        role="tab"
        aria-controls="prompts-panel"
        aria-selected={currentTab === 'prompts'}
      >
        <span className="text-center whitespace-nowrap">Prompts</span>
      </TabsTrigger>

      <TabsTrigger
        value="results"
        className={`relative flex items-center justify-center py-2.5 sm:py-2 lg:py-3 px-3 sm:px-4 lg:px-5 text-xs sm:text-sm lg:text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md sm:data-[state=active]:shadow-lg transition-all duration-300 focus-ring disabled:opacity-50 disabled:cursor-not-allowed hover-lift z-10 rounded-lg min-w-[80px] sm:min-w-[100px] lg:min-w-[120px] touch-manipulation ${
          isRedirecting ? 'animate-pulse bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30' : ''
        }`}
        disabled={!analysisResults}
        role="tab"
        aria-controls="results-panel"
        aria-selected={currentTab === 'results'}
        aria-disabled={!analysisResults}
      >
        <span className="text-center whitespace-nowrap">
          {isRedirecting ? 'Loading...' : 'Results'}
        </span>
      </TabsTrigger>
    </TabsList>
  );
};