import React from 'react';
import { UploadCloud, Sliders, MessageSquare, BarChart3 } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisResults } from '@/hooks/useAnalysis';

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
  return (
    <TabsList
      className="flex w-full gap-1 sm:gap-2 pl-3 pr-4 sm:px-10 py-1.5 mb-4 sm:mb-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg sm:shadow-xl rounded-2xl overflow-x-auto overflow-y-hidden relative animate-fade-in flex-nowrap scroll-smooth snap-x snap-mandatory sm:justify-center"
      style={{ scrollPaddingInline: '1.5rem' }}
      role="tablist"
      aria-label="Main navigation tabs"
    >
      <TabsTrigger
        value="upload"
        className="relative flex items-center justify-center gap-0 sm:gap-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:shadow-lg transition-all duration-300 focus-ring hover-lift z-10 rounded-full min-w-[56px] sm:min-w-[110px] flex-shrink-0 snap-start"
        role="tab"
        aria-controls="upload-panel"
        aria-selected={currentTab === 'upload'}
        aria-label="Upload Code"
      >
        <UploadCloud className="h-4 w-4 mr-0 sm:mr-1" aria-hidden="true" />
        <span className="hidden sm:inline text-center whitespace-nowrap">Upload Code</span>
      </TabsTrigger>


      <TabsTrigger
        value="ai-config"
        className="relative flex items-center justify-center gap-0 sm:gap-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:shadow-lg transition-all duration-300 focus-ring hover-lift z-10 rounded-full min-w-[56px] sm:min-w-[110px] flex-shrink-0 snap-start"
        role="tab"
        aria-controls="ai-config-panel"
        aria-selected={currentTab === 'ai-config'}
        aria-label="AI Config"
      >
        <Sliders className="h-4 w-4 mr-0 sm:mr-1" aria-hidden="true" />
        <span className="hidden sm:inline text-center whitespace-nowrap">AI Config</span>
      </TabsTrigger>

      <TabsTrigger
        value="prompts"
        className="relative flex items-center justify-center gap-0 sm:gap-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:shadow-lg transition-all duration-300 focus-ring hover-lift z-10 rounded-full min-w-[56px] sm:min-w-[110px] flex-shrink-0 snap-start"
        role="tab"
        aria-controls="prompts-panel"
        aria-selected={currentTab === 'prompts'}
        aria-label="Prompts"
      >
        <MessageSquare className="h-4 w-4 mr-0 sm:mr-1" aria-hidden="true" />
        <span className="hidden sm:inline text-center whitespace-nowrap">Prompts</span>
      </TabsTrigger>

      <TabsTrigger
        value="results"
        className={`relative flex items-center justify-center gap-0 sm:gap-1 py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:shadow-lg transition-all duration-300 focus-ring disabled:opacity-70 disabled:cursor-not-allowed hover-lift z-10 rounded-full min-w-[56px] sm:min-w-[110px] flex-shrink-0 snap-start ${
          isRedirecting ? 'animate-pulse bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30' : ''
        }`}
        disabled={!analysisResults}
        role="tab"
        aria-controls="results-panel"
        aria-selected={currentTab === 'results'}
        aria-disabled={!analysisResults}
        aria-label="Results"
      >
        <BarChart3 className="h-4 w-4 mr-0 sm:mr-1" aria-hidden="true" />
        <span className="hidden sm:inline text-center whitespace-nowrap">
          {isRedirecting ? 'Loading...' : 'Results'}
        </span>
      </TabsTrigger>
    </TabsList>
  );
};