import React from 'react';
import { FileCode, Bot, Shield, Wand2 } from 'lucide-react';
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
      className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-0 mb-6 sm:mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-xl rounded-xl overflow-hidden relative animate-fade-in p-1"
      role="tablist"
      aria-label="Main navigation tabs"
    >
      <TabsTrigger
        value="upload"
        className="relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-2 text-xs sm:text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 focus-ring hover-lift z-10 rounded-lg"
        role="tab"
        aria-controls="upload-panel"
        aria-selected={currentTab === 'upload'}
      >
        <FileCode className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span className="text-center leading-tight">Upload Code</span>
      </TabsTrigger>

      <TabsTrigger
        value="ai-config"
        className="relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-2 text-xs sm:text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 focus-ring hover-lift z-10 rounded-lg"
        role="tab"
        aria-controls="ai-config-panel"
        aria-selected={currentTab === 'ai-config'}
      >
        <Bot className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span className="text-center leading-tight">AI Config</span>
      </TabsTrigger>

      <TabsTrigger
        value="prompts"
        className="relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-2 text-xs sm:text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 focus-ring hover-lift z-10 rounded-lg"
        role="tab"
        aria-controls="prompts-panel"
        aria-selected={currentTab === 'prompts'}
      >
        <Wand2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span className="text-center leading-tight">Prompts</span>
      </TabsTrigger>

      <TabsTrigger
        value="results"
        className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-2 text-xs sm:text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 focus-ring disabled:opacity-50 disabled:cursor-not-allowed hover-lift z-10 rounded-lg ${
          isRedirecting ? 'animate-pulse bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30' : ''
        }`}
        disabled={!analysisResults}
        role="tab"
        aria-controls="results-panel"
        aria-selected={currentTab === 'results'}
        aria-disabled={!analysisResults}
      >
        <Shield className={`h-4 w-4 flex-shrink-0 ${isRedirecting ? 'animate-spin' : ''}`} aria-hidden="true" />
        <span className="text-center leading-tight">
          {isRedirecting ? 'Loading...' : 'Results'}
        </span>
      </TabsTrigger>
    </TabsList>
  );
};