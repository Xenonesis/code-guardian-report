import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Bug, 
  Code, 
  ExternalLink, 
  Star, 
  Target, 
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Copy,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecurityIssue, AnalysisResults } from '@/hooks/useAnalysis';
import { SecurityMetricsDashboard } from '@/components/SecurityMetricsDashboard';
import { AISecurityInsights } from '@/components/AISecurityInsights';
import { toast } from 'sonner';

interface EnhancedSecurityResultsProps {
  results: AnalysisResults;
}

export const EnhancedSecurityResults: React.FC<EnhancedSecurityResultsProps> = ({ results }) => {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const toggleIssueExpansion = (issueId: string) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId);
    } else {
      newExpanded.add(issueId);
    }
    setExpandedIssues(newExpanded);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(type);
      toast.success(`${type} copied to clipboard`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300';
      case 'High': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'text-purple-600 dark:text-purple-400';
      case 'High': return 'text-red-600 dark:text-red-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 dark:text-green-400';
    if (confidence >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getCVSSColor = (score: number) => {
    if (score >= 9.0) return 'text-purple-600 dark:text-purple-400';
    if (score >= 7.0) return 'text-red-600 dark:text-red-400';
    if (score >= 4.0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="space-y-6">
      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Security Overview</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Enhanced Summary Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                  {results.summary.securityScore}
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400">Security Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                  {results.summary.criticalIssues + results.summary.highIssues}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">Critical & High</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {results.metrics.vulnerabilityDensity}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Vuln/1000 Lines</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {results.summary.qualityScore}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">Quality Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Issues List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Issues ({results.issues.length})
          </CardTitle>
          <CardDescription>
            Comprehensive security analysis with OWASP classifications and CVSS scoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.issues.map((issue) => (
              <div key={issue.id} className="border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleIssueExpansion(issue.id)}
                  className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                        {issue.cvssScore && (
                          <Badge variant="outline" className={getCVSSColor(issue.cvssScore)}>
                            CVSS {issue.cvssScore.toFixed(1)}
                          </Badge>
                        )}
                        {issue.confidence && (
                          <Badge variant="outline" className={getConfidenceColor(issue.confidence)}>
                            {issue.confidence}% confidence
                          </Badge>
                        )}
                        <Badge variant="outline">{issue.tool}</Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {issue.message}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {issue.filename}:{issue.line}
                        {issue.category && ` • ${issue.category}`}
                      </p>
                    </div>
                    <div className="ml-4">
                      {expandedIssues.has(issue.id) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </button>

                {expandedIssues.has(issue.id) && (
                  <div className="border-t bg-slate-50 dark:bg-slate-800/50 p-4 space-y-4">
                    {/* Issue Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Issue Details</h4>
                        <div className="space-y-2 text-sm">
                          {issue.cweId && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">CWE:</span>
                              <a 
                                href={`https://cwe.mitre.org/data/definitions/${issue.cweId.replace('CWE-', '')}.html`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {issue.cweId}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                          {issue.owaspCategory && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">OWASP:</span>
                              <span className="text-slate-600 dark:text-slate-400">
                                {issue.owaspCategory}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Risk:</span>
                            <span className={getRiskColor(issue.riskRating)}>
                              {issue.riskRating}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Impact:</span>
                            <span className="text-slate-600 dark:text-slate-400">
                              {issue.impact}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Remediation</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-slate-600 dark:text-slate-400">
                            {issue.remediation.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Effort:</span>
                            <Badge variant="outline" size="sm">
                              {issue.remediation.effort}
                            </Badge>
                            <span className="font-medium">Priority:</span>
                            <div className="flex">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < issue.remediation.priority
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Code Examples */}
                    {(issue.codeSnippet || issue.remediation.codeExample) && (
                      <div className="space-y-4">
                        {issue.remediation.codeExample && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-red-600">Vulnerable Code</h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(issue.remediation.codeExample!, 'Vulnerable code')}
                              >
                                {copiedCode === 'Vulnerable code' ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <pre className="bg-red-50 dark:bg-red-950/20 p-3 rounded border text-sm overflow-x-auto">
                              <code>{issue.remediation.codeExample}</code>
                            </pre>
                          </div>
                        )}

                        {issue.remediation.fixExample && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-green-600">Fixed Code</h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(issue.remediation.fixExample!, 'Fixed code')}
                              >
                                {copiedCode === 'Fixed code' ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <pre className="bg-green-50 dark:bg-green-950/20 p-3 rounded border text-sm overflow-x-auto">
                              <code>{issue.remediation.fixExample}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* References */}
                    {issue.references && issue.references.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">References</h4>
                        <div className="space-y-1">
                          {issue.references.map((ref, index) => (
                            <a
                              key={index}
                              href={ref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                            >
                              {ref}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="ai-insights">
          <AISecurityInsights results={results} />
        </TabsContent>

        <TabsContent value="metrics">
          <SecurityMetricsDashboard results={results} />
        </TabsContent>


      </Tabs>
    </div>
  );
};
