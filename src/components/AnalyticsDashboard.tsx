
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, AreaChart, Area, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrendingUp, AlertTriangle, Shield, Bug, Code, FileText, Calendar, Filter, Download } from 'lucide-react';

interface Issue {
  severity: 'High' | 'Medium' | 'Low';
  type: string;
  filename: string;
  tool: string;
}

interface AnalyticsDashboardProps {
  issues: Issue[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ issues }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);

  // Enhanced data processing with memoization
  const severityData = useMemo(() => [
    { name: 'High', value: issues.filter(i => i.severity === 'High').length, color: '#dc2626' },
    { name: 'Medium', value: issues.filter(i => i.severity === 'Medium').length, color: '#f59e0b' },
    { name: 'Low', value: issues.filter(i => i.severity === 'Low').length, color: '#3b82f6' },
  ].filter(item => item.value > 0), [issues]);

  const typeData = useMemo(() => [
    { name: 'Security', value: issues.filter(i => i.type?.toLowerCase() === 'security').length, color: '#ef4444' },
    { name: 'Bug', value: issues.filter(i => i.type?.toLowerCase() === 'bug').length, color: '#f97316' },
    { name: 'Code Smell', value: issues.filter(i => i.type?.toLowerCase() === 'code smell').length, color: '#84cc16' },
    { name: 'Other', value: issues.filter(i => !['security', 'bug', 'code smell'].includes(i.type?.toLowerCase() || '')).length, color: '#6b7280' },
  ].filter(item => item.value > 0), [issues]);

  // Tool usage statistics
  const toolData = useMemo(() => Object.entries(
    issues.reduce((acc, issue) => {
      acc[issue.tool] = (acc[issue.tool] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([tool, count]) => ({ tool, issues: count })), [issues]);

  // File impact analysis (top 10 files with most issues)
  const fileData = useMemo(() => {
    if (!issues || issues.length === 0) {
      return [];
    }

    const fileIssueMap = issues.reduce((acc, issue) => {
      // Handle both 'filename' and 'file' properties for compatibility
      const filePath = issue.filename || issue.file || 'Unknown file';
      const fileName = filePath.split('/').pop() || filePath;
      acc[fileName] = (acc[fileName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(fileIssueMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([file, count]) => ({
        file: file.length > 25 ? file.substring(0, 22) + '...' : file,
        fullFile: file,
        issues: count,
        // Add display name for better chart readability
        displayName: file.length > 15 ? file.substring(0, 12) + '...' : file
      }));
  }, [issues]);

  // Enhanced analytics data
  const trendData = useMemo(() => {
    // Simulate trend data - in real app this would come from historical data
    const days = 7;
    return Array.from({ length: days }, (_, i) => ({
      day: `Day ${i + 1}`,
      issues: Math.floor(Math.random() * issues.length) + 1,
      resolved: Math.floor(Math.random() * 10),
    }));
  }, [issues.length]);

  const complexityData = useMemo(() => {
    return fileData.slice(0, 5).map(file => ({
      file: file.file,
      complexity: Math.floor(Math.random() * 10) + 1,
      maintainability: Math.floor(Math.random() * 100) + 1,
      issues: file.issues
    }));
  }, [fileData]);

  // Risk score calculation
  const riskScore = Math.round(
    (issues.filter(i => i.severity === 'High').length * 10 +
     issues.filter(i => i.severity === 'Medium').length * 5 +
     issues.filter(i => i.severity === 'Low').length * 1) / Math.max(issues.length, 1)
  );

  const riskData = [{ name: 'Risk Score', value: riskScore, fullMark: 10 }];

  const getRiskColor = (score: number) => {
    if (score >= 8) return 'text-red-600 dark:text-red-400';
    if (score >= 5) return 'text-amber-600 dark:text-amber-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 8) return 'Critical';
    if (score >= 5) return 'Moderate';
    return 'Low';
  };

  const getRiskBgColor = (score: number) => {
    if (score >= 8) return 'from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800';
    if (score >= 5) return 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800';
    return 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800';
  };

  if (issues.length === 0) {
    return (
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-600" />
          <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
          <p className="text-slate-600 dark:text-slate-400">Your code analysis didn't find any issues. Great job!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="trends" className="text-xs sm:text-sm">Trends</TabsTrigger>
          <TabsTrigger value="files" className="text-xs sm:text-sm">Files</TabsTrigger>
          <TabsTrigger value="tools" className="text-xs sm:text-sm">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Risk Score Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className={`bg-gradient-to-br ${getRiskBgColor(riskScore)} card-hover animate-scale-in`}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-lg sm:text-2xl font-bold ${getRiskColor(riskScore)}`}>
                      {riskScore}/10
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Risk Score</p>
                    <p className={`text-xs font-medium ${getRiskColor(riskScore)}`}>
                      {getRiskLevel(riskScore)} Risk
                    </p>
                  </div>
                  <AlertTriangle className={`h-6 w-6 sm:h-8 sm:w-8 ${getRiskColor(riskScore)}`} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800 card-hover animate-scale-in animate-stagger-1">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-red-800 dark:text-red-200">
                      {issues.filter(i => i.type?.toLowerCase() === 'security').length}
                    </p>
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">Security Issues</p>
                  </div>
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800 card-hover animate-scale-in animate-stagger-2">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-orange-800 dark:text-orange-200">
                      {issues.filter(i => i.type?.toLowerCase() === 'bug').length}
                    </p>
                    <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400">Bug Issues</p>
                  </div>
                  <Bug className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 card-hover animate-scale-in animate-stagger-3">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-green-800 dark:text-green-200">
                      {issues.filter(i => i.type?.toLowerCase() === 'code smell').length}
                    </p>
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">Code Quality</p>
                  </div>
                  <Code className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution Pie Chart */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Severity Distribution
            </CardTitle>
            <CardDescription>Distribution of issues by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
            <CardDescription>Breakdown of issues by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Score Gauge */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Risk Assessment
            </CardTitle>
            <CardDescription>Overall risk score based on issue severity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="90%" data={riskData}>
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill={getRiskColor(riskScore)}
                />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-current text-2xl font-bold">
                  {riskScore}/10
                </text>
                <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="fill-current text-sm">
                  {getRiskLevel(riskScore)} Risk
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tool Usage Statistics */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-green-600" />
              Analysis Tool Usage
            </CardTitle>
            <CardDescription>Issues found by each analysis tool</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={toolData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tool" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="issues" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

          {/* File Impact Analysis */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-red-600" />
                Most Affected Files
                <Badge variant="outline" className="ml-auto">
                  {fileData.length} files
                </Badge>
              </CardTitle>
              <CardDescription>
                Files with the highest number of issues (Top 10)
                {fileData.length === 0 && " - No data available"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fileData.length > 0 ? (
                <div className="space-y-4">
                  {/* Mobile-friendly list view for small screens */}
                  <div className="block sm:hidden space-y-3">
                    {fileData.slice(0, 5).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={item.fullFile}>
                            {item.file}
                          </p>
                          <p className="text-xs text-slate-500">File #{index + 1}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-xs">
                            {item.issues} issues
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chart view for larger screens */}
                  <div className="hidden sm:block">
                    <ResponsiveContainer width="100%" height={Math.max(300, fileData.length * 40 + 100)}>
                      <BarChart
                        data={fileData}
                        layout="horizontal"
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          type="number"
                          stroke="#64748b"
                          fontSize={12}
                          tickFormatter={(value) => `${value} issues`}
                        />
                        <YAxis
                          dataKey="displayName"
                          type="category"
                          width={100}
                          stroke="#64748b"
                          fontSize={11}
                          interval={0}
                        />
                        <Tooltip
                          formatter={(value, name) => [`${value} issues`, 'Issues Found']}
                          labelFormatter={(label) => {
                            const item = fileData.find(d => d.displayName === label);
                            return item ? `File: ${item.fullFile}` : label;
                          }}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Bar
                          dataKey="issues"
                          fill="#ef4444"
                          radius={[0, 4, 4, 0]}
                          name="Issues"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Bug className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No File Data Available
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Upload and analyze code files to see which files have the most issues.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
