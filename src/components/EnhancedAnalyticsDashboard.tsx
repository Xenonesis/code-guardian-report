import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Download,
  Activity,
  Target,
  Zap,
  FileText,
} from "lucide-react";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { SeverityChart } from "@/components/dashboard/charts/SeverityChart";
import { TypeChart } from "@/components/dashboard/charts/TypeChart";
import { FileComplexityChart } from "@/components/dashboard/charts/FileComplexityChart";
import { RiskAssessment } from "@/components/dashboard/RiskAssessment";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { SecurityIssue } from "@/hooks/useAnalysis";

// Legacy Issue type for backward compatibility
interface _Issue {
  severity: "Critical" | "High" | "Medium" | "Low";
  type: "Security" | "Bug" | "Code Smell" | "Vulnerability";
  file: string;
  line: number;
  description: string;
  tool?: string;
  timestamp?: string;
}

interface EnhancedAnalyticsDashboardProps {
  issues: SecurityIssue[];
  totalFiles?: number;
  analysisTime?: string;
}

const EnhancedAnalyticsDashboard: React.FC<EnhancedAnalyticsDashboardProps> = ({
  issues,
  totalFiles,
  analysisTime,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeframe, setTimeframe] = useState("7d");

  const {
    severityData,
    typeData,
    fileComplexityData,
    riskMetrics,
    performanceData,
  } = useAnalyticsData(issues, totalFiles || 0);

  if (issues.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 w-fit rounded-full bg-gradient-to-r from-green-500 to-emerald-600 p-2.5 sm:p-3">
            <Shield className="h-6 w-6 text-white sm:h-8 sm:w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900 sm:text-xl dark:text-white">
            Excellent Code Quality!
          </h3>
          <p className="text-sm text-slate-600 sm:text-base dark:text-slate-300">
            No issues found in your code analysis. Keep up the great work!
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center sm:mt-6 sm:gap-4">
            <div>
              <p className="text-xl font-bold text-green-600 sm:text-2xl">
                100%
              </p>
              <p className="text-xs text-slate-500 sm:text-sm">Quality Score</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-600 sm:text-2xl">
                {totalFiles}
              </p>
              <p className="text-xs text-slate-500 sm:text-sm">Files Clean</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-600 sm:text-2xl">
                {analysisTime}
              </p>
              <p className="text-xs text-slate-500 sm:text-sm">Analysis Time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="w-full sm:w-auto">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
            Analytics Dashboard
          </h2>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm dark:text-slate-400">
            Comprehensive analysis of {issues.length} issues across {totalFiles}{" "}
            files
          </p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="h-9 w-28 text-sm sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 text-sm">
            <Download className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="xs:inline hidden">Export</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 grid h-auto w-full grid-cols-2 sm:mb-6 sm:grid-cols-4">
          <TabsTrigger
            value="overview"
            className="py-2 text-xs sm:py-2.5 sm:text-sm"
          >
            <Activity className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="xs:inline hidden">Overview</span>
            <span className="xs:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger
            value="files"
            className="py-2 text-xs sm:py-2.5 sm:text-sm"
          >
            <FileText className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
            Files
          </TabsTrigger>
          <TabsTrigger
            value="risk"
            className="py-2 text-xs sm:py-2.5 sm:text-sm"
          >
            <Target className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
            Risk
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="py-2 text-xs sm:py-2.5 sm:text-sm"
          >
            <Zap className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="xs:inline hidden">Performance</span>
            <span className="xs:hidden">Perf</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <MetricsCards
            totalIssues={issues.length}
            criticalIssues={riskMetrics.criticalIssues}
            securityIssues={riskMetrics.securityIssues}
            codeQuality={riskMetrics.codeQuality}
          />

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <SeverityChart data={severityData} />
            <TypeChart data={typeData} />
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-4 sm:space-y-6">
          <FileComplexityChart data={fileComplexityData} />
        </TabsContent>

        <TabsContent value="risk" className="space-y-4 sm:space-y-6">
          <RiskAssessment metrics={riskMetrics} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4 sm:space-y-6">
          <PerformanceMetrics data={performanceData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;
