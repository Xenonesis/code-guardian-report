import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  Lightbulb,
  Code,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  Copy,
  Download,
  Play,
  ChevronDown,
  ChevronRight,
  Loader2,
  Zap,
  Shield,
  Target,
  Info
} from 'lucide-react';
import { SecurityIssue } from '@/hooks/useAnalysis';
import { FixSuggestion, AIFixSuggestionsService, FixSuggestionRequest } from '@/services/aiFixSuggestionsService';
import { toast } from 'sonner';

interface AIFixSuggestionsCardProps {
  issue: SecurityIssue;
  codeContext: string;
  language: string;
  framework?: string;
  onApplyFix?: (suggestion: FixSuggestion) => void;
}

export const AIFixSuggestionsCard: React.FC<AIFixSuggestionsCardProps> = ({
  issue,
  codeContext,
  language,
  framework,
  onApplyFix
}) => {
  const [suggestions, setSuggestions] = useState<FixSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [fixService] = useState(() => new AIFixSuggestionsService());

  const generateFixSuggestions = useCallback(async () => {
    // Don't generate if no code context
    if (!codeContext || codeContext.trim() === '') {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: FixSuggestionRequest = {
        issue,
        codeContext,
        language,
        framework
      };

      const fixSuggestions = await fixService.generateFixSuggestions(request);
      setSuggestions(fixSuggestions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate fix suggestions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [issue, codeContext, language, framework, fixService]);

  useEffect(() => {
    // Only generate suggestions if we have code context
    if (codeContext && codeContext.trim() !== '') {
      generateFixSuggestions();
    }
  }, [generateFixSuggestions, codeContext]);



  const toggleSuggestionExpansion = (suggestionId: string) => {
    setExpandedSuggestion(
      expandedSuggestion === suggestionId ? null : suggestionId
    );
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(label);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const renderPriorityStars = (priority: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < priority
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Fix Suggestions
            <Badge variant="outline" className="text-purple-600 border-purple-300">
              Generating...
            </Badge>
          </CardTitle>
          <CardDescription>
            AI is analyzing the vulnerability and generating fix suggestions...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-3 text-slate-600 dark:text-slate-400">
              Generating intelligent fix suggestions...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!codeContext || codeContext.trim() === '') {
    return (
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-yellow-600" />
            AI Fix Suggestions
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              Code Required
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              AI fix suggestions require code context
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-900/20 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-red-600" />
            AI Fix Suggestions
            <Badge variant="outline" className="text-red-600 border-red-300">
              Error
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <Button
            onClick={generateFixSuggestions}
            className="mt-4"
            variant="outline"
          >
            <Zap className="h-4 w-4 mr-2" />
            Retry Generation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Fix Suggestions ({suggestions?.length || 0})
          <Badge variant="outline" className="text-purple-600 border-purple-300">
            AI-Powered
          </Badge>
        </CardTitle>
        <CardDescription>
          Intelligent fix suggestions with confidence scores and implementation guidance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!suggestions || suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              No fix suggestions available for this issue.
            </p>
            <Button 
              onClick={generateFixSuggestions} 
              className="mt-4"
              variant="outline"
            >
              <Zap className="h-4 w-4 mr-2" />
              Generate Suggestions
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions?.map((suggestion) => (
              <div key={suggestion.id} className="border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSuggestionExpansion(suggestion.id)}
                  className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getConfidenceColor(suggestion.confidence)}>
                          {suggestion.confidence}% confidence
                        </Badge>
                        <Badge className={getEffortColor(suggestion.effort)}>
                          {suggestion.effort} effort
                        </Badge>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">Priority:</span>
                          <div className="flex">
                            {renderPriorityStars(suggestion.priority)}
                          </div>
                        </div>
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {suggestion.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {suggestion.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      {expandedSuggestion === suggestion.id ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </button>

                {expandedSuggestion === suggestion.id && (
                  <div className="border-t bg-slate-50 dark:bg-slate-800/50 p-4">
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="code">Code Changes</TabsTrigger>
                        <TabsTrigger value="testing">Testing</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Explanation
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {suggestion.explanation}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Security Benefit
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {suggestion.securityBenefit}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Risk Assessment
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {suggestion.riskAssessment}
                          </p>
                        </div>

                        {suggestion.relatedPatterns.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Related Security Patterns</h4>
                            <div className="flex flex-wrap gap-2">
                              {suggestion.relatedPatterns.map((pattern, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {pattern}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="code" className="space-y-4">
                        {suggestion.codeChanges.map((change, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm">
                                {change.type.charAt(0).toUpperCase() + change.type.slice(1)} in {change.filename}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                Lines {change.startLine}-{change.endLine}
                              </Badge>
                            </div>
                            
                            {change.originalCode && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-red-600">Before:</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(change.originalCode, `Original code ${index + 1}`)}
                                  >
                                    {copiedCode === `Original code ${index + 1}` ? (
                                      <CheckCircle className="h-4 w-4" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                                <pre className="bg-red-50 dark:bg-red-950/20 p-3 rounded border text-sm overflow-x-auto">
                                  <code>{change.originalCode}</code>
                                </pre>
                              </div>
                            )}

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-green-600">After:</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(change.suggestedCode, `Suggested code ${index + 1}`)}
                                >
                                  {copiedCode === `Suggested code ${index + 1}` ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <pre className="bg-green-50 dark:bg-green-950/20 p-3 rounded border text-sm overflow-x-auto">
                                <code>{change.suggestedCode}</code>
                              </pre>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                              {change.reasoning}
                            </p>
                          </div>
                        ))}

                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={() => onApplyFix?.(suggestion)}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Apply Fix
                          </Button>
                          <Button
                            onClick={() => copyToClipboard(
                              suggestion.codeChanges.map(c => c.suggestedCode).join('\n\n'),
                              'All suggested code'
                            )}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export Changes
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="testing" className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Testing Recommendations
                          </h4>
                          <ul className="space-y-2">
                            {suggestion.testingRecommendations.map((test, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-600 dark:text-slate-400">{test}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>

                      <TabsContent value="security" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Security Metrics</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Confidence:</span>
                                <Badge className={getConfidenceColor(suggestion.confidence)}>
                                  {suggestion.confidence}%
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span>Implementation Effort:</span>
                                <Badge className={getEffortColor(suggestion.effort)}>
                                  {suggestion.effort}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Priority:</span>
                                <div className="flex">
                                  {renderPriorityStars(suggestion.priority)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {suggestion.frameworkSpecific && (
                            <div>
                              <h4 className="font-semibold mb-2">Framework-Specific</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Framework:</span>
                                  <Badge variant="outline">{suggestion.frameworkSpecific.framework}</Badge>
                                </div>
                                {suggestion.frameworkSpecific.version && (
                                  <div className="flex justify-between">
                                    <span>Version:</span>
                                    <span className="text-slate-600 dark:text-slate-400">
                                      {suggestion.frameworkSpecific.version}
                                    </span>
                                  </div>
                                )}
                                {suggestion.frameworkSpecific.dependencies && (
                                  <div>
                                    <span className="font-medium">Dependencies:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {suggestion.frameworkSpecific.dependencies.map((dep, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {dep}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
