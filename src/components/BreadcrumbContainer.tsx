"use client";

import React from "react";
import {
  Breadcrumb,
  generateBreadcrumbItems,
  BreadcrumbItem,
} from "./Breadcrumb";
import { useNavigation } from "@/lib/navigation-context";

interface BreadcrumbContainerProps {
  analysisResults?: unknown;
  className?: string;
}

export const BreadcrumbContainer: React.FC<BreadcrumbContainerProps> = ({
  analysisResults,
  className = "",
}) => {
  const { currentSection, currentTab, navigateTo } = useNavigation();

  const handleBreadcrumbNavigate = (item: BreadcrumbItem) => {
    if (item.id === "home") {
      navigateTo("home");
    } else if (item.id === "about") {
      navigateTo("about");
    } else if (item.id === "privacy") {
      navigateTo("privacy");
    } else if (item.id === "terms") {
      navigateTo("terms");
    } else if (item.id === "help") {
      navigateTo("help");
    } else if (
      [
        "upload",
        "ai-config",
        "prompts",
        "results",
        "security",
        "dashboard",
        "history",
      ].includes(item.id)
    ) {
      navigateTo("home", item.id);
    } else if (item.id === "analysis-results") {
      // Stay on current tab if we're already on a results tab
      if (["results", "security", "dashboard"].includes(currentTab)) {
        return;
      }
      navigateTo("home", "results");
    }
  };

  const breadcrumbItems = generateBreadcrumbItems(
    currentSection,
    currentTab,
    analysisResults
  );

  // Only show breadcrumb if not on home section, if we have analysis results, or if we're on help section
  if (
    currentSection === "home" &&
    breadcrumbItems.length <= 1 &&
    !analysisResults
  ) {
    return null;
  }

  return (
    <div
      className={`w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/80 ${className}`}
    >
      <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <Breadcrumb
          items={breadcrumbItems}
          onNavigate={handleBreadcrumbNavigate}
        />
      </div>
    </div>
  );
};
