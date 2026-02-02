import React from "react";
import { UploadCloud, Sliders, MessageSquare, BarChart3 } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisResults } from "@/hooks/useAnalysis";

interface TabNavigationProps {
  currentTab: string;
  analysisResults: AnalysisResults | null;
  isRedirecting?: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  currentTab,
  analysisResults,
  isRedirecting = false,
}) => {
  return (
    <TabsList
      className="animate-fade-in xs:gap-2 xs:py-3 xs:px-4 relative mb-4 flex w-full snap-x snap-mandatory flex-nowrap gap-2 overflow-x-auto overflow-y-hidden scroll-smooth rounded-xl border border-slate-200/60 bg-white/80 px-2 py-2 shadow-lg shadow-slate-900/5 backdrop-blur-xl sm:mb-6 sm:justify-center sm:gap-3 sm:rounded-2xl sm:px-8 sm:pr-6 sm:pl-5 dark:border-slate-700/40 dark:bg-slate-900/80 dark:shadow-black/20"
      style={{ scrollPaddingInline: "1rem" }}
      role="tablist"
      aria-label="Main navigation tabs"
    >
      <TabsTrigger
        value="upload"
        className="relative z-10 flex min-w-[56px] flex-shrink-0 snap-start items-center justify-center gap-0 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-300 hover:bg-slate-100/80 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 sm:min-w-[120px] sm:gap-2 sm:px-5 sm:text-base dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
        role="tab"
        aria-controls="upload-panel"
        aria-selected={currentTab === "upload"}
        aria-label="Upload Code"
      >
        <UploadCloud className="mr-0 h-5 w-5 sm:mr-1.5" aria-hidden="true" />
        <span className="hidden text-center whitespace-nowrap sm:inline">
          Upload Code
        </span>
      </TabsTrigger>

      <TabsTrigger
        value="ai-config"
        className="relative z-10 flex min-w-[56px] flex-shrink-0 snap-start items-center justify-center gap-0 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-300 hover:bg-slate-100/80 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/25 sm:min-w-[120px] sm:gap-2 sm:px-5 sm:text-base dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
        role="tab"
        aria-controls="ai-config-panel"
        aria-selected={currentTab === "ai-config"}
        aria-label="AI Config"
      >
        <Sliders className="mr-0 h-5 w-5 sm:mr-1.5" aria-hidden="true" />
        <span className="hidden text-center whitespace-nowrap sm:inline">
          AI Config
        </span>
      </TabsTrigger>

      <TabsTrigger
        value="prompts"
        className="relative z-10 flex min-w-[56px] flex-shrink-0 snap-start items-center justify-center gap-0 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-300 hover:bg-slate-100/80 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/25 sm:min-w-[120px] sm:gap-2 sm:px-5 sm:text-base dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
        role="tab"
        aria-controls="prompts-panel"
        aria-selected={currentTab === "prompts"}
        aria-label="Prompts"
      >
        <MessageSquare className="mr-0 h-5 w-5 sm:mr-1.5" aria-hidden="true" />
        <span className="hidden text-center whitespace-nowrap sm:inline">
          Prompts
        </span>
      </TabsTrigger>

      <TabsTrigger
        value="results"
        className={`relative z-10 flex min-w-[56px] flex-shrink-0 snap-start items-center justify-center gap-0 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-300 hover:bg-slate-100/80 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 sm:min-w-[120px] sm:gap-2 sm:px-5 sm:text-base dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white ${
          isRedirecting
            ? "animate-pulse bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
            : ""
        }`}
        disabled={!analysisResults}
        role="tab"
        aria-controls="results-panel"
        aria-selected={currentTab === "results"}
        aria-disabled={!analysisResults}
        aria-label="Results"
      >
        <BarChart3 className="mr-0 h-5 w-5 sm:mr-1.5" aria-hidden="true" />
        <span className="hidden text-center whitespace-nowrap sm:inline">
          {isRedirecting ? "Loading..." : "Results"}
        </span>
      </TabsTrigger>
    </TabsList>
  );
};
