import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, AreaChart, Area, LineChart, Line, ScatterPlot, Scatter } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, AlertTriangle, Shield, Bug, Code, FileText, Calendar, Filter, Download, Activity, Target, Zap } from 'lucide-react';

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
  const [selectedMetric, setSelectedMetric] = useState('issues');

  // Enhanced color schemes
  const severityColors = {
    Critical: '#dc2626',
    High: '#ea580c',
    Medium: '#d97706',
    Low: '#65a30d'
  };

  const typeColors = {
    Security: '#dc2626',
    Bug: '#ea580c',
    Vulnerability: '#d97706',
    'Code Smell': '#65a30d'
  };

  // Enhanced data processing
  const severityData = useMemo(() => {
    const counts = issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([severity, count]) => ({
      severity,
      count,
      percentage: ((count / issues.length) * 100).toFixed(1),
      fill: severityColors[severity as keyof typeof severityColors]
    }));
  }, [issues]);

  const typeData = useMemo(() => {
    const counts = issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      percentage: ((count / issues.length) * 100).toFixed(1),
      fill: typeColors[type as keyof typeof typeColors]
    }));
  }, [issues]);

  // File complexity analysis
  const fileComplexityData = useMemo(() => {
    const fileStats = issues.reduce((acc, issue) => {
      const fileName = issue.file.split('/').pop() || issue.file;
      if (!acc[fileName]) {
        acc[fileName] = { 
          file: fileName, 
          issues: 0, 
          lines: new Set(), 
          severities: { Critical: 0, High: 0, Medium: 0, Low: 0 }
        };
      }
      acc[fileName].issues++;
      acc[fileName].lines.add(issue.line);
      acc[fileName].severities[issue.severity]++;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(fileStats)
      .map((item: any) => ({
        file: item.file.length > 15 ? item.file.substring(0, 12) + '...' : item.file,
        fullFile: item.file,
        issues: item.issues,
        linesAffected: item.lines.size,
        complexity: Math.round((item.issues / item.lines.size) * 10) / 10,
        riskScore: (item.severities.Critical * 4 + item.severities.High * 3 + item.severities.Medium * 2 + item.severities.Low * 1)
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);
  }, [issues]);

  // Trend simulation (in real app, this would come from historical data)
  const trendData = useMemo(() => {
    const days = timeframe === '30d' ? 30 : timeframe === '7d' ? 7 : 1;
    return Array.from({ length: days }, (_, i) => ({
      date: `Day ${i + 1}`,
      issues: Math.floor(Math.random() * (issues.length / 2)) + Math.floor(issues.length / 4),
      resolved: Math.floor(Math.random() * 15) + 5,
      critical: Math.floor(Math.random() * 5),
      high: Math.floor(Math.random() * 10) + 2,
      medium: Math.floor(Math.random() * 15) + 5,
      low: Math.floor(Math.random() * 20) + 10
    }));
  }, [issues.length, timeframe]);

  // Risk assessment metrics
  const riskMetrics = useMemo(() => {
    const criticalIssues = issues.filter(i => i.severity === 'Critical').length;
    const securityIssues = issues.filter(i => i.type === 'Security').length;
    const vulnerabilities = issues.filter(i => i.type === 'Vulnerability').length;
    
    const overallRisk = Math.min(100, Math.round(
      (criticalIssues * 25 + securityIssues * 20 + vulnerabilities * 15 + issues.length * 2) / 10
    ));

    return {
      overallRisk,
      criticalIssues,
      securityIssues,
      vulnerabilities,
      codeQuality: Math.max(0, 100 - (issues.filter(i => i.type === 'Code Smell').length * 5)),
      maintainability: Math.max(0, 100 - Math.round((issues.length / totalFiles) * 10)),
      technicalDebt: Math.min(100, Math.round((issues.length / totalFiles) * 15))
    };
  }, [issues, totalFiles]);

  // Performance metrics
  const performanceData = useMemo(() => [
    { metric: 'Code Quality', value: riskMetrics.codeQuality, target: 85 },
    { metric: 'Security', value: Math.max(0, 100 - (riskMetrics.securityIssues * 10)), target: 95 },
    { metric: 'Maintainability', value: riskMetrics.maintainability, target: 80 },
    { metric: 'Technical Debt', value: Math.max(0, 100 - riskMetrics.technicalDebt), target: 70 }
  ], [riskMetrics]);

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
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 card-hover">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-blue-800 dark:text-blue-200">
                      {issues.length}
                    </p>
                    <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">Total Issues</p>
                  </div>
                  <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800 card-hover">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-red-800 dark:text-red-200">
                      {riskMetrics.criticalIssues}
                    </p>
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">Critical</p>
                  </div>
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800 card-hover">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-amber-800 dark:text-amber-200">
                      {riskMetrics.securityIssues}
                    </p>
                    <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">Security</p>
                  </div>
                  <Bug className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600 dark:text-amber-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 card-hover">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-green-800 dark:text-green-200">
                      {riskMetrics.codeQuality}%
                    </p>
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">Quality</p>
                  </div>
                  <Code className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Severity Distribution */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Severity Distribution
                </CardTitle>
                <CardDescription>Issues breakdown by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ severity, percentage }) => `${severity}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Issue Type Distribution */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Issue Type Distribution
                </CardTitle>
                <CardDescription>Breakdown by issue category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Issue Trends Over Time
              </CardTitle>
              <CardDescription>Historical view of issues and resolutions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="issues" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="resolved" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                File Complexity Analysis
              </CardTitle>
              <CardDescription>Files ranked by issue complexity and risk</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={fileComplexityData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="file" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="riskScore" fill="#ef4444" name="Risk Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-600" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Overall project risk evaluation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-600 mb-2">
                      {riskMetrics.overallRisk}%
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">Overall Risk Score</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Critical Issues</span>
                      <Badge variant="destructive">{riskMetrics.criticalIssues}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Security Issues</span>
                      <Badge variant="destructive">{riskMetrics.securityIssues}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Technical Debt</span>
                      <Badge variant="secondary">{riskMetrics.technicalDebt}%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Risk Mitigation</CardTitle>
                <CardDescription>Recommended actions to reduce risk</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="font-medium text-red-800 dark:text-red-200">High Priority</h4>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Address {riskMetrics.criticalIssues} critical issues immediately
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h4 className="font-medium text-amber-800 dark:text-amber-200">Medium Priority</h4>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Review {riskMetrics.securityIssues} security vulnerabilities
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Low Priority</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Improve code quality and reduce technical debt
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Performance Metrics
              </CardTitle>
              <CardDescription>Code quality and maintainability scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" name="Current Score" />
                  <Bar dataKey="target" fill="#10b981" name="Target Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;
