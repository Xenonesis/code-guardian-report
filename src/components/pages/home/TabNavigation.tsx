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
      className="animate-fade-in border-border bg-card/90 relative mb-4 flex w-full snap-x snap-mandatory flex-nowrap gap-2 overflow-x-auto overflow-y-hidden scroll-smooth rounded-2xl border py-4 pr-6 pl-5 shadow-lg backdrop-blur-sm sm:mb-6 sm:justify-center sm:gap-3 sm:px-12 sm:shadow-xl"
      style={{ scrollPaddingInline: "1.5rem" }}
      role="tablist"
      aria-label="Main navigation tabs"
    >
      <TabsTrigger
        value="upload"
        className="focus-ring hover-lift relative z-10 flex min-w-[64px] flex-shrink-0 snap-start items-center justify-center gap-0 rounded-full px-4 py-3 text-sm font-semibold text-slate-600 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg sm:min-w-[130px] sm:gap-2 sm:px-6 sm:text-base dark:text-slate-300"
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
        className="focus-ring hover-lift relative z-10 flex min-w-[64px] flex-shrink-0 snap-start items-center justify-center gap-0 rounded-full px-4 py-3 text-sm font-semibold text-slate-600 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg sm:min-w-[130px] sm:gap-2 sm:px-6 sm:text-base dark:text-slate-300"
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
        className="focus-ring hover-lift relative z-10 flex min-w-[64px] flex-shrink-0 snap-start items-center justify-center gap-0 rounded-full px-4 py-3 text-sm font-semibold text-slate-600 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg sm:min-w-[130px] sm:gap-2 sm:px-6 sm:text-base dark:text-slate-300"
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
        className={`focus-ring hover-lift relative z-10 flex min-w-[64px] flex-shrink-0 snap-start items-center justify-center gap-0 rounded-full px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg sm:min-w-[130px] sm:gap-2 sm:px-6 sm:text-base dark:text-slate-200 ${
          isRedirecting
            ? "animate-pulse bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30"
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
