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
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="mb-4 p-2.5 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full w-fit mx-auto">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Excellent Code Quality!
          </h3>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            No issues found in your code analysis. Keep up the great work!
          </p>
          <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-3 sm:gap-4 text-center">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                100%
              </p>
              <p className="text-xs sm:text-sm text-slate-500">Quality Score</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {totalFiles}
              </p>
              <p className="text-xs sm:text-sm text-slate-500">Files Clean</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {analysisTime}
              </p>
              <p className="text-xs sm:text-sm text-slate-500">Analysis Time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Analytics Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Comprehensive analysis of {issues.length} issues across {totalFiles}{" "}
            files
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-28 sm:w-32 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 text-sm">
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Export</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 sm:mb-6 h-auto">
          <TabsTrigger
            value="overview"
            className="text-xs sm:text-sm py-2 sm:py-2.5"
          >
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Overview</span>
            <span className="xs:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger
            value="files"
            className="text-xs sm:text-sm py-2 sm:py-2.5"
          >
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Files
          </TabsTrigger>
          <TabsTrigger
            value="risk"
            className="text-xs sm:text-sm py-2 sm:py-2.5"
          >
            <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Risk
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="text-xs sm:text-sm py-2 sm:py-2.5"
          >
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Performance</span>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
