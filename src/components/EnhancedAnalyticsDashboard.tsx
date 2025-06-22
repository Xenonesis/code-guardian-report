import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Download, Activity, Target, Zap, TrendingUp, FileText } from 'lucide-react';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { SeverityChart } from '@/components/dashboard/charts/SeverityChart';
import { TypeChart } from '@/components/dashboard/charts/TypeChart';
import { TrendChart } from '@/components/dashboard/charts/TrendChart';
import { FileComplexityChart } from '@/components/dashboard/charts/FileComplexityChart';
import { RiskAssessment } from '@/components/dashboard/RiskAssessment';
import { PerformanceMetrics } from '@/components/dashboard/PerformanceMetrics';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

interface Issue {
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  type: 'Security' | 'Bug' | 'Code Smell' | 'Vulnerability';
  file: string;
  line: number;
  description: string;
  tool?: string;
  timestamp?: string;
}

interface EnhancedAnalyticsDashboardProps {
  issues: Issue[];
  totalFiles: number;
  analysisTime: string;
}

const EnhancedAnalyticsDashboard: React.FC<EnhancedAnalyticsDashboardProps> = ({ 
  issues, 
  totalFiles, 
  analysisTime 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('7d');
  
  const {
    severityData,
    typeData,
    fileComplexityData,
    trendData,
    riskMetrics,
    performanceData
  } = useAnalyticsData(issues, totalFiles);

  if (issues.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="p-8 text-center">
          <div className="mb-4 p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full w-fit mx-auto">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Excellent Code Quality!
          </h3>
          <p className="text-slate-600 dark:text-slate-300">
            No issues found in your code analysis. Keep up the great work!
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">100%</p>
              <p className="text-sm text-slate-500">Quality Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{totalFiles}</p>
              <p className="text-sm text-slate-500">Files Clean</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{analysisTime}</p>
              <p className="text-sm text-slate-500">Analysis Time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Comprehensive analysis of {issues.length} issues across {totalFiles} files
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-6">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <Activity className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Trends</span>
            <span className="sm:hidden">Trend</span>
          </TabsTrigger>
          <TabsTrigger value="files" className="text-xs sm:text-sm">
            <FileText className="h-4 w-4 mr-1 sm:mr-2" />
            Files
          </TabsTrigger>
          <TabsTrigger value="risk" className="text-xs sm:text-sm">
            <Target className="h-4 w-4 mr-1 sm:mr-2" />
            Risk
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm">
            <Zap className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Performance</span>
            <span className="sm:hidden">Perf</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MetricsCards
            totalIssues={issues.length}
            criticalIssues={riskMetrics.criticalIssues}
            securityIssues={riskMetrics.securityIssues}
            codeQuality={riskMetrics.codeQuality}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SeverityChart data={severityData} />
            <TypeChart data={typeData} />
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <TrendChart data={trendData} />
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <FileComplexityChart data={fileComplexityData} />
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <RiskAssessment metrics={riskMetrics} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceMetrics data={performanceData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;
