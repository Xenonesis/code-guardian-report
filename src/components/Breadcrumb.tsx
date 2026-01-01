import React from "react";
import {
  ChevronRight,
  Home,
  Info,
  Lock,
  Award,
  FileText,
  Search,
  Settings,
  HelpCircle,
  History,
  BarChart3,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (item: BreadcrumbItem) => void;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  onNavigate,
  className = "",
}) => {
  if (items.length === 0) return null;

  return (
    <nav
      className={cn(
        "flex items-center space-x-1 text-sm font-medium text-slate-600 dark:text-slate-400",
        className
      )}
      aria-label="Breadcrumb navigation"
    >
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          )}
          <button
            onClick={() => onNavigate(item)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800",
              index === items.length - 1
                ? "text-blue-600 dark:text-blue-400 font-semibold cursor-default hover:bg-transparent"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
            disabled={index === items.length - 1}
            aria-current={index === items.length - 1 ? "page" : undefined}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span className="truncate">{item.label}</span>
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

// Utility function to generate breadcrumb items based on current section and tab
export const generateBreadcrumbItems = (
  currentSection: string,
  currentTab?: string,
  analysisResults?: any
): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [];

  // Add home as the first item
  items.push({
    id: "home",
    label: "Home",
    icon: <Home className="h-4 w-4" />,
  });

  // Add section-specific items
  switch (currentSection) {
    case "home":
      if (currentTab) {
        const tabLabels: Record<string, string> = {
          upload: "Upload Code",
          "ai-config": "AI Configuration",
          prompts: "Custom Prompts",
          results: "Analysis Results",
          security: "Security Report",
          dashboard: "Analytics Dashboard",
        };

        const tabIcons: Record<string, React.ReactNode> = {
          upload: <FileText className="h-4 w-4" />,
          "ai-config": <Settings className="h-4 w-4" />,
          prompts: <Search className="h-4 w-4" />,
          results: <FileText className="h-4 w-4" />,
          security: <Shield className="h-4 w-4" />,
          dashboard: <BarChart3 className="h-4 w-4" />,
          history: <History className="h-4 w-4" />,
        };

        items.push({
          id: currentTab,
          label: tabLabels[currentTab] || currentTab,
          icon: tabIcons[currentTab],
        });

        // Add results-specific breadcrumb if we have analysis results
        if (
          analysisResults &&
          (currentTab === "results" ||
            currentTab === "security" ||
            currentTab === "dashboard")
        ) {
          items.push({
            id: "analysis-results",
            label: "Scan Report",
            icon: <FileText className="h-4 w-4" />,
          });
        }
      }
      break;
    case "about":
      items.push({
        id: "about",
        label: "About",
        icon: <Info className="h-4 w-4" />,
      });
      break;
    case "privacy":
      items.push({
        id: "privacy",
        label: "Privacy Policy",
        icon: <Lock className="h-4 w-4" />,
      });
      break;
    case "terms":
      items.push({
        id: "terms",
        label: "Terms of Service",
        icon: <Award className="h-4 w-4" />,
      });
      break;
    case "help":
      items.push({
        id: "help",
        label: "Help & Documentation",
        icon: <HelpCircle className="h-4 w-4" />,
      });
      break;
  }

  return items;
};
