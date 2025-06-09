import React from 'react';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Clock, 
  FileText,
  Bug,
  Code,
  Zap,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SecurityMetricsDashboardProps {
  results: AnalysisResults;
}

export const SecurityMetricsDashboard: React.FC<SecurityMetricsDashboardProps> = ({ results }) => {
  // Prepare data for charts
  const severityData = [
    { name: 'Critical', value: results.summary.criticalIssues, color: '#8B5CF6' },
    { name: 'High', value: results.summary.highIssues, color: '#EF4444' },
    { name: 'Medium', value: results.summary.mediumIssues, color: '#F59E0B' },
    { name: 'Low', value: results.summary.lowIssues, color: '#3B82F6' }
  ];

  const owaspData = results.issues.reduce((acc, issue) => {
    if (issue.owaspCategory) {
      const category = issue.owaspCategory.split(' – ')[1] || issue.owaspCategory;
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const owaspChartData = Object.entries(owaspData).map(([name, value]) => ({
    name: name.length > 20 ? name.substring(0, 17) + '...' : name,
    value,
    fullName: name
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${getScoreBgColor(results.summary.securityScore)} border-0`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Security Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(results.summary.securityScore)}`}>
                  {results.summary.securityScore}/100
                </p>
              </div>
              <Shield className={`h-8 w-8 ${getScoreColor(results.summary.securityScore)}`} />
            </div>
            <Progress 
              value={results.summary.securityScore} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className={`${getScoreBgColor(results.summary.qualityScore)} border-0`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Quality Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(results.summary.qualityScore)}`}>
                  {results.summary.qualityScore}/100
                </p>
              </div>
              <Code className={`h-8 w-8 ${getScoreColor(results.summary.qualityScore)}`} />
            </div>
            <Progress 
              value={results.summary.qualityScore} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Vulnerability Density</p>
                <p className="text-2xl font-bold text-blue-600">
                  {results.metrics.vulnerabilityDensity}
                </p>
                <p className="text-xs text-slate-500">per 1000 lines</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Technical Debt</p>
                <p className="text-2xl font-bold text-purple-600">
                  {results.metrics.technicalDebt}
                </p>
                <p className="text-xs text-slate-500">estimated</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Issue Severity Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of security issues by severity level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
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
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {severityData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* OWASP Top 10 Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              OWASP Top 10 Categories
            </CardTitle>
            <CardDescription>
              Security issues mapped to OWASP Top 10 2021
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={owaspChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name, props) => [value, props.payload.fullName]}
                  />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Coverage Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Files Analyzed</span>
              <Badge variant="outline">{results.totalFiles}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Lines of Code</span>
              <Badge variant="outline">{results.summary.linesAnalyzed.toLocaleString()}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Coverage</span>
              <Badge variant="outline">{results.summary.coveragePercentage}%</Badge>
            </div>
            <Progress value={results.summary.coveragePercentage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Quality Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Maintainability Index</span>
              <Badge variant="outline">{results.metrics.maintainabilityIndex}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Duplicated Lines</span>
              <Badge variant="outline">{results.metrics.duplicatedLines}</Badge>
            </div>
            {results.metrics.testCoverage && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Test Coverage</span>
                <Badge variant="outline">{results.metrics.testCoverage}%</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Dependencies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.dependencies && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Dependencies</span>
                  <Badge variant="outline">{results.dependencies.total}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Vulnerable</span>
                  <Badge variant="destructive">{results.dependencies.vulnerable}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Outdated</span>
                  <Badge variant="secondary">{results.dependencies.outdated}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Secure</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {results.dependencies.total - results.dependencies.vulnerable - results.dependencies.outdated}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
          <CardDescription>
            Priority actions to improve your security posture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.summary.criticalIssues > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">
                    Address {results.summary.criticalIssues} critical security issues immediately
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    These issues pose immediate security risks and should be fixed as soon as possible.
                  </p>
                </div>
              </div>
            )}
            
            {results.summary.securityScore < 70 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Improve security score to at least 70
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Focus on high and medium severity issues to improve overall security posture.
                  </p>
                </div>
              </div>
            )}

            {results.dependencies && results.dependencies.vulnerable > 0 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Zap className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">
                    Update {results.dependencies.vulnerable} vulnerable dependencies
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Outdated dependencies may contain known security vulnerabilities.
                  </p>
                </div>
              </div>
            )}

            {results.summary.securityScore >= 80 && results.summary.criticalIssues === 0 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Excellent security posture!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Your code demonstrates good security practices. Continue monitoring for new issues.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
