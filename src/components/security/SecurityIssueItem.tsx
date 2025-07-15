import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  CheckCircle,
  ExternalLink,
  Star,
  Brain,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { SecurityIssue } from '@/hooks/useAnalysis';
import { AIFixSuggestionsCard } from './AIFixSuggestionsCard';
import { FixSuggestion } from '@/services/aiFixSuggestionsService';
import { naturalLanguageDescriptionService } from '@/services/naturalLanguageDescriptionService';
import { toast } from 'sonner';

interface SecurityIssueItemProps {
  issue: SecurityIssue;
  isExpanded: boolean;
  onToggle: () => void;
  codeContext?: string;
  language?: string;
  framework?: string;
  onApplyFix?: (suggestion: FixSuggestion) => void;
}

export const SecurityIssueItem: React.FC<SecurityIssueItemProps> = ({
  issue,
  isExpanded,
  onToggle,
  codeContext,
  language,
  framework,
  onApplyFix
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [naturalLanguageDescription, setNaturalLanguageDescription] = useState<string>('');
  const [showNaturalLanguage, setShowNaturalLanguage] = useState<boolean>(false);

  // Generate natural language description when component mounts or issue changes
  useEffect(() => {
    const description = naturalLanguageDescriptionService.generateDescription(issue);
    setNaturalLanguageDescription(description);
  }, [issue]);

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
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 text-left hover:bg-slate-800/70 transition-colors touch-target active:scale-[0.99]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={`${getSeverityColor(issue.severity)} text-sm font-medium px-2 py-1`}>
                {issue.severity}
              </Badge>
              {issue.cvssScore && (
                <Badge variant="outline" className={`${getCVSSColor(issue.cvssScore)} text-xs hidden sm:inline-flex`}>
                  CVSS {issue.cvssScore.toFixed(1)}
                </Badge>
              )}
              {issue.confidence && (
                <Badge variant="outline" className={`${getConfidenceColor(issue.confidence)} text-xs hidden md:inline-flex`}>
                  {issue.confidence}% confidence
                </Badge>
              )}
              <Badge variant="outline" className="text-xs hidden lg:inline-flex">{issue.tool}</Badge>
            </div>
            <div className="mb-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h3 className="font-semibold text-white text-base">
                  {showNaturalLanguage ? 'Plain English Summary' : 'Technical Details'}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNaturalLanguage(!showNaturalLanguage);
                  }}
                  className="h-8 px-3 text-xs self-start sm:self-auto touch-target rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white"
                >
                  <MessageSquare className="h-3 w-3 mr-1.5" />
                  <span className="hidden sm:inline">{showNaturalLanguage ? 'Show Technical' : 'Plain English'}</span>
                  <span className="sm:hidden">{showNaturalLanguage ? 'Technical' : 'Plain'}</span>
                </Button>
              </div>
              <div className="text-sm leading-relaxed">
                {showNaturalLanguage ? (
                  <p className="text-slate-300">
                    {naturalLanguageDescription}
                  </p>
                ) : (
                  <p className="text-white font-medium">
                    {issue.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-slate-400">
              <span className="font-mono text-xs bg-slate-700 px-2 py-1 rounded">
                {issue.filename}:{issue.line}
              </span>
              {issue.category && (
                <span className="text-xs">{issue.category}</span>
              )}
            </div>
          </div>
          <div className="ml-3 flex-shrink-0 flex items-center">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-slate-400 transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-5 w-5 text-slate-400 transition-transform duration-200" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-700/50 p-4">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto bg-slate-800 p-1 rounded-lg">
              <TabsTrigger value="summary" className="flex items-center gap-1.5 text-sm py-2.5 px-3 rounded-md text-slate-300 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <MessageSquare className="h-3 w-3" />
                <span className="hidden sm:inline">Summary</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="text-sm py-2.5 px-3 rounded-md text-slate-300 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <span className="hidden sm:inline">Technical</span>
                <span className="sm:hidden">Tech</span>
              </TabsTrigger>
              <TabsTrigger value="remediation" className="text-sm py-2.5 px-3 rounded-md text-slate-300 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <span className="hidden sm:inline">Fix Guide</span>
                <span className="sm:hidden">Fix</span>
              </TabsTrigger>
              <TabsTrigger value="ai-fixes" className="hidden sm:flex items-center gap-1.5 text-sm py-2.5 px-3 rounded-md text-slate-300 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Brain className="h-3 w-3" />
                AI Fixes
              </TabsTrigger>
              <TabsTrigger value="references" className="hidden sm:block text-sm py-2.5 px-3 rounded-md text-slate-300 data-[state=active]:bg-blue-500 data-[state=active]:text-white">References</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4 mt-4">
              <div className="bg-blue-950/20 border border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-blue-100 mb-2 text-base">
                      What does this mean?
                    </h4>
                    <p className="text-blue-200 leading-relaxed text-sm">
                      {naturalLanguageDescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-amber-950/20 border border-amber-800 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-amber-100 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <span className="text-amber-600 text-sm">⚠️</span>
                    Risk Level
                  </h4>
                  <p className="text-amber-200 text-xs sm:text-sm">
                    This is a <strong>{issue.severity.toLowerCase()}</strong> severity issue that {issue.impact.toLowerCase()}.
                  </p>
                  {issue.cvssScore && (
                    <p className="text-xs sm:text-sm text-amber-300 mt-1 sm:mt-2">
                      CVSS Score: {issue.cvssScore.toFixed(1)}/10
                    </p>
                  )}
                </div>

                <div className="bg-green-950/20 border border-green-800 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-green-100 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <span className="text-green-400 text-sm">🛠️</span>
                    What to do
                  </h4>
                  <p className="text-green-200 text-xs sm:text-sm">
                    {issue.remediation.description}
                  </p>
                  <p className="text-xs sm:text-sm text-green-300 mt-1 sm:mt-2">
                    Estimated effort: <strong>{issue.remediation.effort}</strong>
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Location
                </h4>
                <p className="text-slate-300">
                  Found in <code className="bg-slate-700 px-2 py-1 rounded text-sm">{issue.filename}</code> at line <strong>{issue.line}</strong>
                </p>
                {issue.confidence && (
                  <p className="text-sm text-slate-400 mt-2">
                    Detection confidence: {issue.confidence}%
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-white">Issue Details</h4>
                  <div className="space-y-2 text-sm">
                    {issue.cweId && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-400">CWE:</span>
                        <a
                          href={`https://cwe.mitre.org/data/definitions/${issue.cweId.replace('CWE-', '')}.html`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline flex items-center gap-1"
                        >
                          {issue.cweId}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {issue.owaspCategory && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-400">OWASP:</span>
                        <span className="text-slate-300">
                          {issue.owaspCategory}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-400">Risk:</span>
                      <span className={getRiskColor(issue.riskRating)}>
                        {issue.riskRating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-400">Impact:</span>
                      <span className="text-slate-300">
                        {issue.impact}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-white">Technical Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-400">File:</span>
                      <span className="text-slate-300">
                        {issue.filename}:{issue.line}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-400">Category:</span>
                      <span className="text-slate-300">
                        {issue.category}
                      </span>
                    </div>
                    {issue.tool && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-400">Detected by:</span>
                        <Badge variant="outline" size="sm" className="text-slate-300 border-slate-600">
                          {issue.tool}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="remediation" className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-white">Remediation Guidance</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-300">
                    {issue.remediation.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-400">Effort:</span>
                    <Badge variant="outline" size="sm" className="text-slate-300 border-slate-600">
                      {issue.remediation.effort}
                    </Badge>
                    <span className="font-medium text-slate-400">Priority:</span>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < issue.remediation.priority
                              ? 'text-yellow-400 fill-current'
                              : 'text-slate-600'
                          }`}
                        />
                      ))}
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
                        <h4 className="font-semibold text-red-400">Vulnerable Code</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(issue.remediation.codeExample!, 'Vulnerable code')}
                          className="text-slate-300 border-slate-600 hover:bg-slate-700"
                        >
                          {copiedCode === 'Vulnerable code' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="bg-red-950/20 p-3 rounded border border-red-800 text-sm overflow-x-auto">
                        <code className="text-red-200">{issue.remediation.codeExample}</code>
                      </pre>
                    </div>
                  )}

                  {issue.remediation.fixExample && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-green-400">Fixed Code</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(issue.remediation.fixExample!, 'Fixed code')}
                          className="text-slate-300 border-slate-600 hover:bg-slate-700"
                        >
                          {copiedCode === 'Fixed code' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="bg-green-950/20 p-3 rounded border border-green-800 text-sm overflow-x-auto">
                        <code className="text-green-200">{issue.remediation.fixExample}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai-fixes" className="space-y-4">
              {codeContext && language ? (
                <AIFixSuggestionsCard
                  issue={issue}
                  codeContext={codeContext}
                  language={language}
                  framework={framework}
                  onApplyFix={onApplyFix}
                />
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300 mb-2">
                    AI fix suggestions require code context
                  </p>
                  <p className="text-sm text-slate-400">
                    Upload a file with this issue to get AI-powered fix suggestions
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="references" className="space-y-4">
              {issue.references && issue.references.length > 0 ? (
                <div>
                  <h4 className="font-semibold mb-2 text-white">External References</h4>
                  <div className="space-y-1">
                    {issue.references.map((ref, index) => (
                      <a
                        key={index}
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline text-sm flex items-center gap-1"
                      >
                        {ref}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ExternalLink className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300">
                    No external references available for this issue
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};