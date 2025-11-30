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
import { FixSuggestion } from '@/services/ai/aiFixSuggestionsService';
import { naturalLanguageDescriptionService } from '@/services/ai/naturalLanguageDescriptionService';
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
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNaturalLanguage(!showNaturalLanguage);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowNaturalLanguage(!showNaturalLanguage);
                    }
                  }}
                  className="h-8 px-3 text-xs self-start sm:self-auto touch-target rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer inline-flex items-center transition-colors"
                >
                  <MessageSquare className="h-3 w-3 mr-1.5" />
                  <span className="hidden sm:inline">{showNaturalLanguage ? 'Show Technical' : 'Plain English'}</span>
                  <span className="sm:hidden">{showNaturalLanguage ? 'Technical' : 'Plain'}</span>
                </div>
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
        <div className="border-t border-slate-700/50 p-3 sm:p-4">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="flex w-full overflow-x-auto bg-slate-800 p-1 rounded-lg gap-1 mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] sm:flex sm:flex-wrap sm:justify-start">
              <TabsTrigger 
                value="summary" 
                className="flex-shrink-0 min-w-[100px] sm:w-auto flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2 px-3 rounded-md text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all touch-target"
              >
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Summary</span>
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                className="flex-shrink-0 min-w-[100px] sm:w-auto flex items-center justify-center text-xs sm:text-sm py-2 px-3 rounded-md text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all touch-target"
              >
                <span>Technical</span>
              </TabsTrigger>
              <TabsTrigger 
                value="remediation" 
                className="flex-shrink-0 min-w-[100px] sm:w-auto flex items-center justify-center text-xs sm:text-sm py-2 px-3 rounded-md text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all touch-target"
              >
                <span>Fix Guide</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ai-fixes" 
                className="flex-shrink-0 min-w-[100px] sm:w-auto flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2 px-3 rounded-md text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all touch-target"
              >
                <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>AI Fixes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="references" 
                className="flex-shrink-0 min-w-[100px] sm:w-auto flex items-center justify-center text-xs sm:text-sm py-2 px-3 rounded-md text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all touch-target"
              >
                <span>References</span>
              </TabsTrigger>
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

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-white mb-2 text-sm sm:text-base">
                  Location
                </h4>
                <div className="text-slate-300 text-xs sm:text-sm space-y-1.5">
                  <p>
                    Found in <code className="bg-slate-700 px-1.5 py-0.5 rounded text-xs sm:text-sm break-all">{issue.filename}</code>
                  </p>
                  <p>
                    at line <strong className="text-white">{issue.line}</strong>
                  </p>
                </div>
                {issue.confidence && (
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 pt-2 border-t border-slate-700/50">
                    Detection confidence: <strong className="text-white">{issue.confidence}%</strong>
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {/* Issue Details Section */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold mb-3 text-white text-base flex items-center gap-2">
                    <span className="text-blue-400">ℹ️</span>
                    Issue Details
                  </h4>
                  <div className="space-y-2.5 text-sm">
                    {issue.cweId && (
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 py-2 border-b border-slate-700/50 last:border-0">
                        <span className="font-medium text-slate-400 min-w-[80px] text-xs sm:text-sm">CWE:</span>
                        <a
                          href={`https://cwe.mitre.org/data/definitions/${issue.cweId.replace('CWE-', '')}.html`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline flex items-center gap-1.5 touch-target-lg"
                        >
                          <span className="text-sm sm:text-base">{issue.cweId}</span>
                          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                        </a>
                      </div>
                    )}
                    {issue.owaspCategory && (
                      <div className="flex flex-col xs:flex-row xs:items-start gap-1 xs:gap-2 py-2 border-b border-slate-700/50 last:border-0">
                        <span className="font-medium text-slate-400 min-w-[80px] text-xs sm:text-sm flex-shrink-0">OWASP:</span>
                        <span className="text-slate-300 text-sm sm:text-base break-words">
                          {issue.owaspCategory}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 py-2 border-b border-slate-700/50 last:border-0">
                      <span className="font-medium text-slate-400 min-w-[80px] text-xs sm:text-sm">Risk:</span>
                      <span className={`${getRiskColor(issue.riskRating)} font-semibold text-sm sm:text-base`}>
                        {issue.riskRating}
                      </span>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1 xs:gap-2 py-2">
                      <span className="font-medium text-slate-400 min-w-[80px] text-xs sm:text-sm flex-shrink-0">Impact:</span>
                      <span className="text-slate-300 text-sm sm:text-base break-words">
                        {issue.impact}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technical Information Section */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold mb-3 text-white text-base flex items-center gap-2">
                    <span className="text-purple-400">⚙️</span>
                    Technical Information
                  </h4>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex flex-col gap-1 py-2 border-b border-slate-700/50 last:border-0">
                      <span className="font-medium text-slate-400 text-xs sm:text-sm">File:</span>
                      <span className="font-mono text-xs sm:text-sm bg-slate-700 px-2.5 py-1.5 rounded text-slate-300 break-all">
                        {issue.filename}:{issue.line}
                      </span>
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-start gap-1 xs:gap-2 py-2 border-b border-slate-700/50 last:border-0">
                      <span className="font-medium text-slate-400 min-w-[80px] text-xs sm:text-sm flex-shrink-0">Category:</span>
                      <span className="text-slate-300 text-sm sm:text-base break-words">
                        {issue.category}
                      </span>
                    </div>
                    {issue.tool && (
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 py-2">
                        <span className="font-medium text-slate-400 min-w-[80px] text-xs sm:text-sm">Detected by:</span>
                        <Badge variant="outline" className="text-slate-300 border-slate-600 self-start xs:self-auto text-xs sm:text-sm">
                          {issue.tool}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="remediation" className="space-y-3 sm:space-y-4">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold mb-3 text-white text-base flex items-center gap-2">
                  <span className="text-green-400">🛠️</span>{' '}
                  Remediation Guidance
                </h4>
                <div className="space-y-3 text-sm">
                  <p className="text-slate-300 leading-relaxed">
                    {issue.remediation.description}
                  </p>
                  <div className="flex flex-col xs:flex-row xs:items-center gap-3 pt-2 border-t border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-400 text-xs sm:text-sm">Effort:</span>
                      <Badge variant="outline" className="text-slate-300 border-slate-600 text-xs sm:text-sm">
                        {issue.remediation.effort}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-400 text-xs sm:text-sm">Priority:</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
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
              </div>

              {/* Code Examples */}
              {(issue.codeSnippet || issue.remediation.codeExample) && (
                <div className="space-y-3 sm:space-y-4">
                  {issue.remediation.codeExample && (
                    <div className="bg-red-950/20 border border-red-800 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <h4 className="font-semibold text-red-400 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-lg">⚠️</span>{' '}
                          Vulnerable Code
                        </h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(issue.remediation.codeExample!, 'Vulnerable code')}
                          className="text-slate-300 border-slate-600 hover:bg-slate-700 px-2 sm:px-3 touch-target"
                        >
                          {copiedCode === 'Vulnerable code' ? (
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          )}
                          <span className="ml-1.5 hidden sm:inline text-xs">Copy</span>
                        </Button>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg overflow-hidden">
                        <pre className="p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto">
                          <code className="text-red-200">{issue.remediation.codeExample}</code>
                        </pre>
                      </div>
                    </div>
                  )}

                  {issue.remediation.fixExample && (
                    <div className="bg-green-950/20 border border-green-800 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <h4 className="font-semibold text-green-400 text-sm sm:text-base flex items-center gap-2">
                          <span className="text-lg">✅</span>{' '}
                          Fixed Code
                        </h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(issue.remediation.fixExample!, 'Fixed code')}
                          className="text-slate-300 border-slate-600 hover:bg-slate-700 px-2 sm:px-3 touch-target"
                        >
                          {copiedCode === 'Fixed code' ? (
                            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          )}
                          <span className="ml-1.5 hidden sm:inline text-xs">Copy</span>
                        </Button>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg overflow-hidden">
                        <pre className="p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto">
                          <code className="text-green-200">{issue.remediation.fixExample}</code>
                        </pre>
                      </div>
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
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold mb-3 text-white text-base flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-blue-400" />
                    External References
                  </h4>
                  <div className="space-y-2">
                    {issue.references.map((ref) => (
                      <a
                        key={ref}
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline text-xs sm:text-sm flex items-start gap-2 p-2 rounded hover:bg-slate-700/50 transition-colors break-all touch-target"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <span className="break-all">{ref}</span>
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